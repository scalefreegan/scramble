import sys, os
import site
import re
from functools import partial
import pandas as pd
import collections
import matplotlib.cm as cm
import multiprocessing as mp
import tempfile
import pybedtools
pybedtools.set_tempdir('/tmpdata/brooks/tmp')
from pybedtools.featurefuncs import three_prime
import pysam
import json
import shutil
import subprocess
import uuid
import numpy as np
from itertools import chain
from colour import Color
import matplotlib as mpl
import pdb
import glob
from scipy.stats import ks_2samp

import warnings

if not sys.warnoptions:
    warnings.simplefilter("ignore")


sys.path.append("/g/steinmetz/project/IESY/software/scrambleTools/scrambleTools/scrambleMapper/")
from scrambleMapper import readGFF, writeGFF, addSeg

blacklist = ['restriction_enzyme_recognition_site',
            "engineered_region",
            "PCR_product",
            "tag",
            'stop_retained_variant',
            "centromere_DNA_Element_II",
            "synonymous_codon",
            # "ncRNA_gene",
            "ARS",
            "region",
            "ARS_consensus_sequence",
            # "CUT",
            # "XUT",
            "blocked_reading_frame",
            "mRNA",
            "CDS",
            'centromere_DNA_Element_III']

def getGenomeSegOrder(to_fa, synchr,
                      seg_file = "/g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scramble/SynIXR_segmentTable.txt",
                      blatPath = ("/g/steinmetz/brooks/anaconda3/"
                                  "envs/blat/bin/blat")):
    # DONT DEFINE THIS NEW!! USE EXISITING GFF
    def getSegOrient(x):
        m = re.search('ID=(.+?)(-.+)?;', x["attribute"])
        seg = int(m.group(1))
        if x["strand"] == "-":
            seg = seg * -1
        return(seg)
    segGFF = addSeg(to_fa, seg_file, gff = None, onlyHighest=True,
              correct_tRNA=True, enforceLen=False, use="mummer",
              blatPath = ("/g/steinmetz/brooks/anaconda3/"
                          "envs/blat/bin/blat"),
              usemp=True, nproc=32, unmapped = None, verbose = False)
    segGFF = segGFF.reset_index().sort_values(["seqname", "start", "end"]).reset_index(drop = True)
    if type(synchr) is str:
        synchr = [synchr]
    segGFF = segGFF.loc[segGFF["seqname"].isin(synchr)]
    if segGFF.shape[0] < 1:
        print("Chrs {} not present in fasta file: {}".format(synchr, to_fa))
        segorder = None
    else:
        segorder = [i for i in segGFF.apply(getSegOrient, axis = 1)]
    return(segorder)

def getNovelJunctions(segorderlist, circular):
    o = {}
    for i in range(len(segorderlist)):
        if i == (len(segorderlist)-1):
            if circular:
                # last
                dif = abs(segorderlist[i] - segorderlist[0])
            else:
                dif = 1
        else:
            dif = abs(segorderlist[i] - segorderlist[i+1])
        if dif > 1:
            if i == (len(segorderlist)-1):
                thesesegs = (segorderlist[i],segorderlist[0])
            else:
                thesesegs = (segorderlist[i],segorderlist[i+1])

            if (thesesegs in o.keys()):
                o[thesesegs] = o[thesesegs] + 1
            elif (tuple([-1* i for i in reversed(thesesegs)]) in o.keys()):
                o[tuple([-1* i for i in reversed(thesesegs)])] = o[tuple([-1* i for i in reversed(thesesegs)])] + 1
            else:
                o[thesesegs] = 1
    return(o)

def getAdjacentSegmentAnnotations(x, gff, direction = ["upstream", "downstream"][0], circular = True):
    x = x.reset_index(drop=True)
    x = x.iloc[0]
    #print("failing here")
    #print("this is x: {}".format(x))
    segs = gff.loc[gff["feature"] == "engineered_region"].reset_index(drop=True)
    #print(x)
    #print(segs)
    thisseg = segs.loc[(segs["seqname"] == x["seqname"]) & (segs["start"] == x["start"]) & (segs["end"] == x["end"])].index
    #print(thisseg)
    if direction == "upstream":
        a_seg = thisseg - 1
        if (a_seg < 0) and (circular is False):
            a_seg = 0
            keep_going = False
        else:
            keep_going = True
    else:
        a_seg = thisseg + 1
        if (a_seg > segs.shape[0]-1) and (circular is False):
            a_seg = segs.shape[0]-1
            keep_going = False
        elif (a_seg > segs.shape[0]-1) and (circular):
            a_seg = 0
            keep_going = True
        else:
            keep_going = True
    #print(a_seg)
    if type(a_seg) == int:
        a_seg = pd.Index([a_seg])

    try:
        neighbor_seg = segs.iloc[a_seg]
        neighbor_seg = neighbor_seg.assign(position = x["position"],
                                   segs =x["segs"])
    except:
        pdb.set_trace()


    if type(neighbor_seg) == pd.core.series.Series:
        new_chr = str(neighbor_seg['seqname'])
        new_s = int(neighbor_seg['start'])
        new_e =  int(neighbor_seg['end'])
    else:
        new_chr = str(neighbor_seg['seqname'].iloc[0])
        new_s = int(neighbor_seg['start'].iloc[0])
        new_e =  int(neighbor_seg['end'].iloc[0])
    #print(new_chr, new_s, new_e)
    neighbor = gff.loc[ (gff['seqname'] == new_chr) &
                        (gff['start']  >= new_s) &
                        (gff['end']  <= new_e) ]
    neighbor = neighbor.assign(position = x["position"],
                               segs =x["segs"])

    print("This is neighbor")
    print(neighbor)

    print("This is neighbor seg")
    print(neighbor_seg)

    if type(neighbor_seg) == pd.core.series.Series:
        neighbor_seg = pd.DataFrame(neighbor_seg).transpose()
        print(neighbor_seg)

    return(neighbor, neighbor_seg, keep_going)

def getAdjacentAnnotation(x,
                          direction = ["upstream", "downstream"][0],
                          gff_loc = "/g/steinmetz/project/IESY/genomes/annotations/scramble/gff/",
                          blacklist_add = ["engineered_region","site_specific_recombination_target_region"],
                          circular = False,
                          genomeIndexLoc = "/g/steinmetz/project/IESY/genomes/synIXR_scramble/genomes/"):

    strain = x["scrambleObj"].split("_")[0]
    gff = readGFF(os.path.join(gff_loc, strain+".gff"))
    p = re.compile(r'(?:ID=)(.*?)([-][0-9]+)?;')
    m = p.search(x["attributes"])

    if blacklist_add is not None:
        if type(blacklist_add) == str:
            blacklist_add = list(blacklist_add)
        for i in blacklist_add:
            blacklist.append(i)

    gff = gff.loc[~gff["feature"].isin(blacklist)]

    if direction == "upstream":
        gff_sub = gff.loc[(gff.index.get_level_values('seqname') == x["chrom"]) & (gff.index.get_level_values('end') < x["start"])]
        gff_sub = gff_sub.reset_index(drop=False)
        gff_sub["dist"] = [abs(x["start"] - i) for i in gff_sub["end"]]
        if circular:
            thischrlen = pd.read_csv(os.path.join(genomeIndexLoc, strain+"_ERCC92.genome"),sep="\t", header=None)
            thislen = int(thischrlen.loc[thischrlen[0]==x["chrom"]][1])
            gff_alt = gff.loc[(gff.index.get_level_values('seqname') == x["chrom"]) & (gff.index.get_level_values('end') > x["start"])]
            gff_alt = gff_alt.reset_index(drop=False)
            gff_alt["dist"] = [abs(x["end"] - thislen - i) for i in gff_alt["start"]]
            gff_sub = pd.concat([gff_sub,gff_alt])
        gff_sub = gff_sub.sort_values(["dist"])
        # drop same gene features
        if m:
            thisid = m.group(1)
            gff_sub = gff_sub.loc[~gff_sub["attribute"].str.contains(thisid)]
        else:
            print("no match")
    elif direction == "downstream":
        gff_sub = gff.loc[(gff.index.get_level_values('seqname') == x["chrom"]) & (gff.index.get_level_values('start') > x["end"])]
        gff_sub = gff_sub.reset_index(drop=False)
        gff_sub["dist"] = [abs(x["end"] - i) for i in gff_sub["start"]]
        if circular:
            thischrlen = pd.read_csv(os.path.join(genomeIndexLoc, strain+"_ERCC92.genome"),sep="\t", header=None)
            thislen = int(thischrlen.loc[thischrlen[0]==x["chrom"]][1])
            gff_alt = gff.loc[(gff.index.get_level_values('seqname') == x["chrom"]) & (gff.index.get_level_values('start') < x["end"])]
            gff_alt = gff_alt.reset_index(drop=False)
            gff_alt["dist"] = [abs(x["end"] - thislen - i) for i in gff_alt["start"]]
            gff_sub = pd.concat([gff_sub,gff_alt])
        gff_sub = gff_sub.sort_values(["dist"])
        # drop same gene features
        if m:
            thisid = m.group(1)
            gff_sub = gff_sub.loc[~gff_sub["attribute"].str.contains(thisid)]
        else:
            print("no match")

    return(gff_sub.iloc[0])

def utrFilter(x,position, seg, minOvlp = 15):
    # filter out utrs that shouldn't be there

    def getOvp(x,seg):
        r1 = range(x["start"],x["end"])
        r2 = range(seg.iloc[0]["start"],seg.iloc[0]["end"])
        xs = set(r1)
        return(len(xs.intersection(r2)))
    utr = x.loc[x["feature"].isin(["three_prime_UTR","five_prime_UTR"])]
    utr = utr.assign(ovlp = [getOvp(i[1],seg) for i in utr.iterrows()])
    #pdb.set_trace()
    utr = utr.loc[utr["ovlp"]>=minOvlp]
    utr = utr.drop(columns = "ovlp")

    gene = x.loc[x["feature"].isin(["gene"])]
    gene = gene.assign(thisfeature = [i.split(";")[0].split("=")[1].split("_")[0] \
                                    for i in gene["attribute"]])
    gene = gene.assign(thisfeature2 = [re.sub("-[1-9]","",i) for i in gene["thisfeature"]])

    others =  x.loc[~x["feature"].isin(["three_prime_UTR","five_prime_UTR"])]
    allanns = readGFF("/g/steinmetz/project/IESY/genomes/annotations/scramble/gff/JS94.gff")
    allgenes = allanns.loc[allanns["feature"]=="gene"].sort_values(["seqname","start","end"]).reset_index(drop=True)
    allgenes = allgenes.assign(thisfeature = [i.split(";")[0].split("=")[1].split("_")[0] \
                                    for i in allgenes["attribute"]])
    allgenes = allgenes.assign(thisfeature2 = [re.sub("-[1-9]","",i) for i in allgenes["thisfeature"]])
    thesegenescommon = pd.merge(allgenes,gene,how="outer",
                                on = ["thisfeature2"],
                                indicator = True)
    thesegenescommon =  [range(i-3,i+3) for i in thesegenescommon.loc[thesegenescommon["_merge"]=="both"].index]
    if len(thesegenescommon) > 0:
        #pdb.set_trace()
        try:
            thesegenescommon = allgenes.iloc[[x for x in set([j for i in thesegenescommon for j in i]) if x >= 0]]
        except:
            pdb.set_trace()
    else:
        thesegenescommon = allgenes.loc[allgenes["attribute"]=="doesn't exist"]

    def checkInverted(x):
        segs = x["segs"].split(":")
        if x["position"] == "first":
            thisseg = int(segs[0])
        else:
            thisseg = int(segs[1])
        if thisseg < 0:
            return(True)
        else:
            return(False)

    def sameStrand(x):
        if (x["strand_x"]=="+") & (x["strand_y"]=="+"):
            return(True)
        elif (x["strand_x"]=="-") & (x["strand_y"]=="-"):
            return(True)
        else:
            return(False)

    def keepUTR(x):
        if (x["inverted"]) & ~(x["samestrand"]):
            return(True)
        elif ~(x["inverted"]) & (x["samestrand"]):
            return(True)
        else:
            return(False)

    if utr.shape[0] > 0:
        utr = utr.assign(thisfeature = [i.split(";")[0].split("=")[1].split("_")[0] \
                                        for i in utr["attribute"]])
        utr = utr.assign(thisfeature2 = [re.sub("-[1-9]","",i) for i in utr["thisfeature"]])
        thismerge = pd.merge(utr,thesegenescommon,on=["thisfeature2"])
        if thismerge.shape[0] > 0:
            thismerge = thismerge.assign(inverted = [checkInverted(i[1]) for i in thismerge.iterrows()])
            thismerge = thismerge.assign(samestrand = [sameStrand(i[1]) for i in thismerge.iterrows()])
            thismerge = thismerge.assign(keeputr = [keepUTR(i[1]) for i in thismerge.iterrows()])
            thismerge = thismerge.loc[thismerge["keeputr"]==True]
            if thismerge.shape[0] > 0:
                theseutrs = [i for i in thismerge["thisfeature_x"]]
                thisutr = utr.loc[utr["thisfeature"].isin(theseutrs)]
                gene_df = gene[["thisfeature2","strand"]]
                allutr = pd.merge(thisutr,gene_df[["thisfeature2"]],on=["thisfeature2"],how="outer",indicator=True)
                allutr = allutr.loc[allutr["_merge"]=="left_only"].drop(columns=["_merge"])
                utrtest = pd.merge(thisutr,gene_df,on=["thisfeature2","strand"])
                thisutr = pd.concat([allutr,utrtest])
                thisutr = thisutr.drop(columns=["thisfeature","thisfeature2"])
            else:
                thisutr = pd.DataFrame()
        else:
            thisutr = pd.DataFrame()
    else:
        thisutr = pd.DataFrame()
    x = pd.concat([others,thisutr]).sort_values(["seqname",position])
    return(x)


def selectAnnotationByPriority(x, position, segments,
                               cutoff=250, blacklist = blacklist):

    def isDubious(y):
        m = re.compile(".*(Y.*-[A-Z])(-[1-9])?;.*")
        if re.match(m,y["attribute"]):
            if y["feature"] == "gene":
                y["priority"] = y["priority"]+1
        return(y)

    priority = {'gene' : 0,
        'three_prime_UTR' : 0,
        'five_prime_UTR' : 0,
        'pseudogene' : 3,
        'ncRNA_gene' : 4,
        'SUT' : 5,
        'CUT' : 6,
        'XUT' : 7,
        'centromere' : 8
        }
    if position == "start":
        otherposition = "end"
    else:
        otherposition = "start"
    x = x.loc[~x["feature"].isin(blacklist)]

    thisref = segments.iloc[0][position]
    x = x.assign(disttoseg = abs(x[position]-thisref))
    tooclose = x.loc[x["disttoseg"]<=cutoff]
    others = x.loc[x["disttoseg"]>cutoff]
    #pdb.set_trace()
    if tooclose.shape[0] > 0:
        #tooclose = pd.concat([x.iloc[i] for i in tooclose])
        tooclose = tooclose.assign(priority = [priority[i] for i in tooclose["feature"]])
        #pdb.set_trace()
        if collections.Counter(tooclose["feature"])["gene"] >=2:
            tooclose = tooclose.apply(isDubious, axis=1)
        #pdb.set_trace()
        if position == "end":
            tooclose = tooclose.sort_values(["priority",position,otherposition],ascending=[False, True, True])
            tooclose = tooclose.iloc[[-1]].drop(columns=["priority"])
        else:
            tooclose = tooclose.sort_values(["priority",position,otherposition],ascending=[True, True, True])
            tooclose = tooclose.iloc[[0]].drop(columns=["priority"])

    else:
        tooclose = pd.DataFrame()

    try:
        out = pd.concat([others,tooclose])\
            .drop_duplicates(["seqname","start","end","feature","attribute"])\
            .sort_values(["seqname","disttoseg",position,otherposition]).drop(columns=["disttoseg"])
    except:
        pdb.set_trace()
    #pdb.set_trace()
    return(out)

def getNovelJunctionType(anns, blacklist_add = ["engineered_region",
                         "site_specific_recombination_target_region"],
                         use_other = True, fullgff = None,
                         circular = True, maxdist = 5000, thischr = None):

    if blacklist_add is not None:
        if type(blacklist_add) == str:
            blacklist_add = list(blacklist_add)
        for i in blacklist_add:
            blacklist.append(i)

    original_anns = anns.loc[anns["feature"]=="engineered_region"]
    seg1_original = original_anns.loc[original_anns["position"]=="first"]
    # try to select right segs


    seg1_original_mod = False # flag to check for modification
    seg2_original = original_anns.loc[original_anns["position"]=="second"]

    seg2_original_mod = False # flag to check for modification

    anns = anns.loc[~anns["feature"].isin(blacklist)]
    # anns = anns.loc[~anns["feature"].isin(["engineered_region",
    #                                        "site_specific_recombination_target_region"])]
    anns = anns.loc[~anns["feature"].isin(["site_specific_recombination_target_region"])]
    thischrlen = max(fullgff.loc[fullgff["seqname"]==thischr]["end"])
    fullgff = fullgff.loc[fullgff["seqname"]==thischr]

    # test this. annotation closest to loxPsym should be first
    seg1_anns = anns.loc[anns["position"] == "first"].sort_values(["end","start"])
    seg1_anns =  utrFilter(seg1_anns,"end",seg1_original)
    seg2_anns = anns.loc[anns["position"] == "second"].sort_values(["start","end"])
    seg2_anns =  utrFilter(seg2_anns,"start",seg2_original)


    print("These are the annotations")
    print(anns)

    if seg1_anns.shape[0] < 1:
        if use_other:
            keep_going = True
            seg1_original_mod = True # flag to check for modification
            while ((keep_going) & (seg1_anns.shape[0] == 0)):
                print("This is seg1 original")
                print(seg1_original)
                seg1_anns, seg1_original, keep_going = getAdjacentSegmentAnnotations(seg1_original,
                                              fullgff,
                                              direction = "upstream",
                                              circular = circular)
                #print(seg1_original)
                seg1_anns = seg1_anns.loc[~seg1_anns["feature"].isin(blacklist)]
                seg1_anns = seg1_anns.loc[~seg1_anns["feature"]\
                                          .isin(["site_specific_recombination_target_region"])]
                #pdb.set_trace()

    if seg2_anns.shape[0] < 1:
        if use_other:
            keep_going = True
            seg2_original_mod = True
            while ((keep_going) & (seg2_anns.shape[0] <= 1)):
                print("This is seg2 original")
                print(seg2_original)
                seg2_anns, seg2_original, keep_going = getAdjacentSegmentAnnotations(seg2_original,
                                              fullgff,
                                              direction = "downstream",
                                              circular = circular)
                #print(seg2_original)
                seg2_anns = seg2_anns.loc[~seg2_anns["feature"]\
                                          .isin(["site_specific_recombination_target_region"])]
                #pdb.set_trace()

    annsout = pd.concat([seg1_anns,seg1_original,seg2_anns,seg2_original])\
                        .drop_duplicates(["seqname","start","end","feature","attribute"])\
                        .sort_values(["seqname","end","start"])

    #pdb.set_trace()
    fixed = True
    while fixed:
        o_seg1_anns = seg1_anns
        seg1_anns = selectAnnotationByPriority(seg1_anns, "end", seg1_original,
                                               cutoff=250, blacklist = blacklist)
        seg1_anns = seg1_anns.sort_values("end")
        if seg1_anns is not o_seg1_anns:
            fixed = False

    fixed = True
    while fixed:
        o_seg2_anns = seg2_anns
        seg2_anns = selectAnnotationByPriority(seg2_anns, "start", seg2_original,
                                               cutoff=250, blacklist = blacklist)
        seg2_anns = seg2_anns.sort_values("start")
        if seg2_anns is not o_seg2_anns:
            fixed = False
    #pdb.set_trace()
    flipped = False
    try:
        segfeature1 = seg1_anns.iloc[-1]["attribute"]\
            .split(";")[0].split("=")[1]
    except:
        segfeature1 = "other"
        #pdb.set_trace()
    try:
        segfeature2 = seg2_anns.iloc[0]["attribute"]\
        .split(";")[0].split("=")[1]
    except:
        segfeature2 = "other"
        #pdb.set_trace()
    if ((seg1_anns.shape[0] > 0) & (seg2_anns.shape[0] > 0)):
        if (seg1_anns.iloc[-1]["end"] > seg2_anns.iloc[-1]["end"]):
            if circular:
                dist = abs(thischrlen - seg1_anns.iloc[-1]["end"] - seg2_anns.iloc[0]["start"])
            else:
                dist = abs(seg1_anns.iloc[-1]["end"] - seg2_anns.iloc[0]["start"])
        else:
            dist = abs(seg1_anns.iloc[-1]["end"] - seg2_anns.iloc[0]["start"])

        if dist <= maxdist:
            segtype1 = "+" + seg1_anns.iloc[-1]["feature"]
            segfeature1 = "+" + segfeature1
            if seg1_anns.iloc[-1]["strand"] == "-":
                if seg2_anns.iloc[0]["strand"] == "+":
                    # flip strand
                    segtype2 = "-" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "-" + segfeature2
                else:
                    segtype2 = "+" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "+" + segfeature2
                flipped = True
            else:
                if seg2_anns.iloc[0]["strand"] == "+":
                    segtype2 = "+" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "+" + segfeature2
                else:
                    segtype2 = "-" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "-" + segfeature2
        else:
            if seg1_original_mod:
                segtype1 = "other"
                if seg2_anns.iloc[0]["strand"] == "+":
                    segtype2 = "+" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "+" + segfeature2
                else:
                    segtype2 = "-" + seg2_anns.iloc[0]["feature"]
                    segfeature2 = "-" + segfeature2
            else:
                segtype2 = "other"
                if seg1_anns.iloc[-1]["strand"] == "+":
                    segtype1 = "+" + seg1_anns.iloc[-1]["feature"]
                    segfeature1 = "+" + segfeature1
                else:
                    segtype1 = "-" + seg1_anns.iloc[-1]["feature"]
                    segfeature1 = "-" + segfeature1
    else:
        dist = None
        if (seg1_anns.shape[0] > 0):
            if seg1_anns.iloc[-1]["strand"] == "+":
                segtype1 = "+" + seg1_anns.iloc[-1]["feature"]
                segfeature1 = "+" + segfeature1
            else:
                segtype1 = "-" + seg1_anns.iloc[-1]["feature"]
                segfeature1 = "-" + segfeature1
            segtype2 = "other"
        elif (seg2_anns.shape[0] > 0):
            if seg2_anns.iloc[0]["strand"] == "+":
                segtype2 = "+" + seg2_anns.iloc[0]["feature"]
                segfeature2 = "+" + segfeature2
            else:
                segtype2 = "-" + seg2_anns.iloc[0]["feature"]
                segfeature2 = "-" + segfeature2
            segtype1 = "other"
        else:
            segtype1 = "other"
            segtype2 = "other"



    if flipped:
        annsout = annsout.assign(type = "{}:{}".format(segtype2,segtype1),
                                 dist = dist,
                                 jcnfeatures = "{}:{}".format(segfeature2,segfeature1))
    else:
        annsout = annsout.assign(type = "{}:{}".format(segtype1,segtype2),
                                 dist = dist,
                                 jcnfeatures = "{}:{}".format(segfeature1,segfeature2))

    #pdb.set_trace()
    return(annsout)

def getAnnPosition(x,segs, seg1, seg2):
    # determine if annotation is closer to seg1 or seg2
    # return position and distance
    #print(segs)
    # -1/+1 is a quick hack to account for 44:1 junction, which is missing the loxPsym
    segs = segs.assign(midpoint=[segs.iloc[0]["end"]-1,segs.iloc[1]["start"]+1])
    x["midpoint"] = (x["start"]+x["end"])/2
    segs = segs.assign(middist = abs(segs["midpoint"]-x["midpoint"]))\
               .reset_index(drop=True).sort_values("middist").iloc[0]
    #print(segs)
    #pdb.set_trace()
    if segs.name == 0:
        x["position"] = "first"
    else:
        x["position"] = "second"
    x["segs"] = "{}:{}".format(str(seg1),str(seg2))
    x["dist"] = (((abs(x["start"] - segs["start"])) \
                + (abs(x["end"] - segs["end"])))/2)
    x = x.drop("midpoint")
    return(x)

def getNovelJunctionAnnotations(segorder, gff,
                                synchr, blacklist_add,
                                use_other = True,
                                circular = True,
                                maxdist = 5000,
                                ref_gff = ("/g/steinmetz/project/IESY/genomes/"
                                           "annotations/scramble/gff/JS94.gff"),
                                genomeIndex = ("/g/steinmetz/project/IESY/genomes"
                                               "/synIXR_scramble/genomes/"
                                               "{}_ERCC92.genome")):

    # load genome index to account
    gi = pd.read_csv(genomeIndex.format(synchr.split("_")[0]),\
                     sep=r"\t",header=None)
    thischrlen = int(gi.loc[gi[0]==synchr][1])

    #print(segorder)
    seg1 = segorder[0]
    if seg1 < 0:
        seg1_strand = "-"
    else:
        seg1_strand = "+"
    seg1_alt = segorder[1]
    if seg1_alt < 0:
        seg1_alt_strand = "+"
    else:
        seg1_alt_strand = "-"

    seg2 = segorder[1]
    if seg2 < 0:
        seg2_strand = "-"
    else:
        seg2_strand = "+"
    seg2_alt = segorder[0]
    if seg2_alt < 0:
        seg2_alt_strand = "+"
    else:
        seg2_alt_strand = "-"

    if type(gff) is str:
        gff = readGFF(gff)
    gff = gff.reset_index()

    if type(ref_gff) is str:
        ref_gff = readGFF(ref_gff)
    ref_gff = ref_gff.reset_index()

    seg1_bounds = gff.loc[(gff["attribute"].str.match('ID={}(-.+)?;'.format(abs(seg1)))) &
                           (gff["strand"] == seg1_strand) &
                           (gff["seqname"] == synchr) &
                           (gff["feature"] == "engineered_region")]
    seg2_bounds = gff.loc[(gff["attribute"].str.match('ID={}(-.+)?;'.format(abs(seg2)))) &
                           (gff["strand"] == seg2_strand) &
                           (gff["seqname"] == synchr) &
                           (gff["feature"] == "engineered_region")]
    seg1_alt_bounds = gff.loc[(gff["attribute"].str.match('ID={}(-.+)?;'.format(abs(seg1_alt)))) &
                           (gff["strand"] == seg1_alt_strand) &
                           (gff["seqname"] == synchr) &
                           (gff["feature"] == "engineered_region")]
    seg2_alt_bounds = gff.loc[(gff["attribute"].str.match('ID={}(-.+)?;'.format(abs(seg2_alt)))) &
                           (gff["strand"] == seg2_alt_strand) &
                           (gff["seqname"] == synchr) &
                           (gff["feature"] == "engineered_region")]

    loxpdist = 40
    legit_segs = []
    for i in range(seg1_bounds.shape[0]):
        for j in range(seg2_bounds.shape[0]):
            if seg1_bounds.iloc[i]["end"] > seg2_bounds.iloc[j]["start"]:
                #circular entry
                thisdist = abs(int(seg2_bounds.iloc[j]["start"]) - int(seg1_bounds.iloc[i]["end"]) + thischrlen)
            else:
                thisdist = abs(int(seg2_bounds.iloc[j]["start"]) - int(seg1_bounds.iloc[i]["end"]))
            #print(thisdist)
            if thisdist <= loxpdist:
                legit_segs.append(pd.concat([seg1_bounds.iloc[[i]], seg2_bounds.iloc[[j]]]))
    for i in range(seg1_alt_bounds.shape[0]):
        for j in range(seg2_alt_bounds.shape[0]):
            if seg1_alt_bounds.iloc[i]["end"] > seg2_alt_bounds.iloc[j]["start"]:
                #circular entry
                thisdist = abs(int(seg2_alt_bounds.iloc[j]["start"]) - int(seg1_alt_bounds.iloc[i]["end"]) + thischrlen)
            else:
                thisdist = abs(int(seg2_alt_bounds.iloc[j]["start"]) - int(seg1_alt_bounds.iloc[i]["end"]))
            #print(thisdist)
            if thisdist <= loxpdist:
                legit_segs.append(pd.concat([seg1_alt_bounds.iloc[[i]], seg2_alt_bounds.iloc[[j]]]))
    all_anns = []
    for i in range(len(legit_segs)):
        thesesegs = legit_segs[i]
        print("this is number {}".format(i))
        print(thesesegs)

        # add 100 bp buffer to try to catch boundary anotations
        if thesesegs.iloc[0]["start"] > thesesegs.iloc[1]["start"]:
            # wrap
            partialanns1 = gff.loc[(gff["seqname"] == thesesegs.iloc[0]["seqname"]) &
                            (gff["start"] >= thesesegs.iloc[0]["start"]-100) &
                            (gff["end"] <= thesesegs.iloc[0]["end"]+100)]
            partialanns2 = gff.loc[(gff["seqname"] == thesesegs.iloc[1]["seqname"]) &
                            (gff["start"] >= thesesegs.iloc[1]["start"]-100) &
                            (gff["end"] <= thesesegs.iloc[1]["end"]+100)]
            bounded_anns = pd.concat([partialanns1,partialanns2])
        else:
            bounded_anns = gff.loc[(gff["seqname"] == thesesegs.iloc[0]["seqname"]) &
                            (gff["start"] >= thesesegs["start"].min()-100) &
                            (gff["end"] <= thesesegs["end"].max()+100)]

        anns = bounded_anns.apply(getAnnPosition, 1, args = (thesesegs,seg1,seg2))
        anns = anns.sort_values("dist")\
                .drop_duplicates(["seqname","start","end","feature","attribute"])\
                .sort_values(["seqname","start","end"]).drop(columns=["dist"])

        thischr = list(set(thesesegs["seqname"]))[0]
        print(thischr)
        anns = getNovelJunctionType(anns = anns, blacklist_add = blacklist_add,
                                                       use_other = use_other, fullgff = gff,
                                                       circular = circular, maxdist = maxdist,
                                                       thischr = thischr)
        all_anns.append(anns)
    if len(all_anns) > 0:
        o = pd.concat(all_anns)
        o = o.reset_index(drop=True)
    else:
        o = None
    return(o)

def novelJunctionBed(anns, gff):
    anns = anns.loc[anns["feature"]=="engineered_region"].sort_values(["start","end"])
    bed = pd.DataFrame.from_dict([{"chrom" : str(anns.iloc[0]["seqname"]) ,
                                  "chromStart" : str(anns.iloc[0]["end"]),
                                  "chromEnd" : str(anns.iloc[-1]["start"]),
                                  "name" : str(anns.iloc[0]["segs"]),
                                  "score" : 100,
                                  "strand" : "+",
                                  "thickStart" : str(anns.iloc[0]["end"]),
                                  "thickEnd" : str(anns.iloc[-1]["start"]),
                                  "itemRgb" : "0",
                                  "blockCount" : "0",
                                  "blockSizes" : "0",
                                  "blockStarts" : "0"
                                  }])
    bed = bed[["chrom",
              "chromStart",
              "chromEnd",
              "name",
              "score",
              "strand",
              "thickStart",
              "thickEnd",
              "itemRgb",
              "blockCount",
              "blockSizes",
              "blockStarts"]]
    return(bed)

def getAllJunctions(gff, seqname, circular):
    if type(gff) is str:
        x = readGFF(x).reset_index()
    else:
        x = gff
    x = x.loc[(x["feature"]=="engineered_region") & (x["seqname"]==seqname)]
    return(x)

def getAllNovelJunctions(to_fa, synchr, gff,
                        blacklist_add = None,
                        outbed = None,
                        circular = False,
                        use_other = True,
                        seg_file = ("/g/steinmetz/brooks/git/"
                                    "steinmetz-lab/yeast2_0/"
                                    "scramble/SynIXR_segmentTable.txt"),
                        blatPath = ("/g/steinmetz/brooks/anaconda3/"
                                    "envs/blat/bin/blat"),
                        ref_gff = ("/g/steinmetz/project/IESY/genomes/"
                                   "annotations/scramble/gff/JS94.gff"),
                        maxdist = 10000):
    #print(synchr)
    segorder = getGenomeSegOrder(to_fa, synchr)
    noveljunctions = getNovelJunctions(segorder, circular)
    annotations = [getNovelJunctionAnnotations(i, gff, synchr,
                                               blacklist_add, use_other,
                                               circular, maxdist, ref_gff)
                                               for i in noveljunctions.keys()]
    annotations = [i for i in annotations if i is not None]
    #pdb.set_trace()
    junctionBeds = [novelJunctionBed(i, gff) for i in annotations]
    if ((len(annotations)>0) and (len(junctionBeds)>0)):
        out = {
            "annotations" : pd.concat(annotations),
            "bed" : pd.concat(junctionBeds),
            "copynumber" : noveljunctions,
            "segorder" : segorder
        }
    else:
        out = {
            "annotations" : pd.DataFrame(),
            "bed" : pd.DataFrame(),
            "copynumber" : noveljunctions,
            "segorder" : segorder
        }
    if not out["annotations"].empty:
        out["annotations"] = out["annotations"]\
            .drop_duplicates(keep = "first").reset_index(drop=True)
        out["bed"] = out["bed"].drop_duplicates(keep = "first")
    if outbed is not None:
        out["bed"].to_csv(outbed, index = None, sep="\t")
    return(out)

def loxFromSegs(x, seqname = None):
    if type(x) is str:
        x = readGFF(x).reset_index()
    if seqname is None:
        x = x.loc[x["feature"]=="engineered_region"]
    else:
        x = x.loc[(x["feature"]=="engineered_region") & (x["seqname"]==seqname)]
    df = []
    template = x.iloc[[0]]
    #print(x.shape[0])
    for i in range(0,x.shape[0]-1):
        this = template.copy(deep = True)
        this["feature"] = "site_specific_recombination_target_region"
        this["attribute"] = "inferred from segments"
        this["source"] = "ANB"
        # pathological 1-44 junction which doesn't contain loxp site
        if (x.iloc[i]["end"] == x.iloc[i+1]["start"]):
            this["start"] = x.iloc[i]["end"] - 1
            this["end"] = x.iloc[i+1]["start"] + 1
        else:
            this["start"] = x.iloc[i]["end"] + 1
            this["end"] = x.iloc[i+1]["start"] - 1
        df.append(this)
    df = pd.concat(df)
    return(df)

def bestScoreSam(reads, out, seqname = None):
    """
    Only keep reads with equal alignment score from sam file.
    Used to evaluate "distinguishing" reads.
    """
    samfile = pysam.AlignmentFile(reads, "rb")
    uniquereads = pysam.AlignmentFile(out, "wb", template = samfile)
    if seqname is not None:
        samfile = samfile.fetch(seqname)
    bestreads = {}
    for i in samfile:
        if i.has_tag("AS"):
            thisscore = i.get_tag("AS")
            thisname = i.qname
            if thisname not in bestreads.keys():
                bestreads[thisname] = [i]
            else:
                #print(thisname)
                thisbest = bestreads[thisname][0].get_tag("AS")
                #print("This score: {}".format(str(thisscore)))
                if thisscore > thisbest:
                    bestreads[thisname] = [i]
                else:
                    #print("This score: {}".format(str(thisscore)))
                    #print("Current best score: {}".format(str(thisbest)))
                    bestreads[thisname].append(i)
    for i in bestreads.keys():
        for j in bestreads[i]:
            uniquereads.write(j)
    uniquereads.close()
    print("Wrote best scoring reads to file: {}".format(out))
    return(bestreads)


def restrictJcns(noveljcns, copynumber_lim = 1):
    thesesegs = [i for i,j in noveljcns["copynumber"].items() if j <= copynumber_lim]
    thesesegs_fr = []
    for i in thesesegs:
        thesesegs_fr.append("{}:{}".format(i[0],i[1]))
        thesesegs_fr.append("{}:{}".format(-1*i[1],-1*i[0]))
    noveljcns["bed"] = noveljcns["bed"].loc[noveljcns["bed"]["name"].isin(thesesegs_fr)]
    noveljcns["annotations"] = noveljcns["annotations"].loc[noveljcns["annotations"]["segs"].isin(thesesegs_fr)]
    return(noveljcns)

def distinguishingReads(reads,
                synchr,
                fa,
                gff,
                readType = ["long", "short"][0],
                name = None
                ):
    if name is None:
        name = reads

    dfrecord = {
        "type": readType,
        "name": name,
        "allchr_reads" : 0,
        "allchr_unique" : 0,
        "syn_reads" : 0,
        "syn_unique" : 0,
        "jcn_reads" : 0,
        "jcn_unique" : 0,
        "noveljcn_reads" : 0,
        "noveljcn_unique" : 0
    }

    pybed = pybedtools.BedTool(reads)
    samfile = pysam.AlignmentFile(reads, "rb")

    loxP = loxFromSegs(gff, synchr)
    bed_loxP = pybedtools.BedTool(loxP.to_string(index=False,header=False),from_string=True)

    noveljcns = getAllNovelJunctions(fa, synchr, gff)
    bed_noveljcns = pybedtools.BedTool(noveljcns["bed"].to_string(index=False,
                                                                   header=False),from_string=True)

    noveljcns_restricted = restrictJcns(noveljcns)
    bed_noveljcns_restricted = pybedtools.BedTool(noveljcns_restricted["bed"].to_string(index=False,
                                                                   header=False),from_string=True)

    f = tempfile.NamedTemporaryFile(mode='w')
    uniquereads = pysam.AlignmentFile(f.name, "wb", template = samfile)
    if readType == "short":
        written = [uniquereads.write(i) for i in samfile if not i.has_tag("XS")]
    elif readType == "long":
        written = [uniquereads.write(i) for i in samfile if ((i.flag in [0,16]) and
            (i.get_tag('s1') > i.get_tag('s2')))]
    else:
        raise ValueError
    uniquereads.close()
    uniquereads = pybedtools.BedTool(f.name)

    bam_loxP_unique = uniquereads.intersect(bed_loxP, wa=True)
    bam_noveljcns_unique = uniquereads.intersect(bed_noveljcns, wa=True)
    bam_noveljcns_restricted_unique = uniquereads.intersect(bed_noveljcns_restricted, wa=True)

    bam_loxP_all = pybed.intersect(bed_loxP, wa=True)
    bam_noveljcns_all = pybed.intersect(bed_noveljcns, wa=True)
    bam_noveljcns_restricted_all = pybed.intersect(bed_noveljcns_restricted, wa=True)

    # all chrs
    this = samfile.fetch()
    if readType == "short":
        tags = [not i.has_tag("XS") for i in this if (i.reference_name != synchr) ]
    elif readType == "long":
        tags = [((i.flag in [0,16]) and (i.get_tag('s1') > i.get_tag('s2'))) for i in this if (i.reference_name != synchr)]
    else:
        raise ValueError
    dfrecord["allchr_reads"] = len(tags)
    dfrecord["allchr_unique"] = sum(tags)

    # syn chr
    this = samfile.fetch(synchr)
    if readType == "short":
        tags = [not i.has_tag("XS") for i in this]
    elif readType == "long":
        tags = [((i.flag in [0,16]) and (i.get_tag('s1') > i.get_tag('s2'))) for i in this]
    else:
        raise ValueError
    dfrecord["syn_reads"] = len(tags)
    dfrecord["syn_unique"] = sum(tags)

    # loxP sym junctions
    dfrecord["jcn_reads"] = bam_loxP_all.count()
    dfrecord["jcn_unique"] = bam_loxP_unique.count()

    # novel junctions
    dfrecord["noveljcn_reads"] = bam_noveljcns_all.count()
    dfrecord["noveljcn_unique"] = bam_noveljcns_unique.count()

    # novel junctions restricted to copynum = 1
    dfrecord["noveljcns_restricted_reads"] = bam_noveljcns_restricted_all.count()
    dfrecord["noveljcns_restricted_unique"] = bam_noveljcns_restricted_unique.count()

    return(dfrecord)


def dist2loxP(reads,
            synchr,
            fa,
            gff,
            name = None,
            noveljcns = True
            ):
    if name is None:
        name = reads

    pybed = pybedtools.BedTool(reads)
    samfile = pysam.AlignmentFile(reads, "rb")

    loxP = loxFromSegs(gff, synchr)
    bed_loxP = pybedtools.BedTool(loxP.to_string(index=False,header=False),from_string=True)

    f = tempfile.NamedTemporaryFile(mode='w')
    uniquereads = pysam.AlignmentFile(f.name, "wb", template = samfile)
    written = [uniquereads.write(i) for i in samfile if ((i.flag in [0,16]) and
        (i.get_tag('s1') > i.get_tag('s2')))]
    uniquereads.close()
    uniquereads = pybedtools.BedTool(f.name)

    bam_loxP_unique = uniquereads.intersect(bed_loxP, wa=True)


    #bam_loxP_all = pybed.intersect(bed_loxP, wa=True)
    #bam_noveljcns_all = pybed.intersect(bed_noveljcns, wa=True)

    bam_loxP_unique_3p = bam_loxP_unique.bam_to_bed().each(three_prime, upstream=0, downstream=0).sort()
    bam_loxP_unique_counts = [i for i in bam_loxP_unique_3p.absolute_distance(bed_loxP)]

    if noveljcns:
        noveljcns = getAllNovelJunctions(fa, synchr, gff)
        bed_noveljcns = pybedtools.BedTool(noveljcns["bed"].to_string(index=False,
                                                                       header=False),from_string=True)
        bam_noveljcns_unique = uniquereads.intersect(bed_noveljcns, wa=True)
        bam_noveljcns_unique_3p = bam_noveljcns_unique.bam_to_bed().each(three_prime, upstream=0, downstream=0).sort()
        bam_noveljcns_unique_counts = [i for i in bam_noveljcns_unique_3p.absolute_distance(bed_loxP)]
    else:
        bam_noveljcns_unique_counts = None

    dfrecord = {
        "loxP": bam_loxP_unique_counts,
        "noveljcns": bam_noveljcns_unique_counts,
    }

    return(dfrecord)

def getTmpdir():
    if "TMPDIR" not in os.environ:
        os.environ["TMPDIR"] = "/tmpdata/brooks"
        return("/tmpdata/brooks")
    else:
        return(str(os.environ["TMPDIR"]))

def coverageExtender(feature, bed,
                     stranded = True,
                     cov_cutoff = None,
                     verbose = True):
    """
    Extend annotations based on coverage
    coverage_dfs should be dict with coverage for
    +/- strand if stranded
    """

    thisuuid = uuid.uuid4()
    thispath = "{}/{}".format(getTmpdir(),thisuuid)

    if not os.path.exists(thispath):
        os.makedirs(thispath)

    pybedtools.set_tempdir(thispath)

    warn1 = "WARNING: {name} Can't find nearest read for {loc}. Returning original annotation."
    warn2 = "WARNING: {name} Modified start greater than end. Returning annotated {loc}."
    warn3 = "WARNING: {name} Modified gene length >10X sizes of original annotation. Returning annotated {loc}."

    thischr = feature["chrom"]
    thisstrand = feature["strand"]
    thisname = feature["name"]

    original_feature = feature

    feature = pd.DataFrame(feature).T
    feature = pybedtools.BedTool(feature.to_string(index=False,header=False),from_string=True)

    pybed = bed
    pybed_df = pybed.to_dataframe()

    try:
        this_intersect = pybed.intersect(feature, F=0.8)
    except:
        return(original_feature)

    if this_intersect.count() < 1:
        return(original_feature)

    if stranded:
        readdf = pybed_df.loc[(pybed_df["chrom"]==thischr) &
                              (pybed_df["name"].isin(this_intersect.to_dataframe()["name"])) &
                              (pybed_df["strand"]==thisstrand)]
    else:
        readdf = pybed_df.loc[(pybed_df["chrom"]==thischr) &
                              (pybed_df["name"].isin(this_intersect.to_dataframe()["name"]))]

    readdf = readdf.loc[(readdf["end"]>original_feature["start"]) &
                       (readdf["start"]<original_feature["end"])]

    if readdf.shape[0] == 0:
        if verbose:
            print(warn1.format(**{"name": thisname, "loc": "start"}))
            return(original_feature)

    thesestarts = readdf.sort_values("start")["start"]
    thesestarts_counter = collections.Counter(thesestarts)
    if cov_cutoff is not None:
        newstart = None
        i = 0
        while ((newstart is None) and (i<(len(thesestarts)-1))):
            if thesestarts_counter[thesestarts.iloc[i]] < cov_cutoff:
                i = i + 1
            else:
                newstart = thesestarts.iloc[i]
    else:
        newstart = thesestarts.iloc[0]

    theseends = readdf.sort_values("end", ascending=False)["end"]
    theseends_counter = collections.Counter(theseends)
    if cov_cutoff is not None:
        newend = None
        i = 0
        while (((newend is None) and (i<(len(theseends)-1)))):
            if theseends_counter[theseends.iloc[i]] < cov_cutoff:
                i = i + 1
            else:
                newend = theseends.iloc[i]
    else:
        newend = theseends.iloc[0]

    if newstart is None:
        newstart = original_feature["start"]
    if newend is None:
        newend = original_feature["end"]

    if newstart > newend:
        if verbose:
            print(warn2.format(**{"name": thisname, "loc": "start"}))
    elif (newend - newstart) > (10*(original_feature["end"]-original_feature["start"])):
        if verbose:
            print(warn3.format(**{"name": thisname, "loc": "start"}))
    else:
        original_feature["start"] = newstart
        original_feature["end"] = newend

    #clean up
    shutil.rmtree(thispath)

    return(original_feature)

def loadGenome(genomefile):
        with open(genomefile,"r") as f:
            genome = {i.strip("\n").split("\t")[0] :
                (0, int(i.strip("\n").split("\t")[1])) for i in f.readlines()}
        return(genome)

def bed2fa(bed, fa, save, features2keep = None, ercc = None,
           slop = None, readbed = None, stranded = True,
           cov_cutoff = None, max_seed_dist = None,
           genome = None, cores = 32, verbose = True, tmpdir = None):

    if tmpdir is not None:
        pybedtools.set_tempdir(tmpdir)

    if features2keep is None:
        features2keep = [
            "CUT",
            "SUT",
            "XUT",
            "gene",
            'ncRNA',
            'ncRNA_gene'
        ]
    thisbed = pybedtools.BedTool(bed).to_dataframe()
    thisbed = thisbed.loc[thisbed["thickEnd"].isin(features2keep)]

    if os.path.isfile(fa + ".fai"):
        fai = pd.read_csv(fa + ".fai", sep="\t", header= None, index_col=0)
    else:
        print("ERROR: Fasta index required")
        return(None)

    def fixBed(x):

        if x["name"] == ".":
            s = re.search('Name=(.*?);', x["blockCount"])
            x["name"] = s.group(1)

        thesechrs = list(fai.index)
        m = re.compile(x["chrom"], re.IGNORECASE)
        thism = [m.fullmatch(i).string for i in thesechrs if m.fullmatch(i)]
        if len(thism) == 1:
            x["chrom"] = thism[0]
        else:
            return(None)

        if x["end"] > fai.loc[x["chrom"]][1]:
            x["end"] = fai.loc[x["chrom"]][1]

        x["blockCount"] = x["blockCount"].replace(" ","")

        return(x)

    thisbed = thisbed.apply(fixBed, axis=1)
    #thisbed = thisbed.iloc[0:100]

    if readbed is not None:
        # correct start/end annotations with sequencing data
        readbed = pybedtools.BedTool(readbed)
        pool = mp.Pool(processes=cores)

        thisbed_arg = [thisbed.iloc[x] for x in range(0,thisbed.shape[0])]

        fcn = partial(coverageExtender,
                      bed = readbed,
                      stranded = stranded,
                      cov_cutoff = cov_cutoff,
                      verbose = verbose)

        results = pool.map(fcn, thisbed_arg)

        thisbed = pd.DataFrame(results)
        #thisbed = pd.concat(results)

    thisbed = pybedtools.BedTool(thisbed.to_string(index=False,header=False), from_string=True)

    if slop is not None:
        print("Adding {} bases to start/end of all features.".format(slop))
        if genome is not None:
            thisbed = thisbed.slop(b = slop, genome = loadGenome(genome))
        else:
            print("WARNING: Genome file required to use slop. Returning original annotations.")

    bedfa = thisbed.sequence(fi=fa, s=True, name=True)

    thissave_fa = save + ".fasta"
    thissave_bed = save + ".bed"
    if ercc is not None:
        tmpfile = tempfile.NamedTemporaryFile()
        bedfa.save_seqs(tmpfile.name)
        filenames = [tmpfile.name, ercc]
        with open(thissave_fa, 'w') as outfile:
            for fname in filenames:
                with open(fname) as infile:
                    for line in infile:
                        outfile.write(line)
    else:
        bedfa.save_seqs(thissave_fa)

    thisbed.saveas(thissave_bed)

    return(bedfa)
    #return(thisbed)


def countStrandErrorCov(original_bam, original_bamstats,
                     corrected_bams, corrected_bamstats,
                     correction_methods,
                     annotations, strain, save=None):

    this_original_bam = pybedtools.BedTool(original_bam)
    this_corrected_bam = {correction_methods[i] : pybedtools.BedTool(j) for i,j in enumerate(corrected_bams)}
    this_annotations = pybedtools.BedTool(annotations)
    anndf = this_annotations.to_dataframe()
    chrbeddf = anndf.loc[anndf["chrom"].str.contains(strain+"|syn")]
    chrbed = pybedtools.BedTool(chrbeddf.to_string(index=False,header=False),from_string=True)

    original_intersect = this_original_bam.intersect(this_annotations, wa=True, s=True)
    corrected_intersect = {i : j.intersect(this_annotations, wa=True, s=True) for i,j in this_corrected_bam.items()}

    count_original = this_original_bam.count()
    count_original_intersect = original_intersect.count()

    count_corrected = {i : j.count() for i,j in this_corrected_bam.items()}
    count_corrected_intersect = {i : j.count() for i,j in corrected_intersect.items()}


    if (chrbeddf.shape[0] == 0):
        original_chrreads = 0
        corrected_chrreads = {i : 0 for i,j in this_corrected_bam.items()}
        original_avg_cov = 0
        corrected_avg_cov = {i : 0 for i,j in this_corrected_bam.items()}
    else:
        original_chrreads = this_original_bam.intersect(chrbed).count()
        corrected_chrreads = {i : j.intersect(chrbed).count() for i,j in this_corrected_bam.items()}
        original_avg_cov = round(chrbed.coverage(this_original_bam).to_dataframe(header=None).mean()[9],2)
        corrected_avg_cov = {i : round(chrbed.coverage(j).to_dataframe(header=None).mean()[9],2) for i,j in this_corrected_bam.items()}

    corr_counts = []
    for i in count_corrected.keys():
        corr_counts.append(pd.DataFrame({"method" : [i],
                                         "strand_mapping_rate" : [(count_corrected_intersect[i]/count_corrected[i])],
                                         "syn_reads" : corrected_chrreads[i],
                                         "mean_syn_cov" : corrected_avg_cov[i]}))
    corr_counts = pd.concat(corr_counts)

    m = re.compile(".*error rate.*")
    m2 = re.compile(".*raw total sequences.*")

    with open(original_bamstats, 'r') as f:
        for i in f.readlines():
            if m2.match(i):
                original_nseqs = float(i.strip().split("\t")[2])
            elif m.match(i):
                original_errorrate = float(i.strip().split("\t")[2])
                break

    original_stats = pd.DataFrame.from_dict({"strain" : [strain],
                                             "base_error" : [original_errorrate],
                                             "strand_mapping_rate" : [float(count_original_intersect)/count_original],
                                             "type": ["uncorrected"],
                                             "nseqs": [original_nseqs],
                                             "method" : [None],
                                             "syn_reads" : [original_chrreads],
                                             "mean_syn_cov" : [original_avg_cov]})

    stats = {}
    for i,j in enumerate(corrected_bamstats):
        with open(j, 'r') as f:
            stats[correction_methods[i]] = {}
            for line in f.readlines():
                if m2.match(line):
                    stats[correction_methods[i]]["nseqs"] = float(line.strip().split("\t")[2])
                elif m.match(line):
                    stats[correction_methods[i]]["base_error"] = float(line.strip().split("\t")[2])
                    break #could do this more cleanly
    corr_stats = pd.DataFrame(stats).T.reset_index(drop=False)
    corr_stats = corr_stats.rename({"index" : "method"}, axis=1)
    corr_stats = corr_stats.assign(strain = strain, type = "corrected")
    corr_stats = pd.merge(corr_stats, corr_counts,  on = "method", suffixes = ("",""))

    thisdf = pd.concat([original_stats, corr_stats])#,sort=False)
    thisdf = thisdf[["strain","method", "type","nseqs","base_error","strand_mapping_rate","syn_reads","mean_syn_cov"]]
    if save is not None:
        thisdf.to_csv(save, header=True, sep="\t", index=False)

    return(thisdf)

def fromBasecall(file, savePath, base = None):
    with open(file) as f:
        data = json.load(f)
    if ("reads" in data.keys()):
        data.pop("reads")
    if base is None:
        data["base"] = data["datadir"] + "/" + data["strain"] + "_" + data["date"] + "/fastq"
    else:
        data["base"] = base
    data_ordered = collections.OrderedDict(sorted(data.items()))
    with open(savePath + 'config.json', 'w') as outfile:
        json.dump(data_ordered, outfile, indent="\t")

def toBasecall(file, savePath, reads = None, tmpdir = None):
    with open(file) as f:
        data = json.load(f)
    if ("base" in data.keys()):
        data.pop("base")
    if reads is None:
        data["reads"] = data["datadir"] + "/" + data["strain"] + "_" + data["date"]
    else:
        data["base"] = reads
    if tmpdir is None:
        data["tmpdir"] = "/scratch/brooks/tmp"
    else:
        data["tmpdir"] = tmpdir
    data_ordered = collections.OrderedDict(sorted(data.items()))
    with open(savePath + 'config.json', 'w') as outfile:
        json.dump(data_ordered, outfile, indent="\t")

def modConfig(file, savePath):
    with open(file) as f:
        data = json.load(f)
    data["base"] = data["datadir"] + "/" + data["strain"] + "_" + data["date"] + "/fastq"
    data_ordered = collections.OrderedDict(sorted(data.items()))
    with open(savePath + 'config.json', 'w') as outfile:
        json.dump(data_ordered, outfile, indent="\t")

# functions to process fastq files with multiprocessing
def correctTPM(x, ref):
    y = x.copy(deep = True)
    thisname = x["Name"]
    thisstrain = x["strain"]
    # get reg copies
    thisref = ref.loc[(ref["RetainedTxp"]==thisname) & (ref["genome"]==thisstrain)]
    others = [i.split("-")[0] for i in thisref["DuplicateTxp"]]
    cn = np.sum([thisname.split("-")[0] in i for i in others]) + 1
    #cn = thisref.shape[0] + 1
    y.at["TPM_CORR"] = x["TPM"]/cn
    y.at["FTPM_CORR"] = x["FTPM"]/cn
    y.at["CN"] = cn
    return(y)

def aggRef(x, noveljcns_features, synIXR_features):
  y = x.copy(deep=True)
  thisstrain = y.iloc[0]["strain"]
  #print(thisstrain)
  if (thisstrain == "BY4741") or (thisstrain == "SLS045"):
      thisstrain = "S288C"
  #try:
  if thisstrain in noveljcns_features.keys():
      thesenoveljcns = noveljcns_features[thisstrain]
      y = y.assign(synthetic = checkIn(y, synIXR_features),
                   noveljcn = checkIn(y, thesenoveljcns))
  else:
      y = y.assign(synthetic = checkIn(y, synIXR_features),
                   noveljcn = False)
#         except:
#             return(None)
  return(y)
#tmp = trueseqdf.loc[trueseqdf["gene"].str.contains("^YIR")].groupby("gene").apply(aggRef)

def checkIn(x,y):
  thissearch = [i for i in x["gene"]]
  thissearch2 = [j + "-" + str(x.iloc[i]["copy"]) for i,j in enumerate(x["gene"])]
  o = [True if ((thissearch[i] in y) or (thissearch2[i] in y)) else False for i,j in enumerate(thissearch)]
  return(o)

# for combine multicore operation
def getReadsWAdapters(g):
    #thisdf = df.get_group(g)
    thisdf = g
    if (thisdf["position"].str.contains("start").any()):
        if (thisdf["position"].str.contains("end").any()):
            return(list(set(thisdf["readid"]))[0])
        else:
            return(None)
    else:
        return(None)

# for identifying and coloring junctions
def kernelNovelJcn(row, novelJcns):
    r_start = row["start"]
    r_end = row["end"]
    species = row["scrambleObj"].split("_")[0]
    if species in ["BY4741", "SLS045", "S288C"]:
        row["jcn_upstream"] = None
        row["jcn_downstream"] = None
        row["position_upstream"] = None
        row["segs_upstream"] = None
        row["position_downstream"] = None
        row["segs_downstream"] = None
        return(row)
    thesejcns = novelJcns[species]["annotations"]
    thisannot = thesejcns.loc[(r_start >= thesejcns["start"]) & (r_end <= thesejcns["end"])]
    if (thisannot.shape[0] < 1):
        row["jcn_upstream"] = None
        row["jcn_downstream"] = None
        row["position_upstream"] = None
        row["segs_upstream"] = None
        row["dist_upstream"] = None
        row["position_downstream"] = None
        row["segs_downstream"] = None
        row["dist_downstream"] = None
    else:
        upstream = thisannot.loc[thisannot["position"]=="second"]
        if upstream.shape[0] == 1:
            row["jcn_upstream"] = upstream.iloc[0]["type"]
            row["position_upstream"] = upstream.iloc[0]["position"]
            row["segs_upstream"] = upstream.iloc[0]["segs"]
            row["dist_upstream"] = upstream.iloc[0]["dist"]
        else:
            row["jcn_upstream"] = None
            row["position_upstream"] = None
            row["segs_upstream"] = None
            row["dist_upstream"] = None
        downstream = thisannot.loc[thisannot["position"]=="first"]
        if downstream.shape[0] == 1:
            row["jcn_downstream"] = downstream.iloc[0]["type"]
            row["position_downstream"] = downstream.iloc[0]["position"]
            row["segs_downstream"] = downstream.iloc[0]["segs"]
            row["dist_downstream"] = downstream.iloc[0]["dist"]
        else:
            row["jcn_downstream"] = None
            row["position_downstream"] = None
            row["segs_downstream"] = None
            row["dist_downstream"] = None
    return(row)

def getScrambleColor(seg, nsegs = None):
        if nsegs is not None:
            nsegs = nsegs
        else:
            nsegs = 44
        colors = colors = {i:"{},{},{}".format(int(255*j[0]),int(255*j[1]),int(255*j[2]))
                           for i,j in zip(range(1,nsegs+1),cm.rainbow(np.linspace(0, 1, nsegs)))}
        return colors[seg]

def getSegsInRegion(df,gffdir="/g/steinmetz/project/IESY/genomes/annotations/scramble/gff/"):
    minpos = np.min(df["position"])
    maxpos = np.max(df["position"])
    theseids = list(set(df["id"]))
    allsegs = []
    for x in theseids:
        # x looks like JS710_directrna|JS710_1:113076:113814
        strain = x.split("_")[0]
        if strain in ["BY4741","SLS045"]:
            strain = "S288C"
        region = x.split(":")
        #print(x)
        region = (int(region[-2]), int(region[-1]))
        #print(region)
        thisgff = readGFF(gffdir + strain + ".gff")
        segs = thisgff.loc[thisgff["feature"] == "engineered_region"].reset_index(drop=False)
        thisseg = segs.loc[(segs["start"] <= region[0]) & (segs["end"] >= region[1])]
        if thisseg.empty:
            flip = False
        elif thisseg.iloc[0]["strand"] == "-":
            flip = True
        else:
            flip = False
        region_shift = (region[0]+minpos, region[1]+maxpos)
        #print(region_shift)
        thesesegs = segs.loc[(segs["end"] >= region_shift[0]) & (segs["start"] <= region_shift[1])]
        #print(thesesegs)
        thesesegs = thesesegs.assign(id = x)
        segnumbers = [i.split("=")[1].split("-")[0].rstrip(";") for i in thesesegs["attribute"]]
        thesesegs["color"] = [getScrambleColor(int(i)) for i in segnumbers]
        if flip:
            thesesegs["reindex_start"] = [region[1] - i for i in thesesegs["end"]]
            thesesegs["reindex_end"] = [region[1] - i for i in thesesegs["start"]]
        else:
            thesesegs["reindex_start"] = [i - region[0] for i in thesesegs["start"]]
            thesesegs["reindex_end"] = [i - region[0] for i in thesesegs["end"]]
        if thesesegs.empty:
            thesesegs["id"] = [x]
            thesesegs["color"] = ["128,128,128"]
            thesesegs["reindex_start"] = minpos-2000
            thesesegs["reindex_end"] = maxpos+2000
        allsegs.append(thesesegs)
    o = pd.concat(allsegs)
    return(o)

def colorJcns(df, col2use, combined = True, colName = ""):

    item_order = {
        "gene" : 1,
        "five_prime_UTR" : 2,
        "three_prime_UTR" : 3,
        "SUT" : 4,
        "pseudogene" : 5,
        "centromere" : 6,
        "other" : 7
    }

   #thesecols = sns.color_palette("hls", len(item_order))
    thesecols = sns.color_palette("Set2", len(item_order))

    color_d = {i : thesecols[j-1] for i, j in item_order.items()}

    if colName == "":
        colName = col2use

    this = {}

    for i in range(0,df.shape[0]):
        # make name compatible with kernel entry
        thisrow = df.iloc[i]
        #print(thisrow)
        if not combined:
            thisname = thisrow["scrambleObj"] + "|" + thisrow["chrom"] + ":" + str(thisrow["start"]) + ":" + str(thisrow["end"])
        else:
            thisname = thisrow["scrambleObj"]
        if combined:
            if thisname not in this.keys():
                this[thisname] = {}
                this[thisname]["0"] = getColor(df.iloc[i], col2use, color_d)
            else:
                maxkey = [int(i) for i in this[thisname].keys()]
                maxkey = np.max(maxkey) + 1
                this[thisname][str(maxkey)] = getColor(df.iloc[i], col2use, color_d)
        else:
            this[thisname] = {}
            this[thisname][colName] = getColor(df.iloc[i], col2use, color_d)
    thisdf = pd.DataFrame.from_dict(this,orient="index")
    if combined:
        thisdf.columns = ["{}_{}".format(colName,i) for i in thisdf.columns]

    thisdf = thisdf.fillna("#ffffff")
    return(thisdf)

def getColor(x, col2use, thesecolors):

    thisentry = x[col2use]
    direction = col2use.split("_")[1]
    thisposition = x["position_" + direction]
    #print(x)
    if thisposition is None:
        return "lightgrey"
    else:
        thisjcn = thisentry.split(":")
        if thisposition == "first":
            thisjcn_ref = thisjcn[0]
            thisjcn = thisjcn[1]
        elif thisposition == "second":
            thisjcn_ref = thisjcn[1]
            thisjcn = thisjcn[0]

    if thisjcn != "other":
        strand = thisjcn[0]
        thisjcn = thisjcn[1:]
        if thisjcn_ref != "other":
            strand_ref = thisjcn_ref[0]
            thisjcn_ref = thisjcn_ref[1:]
            if strand_ref == "-":
                # flip the strandedness
                if strand == "-":
                    strand = "+"
                else:
                    strand = "-"
    else:
        strand = "+"


    #print(thisjcn)
    thiscolor = thesecolors[thisjcn]
    thiscolor = tuple([int(i * 100) for i in thiscolor])
    if strand == "+":
        thisc = Color('#%02x%02x%02x' % thiscolor, luminance=0.5)
    else:
        thisc = Color('#%02x%02x%02x' % thiscolor, luminance=0.85)
    return(thisc.get_rgb())

## mostly for plotting read tracks

def sortByCosine(kernelObj, ref = None):
    cosine_similarity = pd.DataFrame(kernelObj.cosine_similarity, index = kernelObj.coverage.columns, columns = kernelObj.coverage.columns)
    if ref is not None:
        this = cosine_similarity[ref].sort_values()
    else:
        this = cosine_similarity.iloc[0].sort_values()
    return([i for i in this.index])

def aggCovs(gene, kernel_feature,
             kernel_upstream_same = None, kernel_upstream_opposite = None,
             kernel_downstream_same = None, kernel_downstream_opposite = None,
             strains = None, min_cov = 5, log_scale = True):
    # all the kernel datasets for a gene
    data = kernel_feature[gene]

    # restrict strains by coverage and custom selection
    df = data.coverage
    col2keep = df.sum()
    col2keep = [i for i,j in col2keep.items() if j >= min_cov]
    if strains is not None:
        # strains should be a list
        col2keep = [i for i in col2keep if re.match("|".join(strains),i)]
    df = df[col2keep]

    df = df.reset_index(drop=False)
    # reshape
    df = df.melt(id_vars="position")
    if log_scale:
        df["value"] = [np.log2(i+1) for i in df["value"]]
    df_col_names = df.columns
    df = df.rename(columns={"value":"feature"})

    if kernel_upstream_same is not None:
        df_upstream = kernel_upstream_same[gene].coverage
        df_upstream = df_upstream[col2keep]
        df_upstream = df_upstream.reset_index(drop=False)
        df_upstream = df_upstream.melt(id_vars="position")
        if log_scale:
            df_upstream["value"] = [np.log2(i+1) if i > 1 else 0 for i in df_upstream["value"]]
        df_upstream = df_upstream.rename(columns={"value":"upstream_same"})
    else:
        df_upstream = pd.DataFrame(columns = df_col_names)
        df_upstream = df_upstream.rename(columns={"value":"upstream_same"})

    if kernel_upstream_opposite is not None:
        df_upstream_opp = kernel_upstream_opposite[gene].coverage
        df_upstream_opp = df_upstream_opp[col2keep]
        df_upstream_opp = df_upstream_opp.reset_index(drop=False)
        df_upstream_opp = df_upstream_opp.melt(id_vars="position")
        if log_scale:
            df_upstream_opp["value"] = [np.log2(i+1) for i in df_upstream_opp["value"]]
        df_upstream_opp["value"] = [i*-1  for i in df_upstream_opp["value"]]
        df_upstream_opp = df_upstream_opp.rename(columns={"value":"upstream_opp"})
    else:
        df_upstream_opp = pd.DataFrame(columns = df_col_names)
        df_upstream_opp = df_upstream_opp.rename(columns={"value":"upstream_opp"})

    if kernel_downstream_same is not None:
        df_downstream = kernel_downstream_same[gene].coverage
        df_downstream = df_downstream[col2keep]
        df_downstream = df_downstream.reset_index(drop=False)
        df_downstream = df_downstream.melt(id_vars="position")
        if log_scale:
            df_downstream["value"] = [np.log2(i+1) for i in df_downstream["value"]]
        df_downstream = df_downstream.rename(columns={"value":"downstream_same"})
    else:
        df_downstream = pd.DataFrame(columns = df_col_names)
        df_downstream = df_downstream.rename(columns={"value":"downstream_same"})

    if kernel_downstream_opposite is not None:
        df_downstream_opp = kernel_downstream_opposite[gene].coverage
        df_downstream_opp = df_downstream_opp[col2keep]
        df_downstream_opp = df_downstream_opp.reset_index(drop=False)
        df_downstream_opp = df_downstream_opp.melt(id_vars="position")
        if log_scale:
            df_downstream_opp["value"] = [np.log2(i+1) for i in df_downstream_opp["value"]]
        df_downstream_opp["value"] = [i*-1  for i in df_downstream_opp["value"]]
        df_downstream_opp = df_downstream_opp.rename(columns={"value":"downstream_opp"})
    else:
        df_downstream_opp = pd.DataFrame(columns = df_col_names)
        df_downstream_opp = df_downstream_opp.rename(columns={"value":"downstream_opp"})

    df = pd.merge(df, df_upstream, on=["id","position"],how = "outer")
    df = df.fillna(0)
    df = pd.merge(df, df_upstream_opp, on=["id","position"],how = "outer")
    df = df.fillna(0)
    df = pd.merge(df, df_downstream, on=["id","position"],how = "outer")
    df = df.fillna(0)
    df = pd.merge(df, df_downstream_opp, on=["id","position"],how = "outer")
    df = df.fillna(0)

    #order columns
    this_order = [i for i in sortByCosine(data) if i in col2keep]
    this_order_d = dict(zip(this_order,range(0,len(this_order))))
    df["order"] = [this_order_d[i] for i in df["id"]]

    featuresize = max(data.annotations["end"] - data.annotations["start"])
    df["featuresize"] = featuresize

    df = df.sort_values(["order","position"])

    return(df)

def read2gene(readid,
              strain,
              stranded = True,
              readbase = "/g/steinmetz/project/IESY/sequencing/Results/minION/combined/combined/directrna/bed/distinguishing",
              annotationbase = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed"):

    if ((strain == "BY4741") or (strain == "SLS045")):
        strain_a = "S288C"
    else:
        strain_a = strain

    thisuuid = uuid.uuid4()
    thispath = "{}/{}".format(getTmpdir(),thisuuid)

    if not os.path.exists(thispath):
        os.makedirs(thispath)

    pybedtools.set_tempdir(thispath)

    reads = pybedtools.BedTool("{}/{}.bed".format(readbase, strain)).to_dataframe()
    reads = reads.loc[reads["name"]==readid]
    if reads.shape[0] > 0:
        reads = pybedtools.BedTool(reads.to_string(index=False,header=False),from_string=True)

        annotations = pybedtools.BedTool("{}/{}_genes.bed".format(annotationbase, strain_a))

        if stranded:
            genes = annotations.intersect(reads, wa=True, s=True)
        else:
            genes = annotations.intersect(reads, wa=True)
        genes = genes.to_dataframe()
        return(genes)
    else:
        print("Could not find read name {} in {}/{}.bed".format(readid, readbase, strain))
        return(pd.DataFrame())

def gene2read(gene,
              strain,
              stranded = True,
              readbase = "/g/steinmetz/project/IESY/sequencing/Results/minION/combined/combined/directrna/bed/distinguishing",
              annotationbase = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed"):

    if ((strain == "BY4741") or (strain == "SLS045")):
        strain_a = "S288C"
    else:
        strain_a = strain

    def translateQuery(query):
        if type(query) is list:
            # important to sort query for bed file!!
            query.sort()
            thesequeries = ["^{}$|^{}-[0-9]+$|={};|={}-[0-9].+;".format(str(i),str(i),str(i),str(i)) for i in query]
            return("|".join(thesequeries))
        else:
            return("^{}$|^{}-[0-9]+$|={};|={}-[0-9].+;".format(str(query),str(query),str(query),str(query)))

    thisuuid = uuid.uuid4()
    thispath = "{}/{}".format(getTmpdir(),thisuuid)

    if not os.path.exists(thispath):
        os.makedirs(thispath)

    pybedtools.set_tempdir(thispath)

    annotations = pybedtools.BedTool("{}/{}_genes.bed".format(annotationbase, strain_a)).to_dataframe()
    annotations = annotations.loc[annotations["name"].str.contains(translateQuery(gene))]
    #print(annotations)
    if annotations.shape[0] > 0:
        df = []
        reads = pybedtools.BedTool("{}/{}.bed".format(readbase, strain))
        for i in range(annotations.shape[0]):
            thisquery = annotations.iloc[i]["name"]
            thisannotation = pybedtools.BedTool(annotations.iloc[[i]].to_string(index=False,header=False),from_string=True)

            if stranded:
                thesereads = reads.intersect(thisannotation, wa=True, s=True)
            else:
                thesereads = reads.intersect(thisannotation, wa=True)
            if (thesereads.count() > 0):
                thesereads = thesereads.to_dataframe()
                thesereads = thesereads.assign(query = thisquery)
                df.append(thesereads)
            else:
                df.append(pd.DataFrame())
        return(pd.concat(df))
    else:
        print("Could not find gene {} in reads {}/{}.bed".format(gene, readbase, strain))
        return(pd.DataFrame())

def performPolyATest(thisStrain, gene, refStrain, stranded, polyadir, readbase, annotationbase, returnRaw):
    try:
        refReads = gene2read(gene, refStrain, stranded, readbase, annotationbase)
        testReads = gene2read(gene, thisStrain, stranded, readbase, annotationbase)

        refPolya = pd.read_csv(polyadir + "/{}/polya_results.tsv".format(refStrain), sep = "\t", header=0)
        refPolya = refPolya.loc[(refPolya["qc_tag"]=="PASS") & (refPolya["readname"].isin(list(set(refReads["name"]))))]

        testPolya = pd.read_csv(polyadir + "/{}/polya_results.tsv".format(thisStrain), sep = "\t", header=0)
        testPolya = testPolya.loc[(testPolya["qc_tag"]=="PASS") & (testPolya["readname"].isin(list(set(testReads["name"]))))]

        ref_combined = pd.merge(refReads, refPolya, left_on = "name", right_on = "readname")
        test_combined = pd.merge(testReads,testPolya, left_on = "name", right_on = "readname")

        if returnRaw:
            o = [test_combined,ref_combined]
        else:
            o = pd.DataFrame({
                "strain" : thisStrain,
                "refStrain" : refStrain,
                "mean_polyA" : test_combined["polya_length"].mean(),
                "median_polyA" : test_combined["polya_length"].median(),
                "max_polyA" : test_combined["polya_length"].max(),
                "ks_wt_pval" : ks_2samp(test_combined["polya_length"],ref_combined["polya_length"]).pvalue,
                "testReads" : testReads.shape[0],
                "refReads" : refReads.shape[0]
            },index=[0])
    except:
        o = pd.DataFrame()
    return(o)

def testPolyA(gene,
              polyadir = "/g/steinmetz/project/IESY/sequencing/Results/minION/combined/analysis/polya/directrna",
              readbase = "/g/steinmetz/project/IESY/sequencing/Results/minION/combined/combined/directrna/bed/distinguishing",
              annotationbase = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed",
              stranded = True,
              cores = 32,
              refStrain = "BY4741"):


    pool = mp.Pool(processes=cores)

    thesepolya = glob.glob(polyadir + "/**/polya_results.tsv", recursive=True)
    strains = [i.split("/")[-2] for i in thesepolya]

    fcn = partial(performPolyATest,
                  gene = gene,
                  refStrain = refStrain,
                  stranded = stranded,
                  polyadir = polyadir,
                  readbase = readbase,
                  annotationbase = annotationbase,
                  returnRaw = False
                  )

    results = pool.map(fcn, strains)

    return(results)
