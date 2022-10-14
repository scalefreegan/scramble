import pybedtools
import collections
import pandas as pd
from functools import partial
import multiprocessing as mp
import os
import pickle
from pathlib import Path
import numpy as np
import glob
from itertools import chain
import pdb

# def parallelize_dataframe(df, func, n_cores=32):
#     df_split = np.array_split(df, n_cores)
#     pool = Pool(n_cores)
#     df = pd.concat(pool.map(func, df_split))
    # pool.close()
    # pool.join()
#     return df

def fastConcat(results):

    def fast_flatten(input_list):
        return list(chain.from_iterable(input_list))

    COLUMN_NAMES = results[0].columns
    namelist = list(COLUMN_NAMES)
    df_dict = dict.fromkeys(COLUMN_NAMES, [])

    # remove any results without all COLUMN_NAMES
    resultsnew = []
    for i in results:
        if (list(i.columns) == namelist):
            resultsnew.append(i)
    results = resultsnew

    for col in COLUMN_NAMES:
        # Use a generator to save memory
        extracted = (frame[col] for frame in results)

        # Flatten and save to df_dict
        df_dict[col] = fast_flatten(extracted)

    return(pd.DataFrame.from_dict(df_dict)[COLUMN_NAMES])

def getRanking(bed):
    startCounter = collections.Counter(bed["start"])
    startCounter_sorted = sorted(startCounter, key=startCounter.get, reverse=True)

    endCounter = collections.Counter(bed["end"])
    endCounter_sorted = sorted(endCounter, key=endCounter.get, reverse=True)

    topStart = startCounter[startCounter_sorted[0]]
    topEnd = endCounter[endCounter_sorted[0]]

    if topEnd > topStart:
        return({
            "position" : "end",
            "loc" : endCounter_sorted[0],
            "count" : endCounter[endCounter_sorted[0]]
        })
    else:
        return({
            "position" : "start",
            "loc" : startCounter_sorted[0],
            "count" : startCounter[startCounter_sorted[0]]
        })

def makeClusters(bed,ranking, clusterstart=1, threshold = 5):

    bedout = pd.DataFrame()

    # matches
    # get all entries top
    matchtop = bed.loc[bed[ranking["position"]]==ranking["loc"]]
    # get all other end of molecule top
    if ranking["position"] == "end":
        opppos = "start"

    else:
        opppos = "end"
    matchcounter = collections.Counter(matchtop[opppos])
    matchcounter_sorted = sorted(matchcounter, key=matchcounter.get, reverse=True)

    while len(matchcounter_sorted) > 0:
        topentry = matchcounter_sorted[0]
        topentry_range = list(range(topentry-threshold,topentry+threshold))
        sub_matchtop = matchtop.loc[matchtop[opppos].isin(topentry_range)]
        if ranking["position"] == "start":
            sub_matchtop = sub_matchtop.assign(clusterStart = ranking["loc"],
                clusterEnd = topentry, clusterId = clusterstart)
        else:
            #pdb.set_trace()
            sub_matchtop = sub_matchtop.assign(clusterStart = topentry,
                clusterEnd = ranking["loc"], clusterId = clusterstart)
        bedout = pd.concat([bedout, sub_matchtop])
        clusterstart = clusterstart + 1
        matchcounter_sorted = [i for i in matchcounter_sorted if i not in topentry_range]

    #non-matches
    unmatched = bed.loc[bed[ranking["position"]]!=ranking["loc"]]

    return(bedout,unmatched,clusterstart)

def finalClustersWrapper(chrom, bed, threshold):
    bed = bed.loc[bed["chrom"]==chrom]
    print(bed.shape)
    out = makeClusters_final(bed, clusterstart=1, threshold = threshold)
    return(out)

def makeClusters_final(bed, clusterstart=1, threshold = 25):

    def mostCommon(x):
        return(collections.Counter(x).most_common(1)[0][0])

    def getCluster(x, out, clusterstart):
        #import pdb; pdb.set_trace()
        this = x.iloc[0]
        thischr = this["chrom"]
        thisstart = this["clusterStart"]
        thisend = this["clusterEnd"]
        thisstrand = this["read_strand"]
        matches = x.loc[
            (x["chrom"]==thischr) &
            ((x["clusterStart"] >= thisstart - threshold) & (x["clusterStart"] <= thisstart + threshold)) &
            ((x["clusterEnd"] >= thisend - threshold) & (x["clusterEnd"] <= thisend + threshold) &
            (x["strand"]==thisstrand))
        ]

        if matches.shape[0]==0:
            matches = pd.DataFrame(this).T

        strains = list(set(matches["strain"]))
        strains.sort()

        d = {
            "chrom" : mostCommon(matches["chrom"]),
            "clusterStart" : mostCommon(matches["clusterStart"]),
            "clusterEnd" : mostCommon(matches["clusterEnd"]),
            "strand" : mostCommon(matches["read_strand"]),
            "start_dist" : mostCommon(matches["start_dist"]),
            "end_dist" : mostCommon(matches["end_dist"]),
            "transcript" : mostCommon(matches["transcript"]),
            "features" : mostCommon(matches["features"]),
            "feature_type" : mostCommon(matches["type"]),
            "feature_start" : mostCommon(matches["start"]),
            "feature_end" : mostCommon(matches["end"]),
            "strain" : "|".join(strains),
            "len" : mostCommon(matches["len"]),
            "ref_chr" : mostCommon(matches["ref_chr"]),
            "ref_start" : mostCommon(matches["ref_start"]),
            "ref_end"  : mostCommon(matches["ref_end"]),
            "lenMatch" : mostCommon(matches["lenMatch"]),
            "mtif" : mostCommon(matches["mtif"]),
            "mtif_closest": mostCommon(matches["mtif_closest"]),
            "mtif_closest_start": mostCommon(matches["mtif_closest_start"]),
            "mtif_closest_end": mostCommon(matches["mtif_closest_end"]),
            "nreads": np.nansum(matches["nreads"]),
            "junction": mostCommon(matches["junction"]),
            "loxpend" : mostCommon(matches["loxpend"]),
            "noveljcn": mostCommon(matches["noveljcn"]),
            "clusterID": clusterstart,
            "libsize" : np.nansum(matches.drop_duplicates(["strain"])["libsize"]),
        }
        sub_matchtop = pd.DataFrame(d, index=[0])
        out = pd.concat([out, sub_matchtop])
        clusterstart = clusterstart + 1
        remaining = x.loc[
            ~((x["chrom"]==thischr) &
            (x["clusterStart"] >= thisstart - threshold) & (x["clusterStart"] <= thisstart + threshold) &
            (x["clusterEnd"] >= thisend - threshold) & (x["clusterEnd"] <= thisend + threshold) &
            (x["read_strand"]==thisstrand))
        ]
        remaining = remaining.sort_values("tpm", ascending=False)
        return(remaining, out, clusterstart)

    bedout = pd.DataFrame()

    bed_sorted = bed.sort_values("tpm", ascending=False)

    while bed_sorted.shape[0] > 0:
        if bed_sorted.shape[0]%10000<=100:
            print(bed_sorted.shape)
        # most abundant
        try:
            bed_sorted, bedout, clusterstart = getCluster(bed_sorted, bedout, clusterstart)
        except:
            import pdb; pdb.set_trace()

    bedout = bedout.assign(tpm = (bedout.nreads/bedout.libsize)*1e6)

    return(bedout)

def makeClusters_recursive(bed, clusterstart = 1, threshold = 5):

    # first pass
    thisrank = getRanking(bed)
    newbed, restbed, clusternumber = makeClusters(bed,thisrank,clusterstart,threshold)

    while restbed.shape[0] > 0:
        thisrank = getRanking(restbed)
        newbed_tmp, restbed, clusternumber = makeClusters(restbed, thisrank,clusternumber,threshold)
        newbed = pd.concat([newbed, newbed_tmp])
    return(newbed)

def runStrain(strain, chrom ="chrIX", save = False,
                genebeddir = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed",
                tokeep = "CUT|SUT|XUT|gene|rRNA_gene|tRNA_gene|snRNA_gene",
                cores = 1,
                threshold = 5,
                custombed = False,
                base = "/g/steinmetz/project/IESY/analysis/rna/isoforms/"
             ):
    threshold = int(threshold)
    if save:
        Path(base+"clusters/{}/{}/".format(str(threshold),strain)).mkdir(parents=True, exist_ok=True)
        if "chrIX" in chrom:
            if strain in ["BY4741", "SLS045"]:
                thisf = base + "clusters/{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
            else:
                thisf = base + "clusters/{}/{}/directrna_isoforms_{}_syn{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
        else:
            thisf = base + "clusters/{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
        if os.path.isfile(thisf):
            out = pickle.load(open(thisf,'rb'))
            return(out)

    if type(chrom) is not list:
        chrom = [chrom]
    if type(custombed) == str:
        thisreads = pybedtools.BedTool(custombed)
    else:
        bedbase = "/g/steinmetz/project/IESY/sequencing/Results/minION/combined/combined/directrna/bed/distinguishing/{}.bed"
        thisreads = pybedtools.BedTool(bedbase.format(strain))
    thisreads_df = thisreads.to_dataframe()
    thisreads_df = thisreads_df.sort_values(["chrom","start","end"])
    thisreads_df_unique = thisreads_df.drop_duplicates(["name"])
    if "chrIX" in chrom:
        if strain in ["BY4741", "SLS045"]:
            thisreads_df_unique = thisreads_df_unique\
                            .loc[thisreads_df_unique["chrom"].isin(chrom)]
        else:
            thisreads_df_unique = thisreads_df_unique\
                              .loc[thisreads_df_unique["chrom"]\
                              .str.contains(strain)]
    else:
        thisreads_df_unique = thisreads_df_unique.loc[thisreads_df_unique["chrom"].isin(chrom)]
    #thisreads_df = thisreads_df.sample(2000)
    tmp_out = makeClusters_recursive(thisreads_df_unique, threshold = threshold)
    tmp_out = tmp_out[["name","clusterStart","clusterEnd","clusterId"]]
    out = pd.merge(thisreads_df,tmp_out,on="name")
    out["strain"] = strain
    out = out.sort_values(["chrom","start","end"])
    out = out.drop_duplicates(["chrom","start","end","name"])
    out = intersectBed(strain, out, genebeddir = genebeddir,
        tokeep = tokeep, cores = cores,threshold = threshold)
    out = out.sort_values(["chrom","read_start","read_end","clusterId","start","end"])
    out = out.drop_duplicates(["read_name"])
    if save:
        pickle.dump(out, open(thisf, "wb"))

    return(out)

def getDist(intersect_row, location = ["start","end"][0]):
    if intersect_row[5] == "+":
        start_dist = intersect_row[10] - intersect_row[1]
        end_dist = intersect_row[11] - intersect_row[2]
    else:
        start_dist = -1*(intersect_row[11] - intersect_row[2])
        end_dist = -1*(intersect_row[10] - intersect_row[1])
    if location == "start":
        return(start_dist)
    else:
        return(end_dist)

def getType(read, df, threshold = 25):
    thisdf = df.loc[df[12]==read]
    thisdf = thisdf.drop_duplicates([3])
    thisdf = thisdf.sort_values([0,1,2])
    # account for multimappers on syn chrs
    theseindex = [i for i, x in enumerate(np.insert(np.diff(thisdf[1]),0,0) > 5000) if x]
    #selectedindex =  [i for i, x in enumerate(np.insert(np.diff(theseindex),0,1) == 1) if x]
    if len(theseindex) > 0:
        thisdf2 = thisdf.iloc[0:theseindex[0]]
    else:
        thisdf2 = thisdf
    # special case for transcripts that are orf/ncRNA
    if (((thisdf2.loc[~thisdf2[3].str.contains("CUT|XUT|SUT|snR")].shape[0]) == 1) &
        (thisdf2.shape[0] > 1)):
        thisdf = thisdf.loc[~thisdf[3].str.contains("CUT|XUT|SUT|snR")]
        theseindex = [i for i, x in enumerate(np.insert(np.diff(thisdf[1]),0,0) > 5000) if x]
        if len(theseindex) > 0:
            thisdf2 = thisdf.iloc[0:theseindex[0]]
        else:
            thisdf2 = thisdf

    if (thisdf2.loc[~thisdf2[3].str.contains("CUT|XUT|SUT|snR")].shape[0]) == 1:
        # print("case1")
        # pdb.set_trace()
        if (thisdf.iloc[0]["start_dist"] <= (0 + threshold)) \
            & (thisdf.iloc[0]["end_dist"] >= (0 - threshold)):
            thisdf["type"] = 'Covering_one_intact_ORF'
        elif (thisdf.iloc[0]["start_dist"] <= (0 + threshold)) \
            & (thisdf.iloc[0]["end_dist"] < (0 - threshold)):
            thisdf["type"] = "Overlap_5'_of_one_ORF"
        elif (thisdf.iloc[0]["start_dist"] > (0 + threshold)) \
            & (thisdf.iloc[0]["end_dist"] >= (0 - threshold)):
            thisdf["type"] = "Overlap_3'_of_one_ORF"
        elif (thisdf.iloc[0]["start_dist"] > (0 + threshold)) \
            & (thisdf.iloc[0]["end_dist"] < (0 - threshold)):
            thisdf["type"] = "Intragenic_transcripts"
        else:
            thisdf["type"] = "Unknown"
    elif (thisdf2.loc[~thisdf2[3].str.contains("CUT|XUT|SUT|snR")].shape[0]) > 1:
        thisdf2 = thisdf2.loc[~thisdf2[3].str.contains("CUT|XUT|SUT|snR")]
        # print("case2")
        # pdb.set_trace()
        if (sum(thisdf2["start_dist"] <=( 0 + threshold))>0) & \
            (sum(thisdf2["end_dist"] >= ( 0 - threshold))>0):
            thisdf["type"] = 'Covering_>=2_ORFs'
        else:
            thisdf["type"] = 'Overlap_>=2_ORFs'
    else:
        # print("case3")
        # pdb.set_trace()
        thisdf2 = thisdf2.loc[thisdf2[3].str.contains("CUT|XUT|SUT|snR")]
        if (thisdf2.shape[0] > 1):
            # print("case4")
            # pdb.set_trace()
            if (sum(thisdf2["start_dist"] <=( 0 + threshold))>0) & \
                (sum(thisdf2["end_dist"] >= ( 0 - threshold))>0):
                thisdf["type"] = 'Covering_>=2_ncRNAs'
            else:
                thisdf["type"] = 'Overlap_>=2_ncRNAs'
        else:
            # print("case5")
            # pdb.set_trace()
            if thisdf[3].str.contains("CUT|XUT").any():
                thisdf["type"] = 'CUT/XUT'
            elif thisdf[3].str.contains("SUT").any():
                thisdf["type"] = 'SUT'
            elif thisdf[3].str.contains("snR").any():
                thisdf["type"] = 'snRNA'
    thisdf = thisdf.assign(features = "|".join(thisdf2[3]))
    minc = np.min(thisdf2[1])
    maxc = np.max(thisdf2[2])
    mind = np.min(thisdf2["start_dist"])
    maxd = np.max(thisdf2["end_dist"])
    ovlp = np.sum(thisdf2[19])
    thisdf = thisdf.iloc[[0]]
    thisdf[1] = minc
    thisdf[2] = maxc
    thisdf["start_dist"] = mind
    thisdf["end_dist"] = maxd
    thisdf[19] = ovlp
    #if re.match(re.compile("YIR018W"),"|".join(list(thisdf["features"]))):
        #pdb.set_trace()
    return(thisdf)

def intersectBed(strain,
                 isoform_df,
                 genebeddir = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed",
                 tokeep = "CUT|SUT|XUT|gene|rRNA_gene|tRNA_gene|snRNA_gene",
                 cores = 1,
                 threshold = 5):

    threshold = int(threshold)

    if strain in ["BY4741","SLS045"]:
        newstrain = "S288C"
    else:
        newstrain = strain

    theseisoforms_bed = pybedtools.BedTool(isoform_df.to_string(index=False,
                        header=False),from_string=True)

    annotations = pybedtools.BedTool(genebeddir.format(newstrain))
    annotations_df = pd.read_csv(annotations.fn, sep="\t",header=None)


    annotations_df = annotations_df.loc[annotations_df[7].str.contains(tokeep)]
    altnames = [i.split("=")[1].rstrip(";") for i in annotations_df.loc[annotations_df[3]==".",9]]
    annotations_df.loc[annotations_df[3]==".",3] = altnames
    # remove bad columns (too much text)
    annotations_df = annotations_df[list(annotations_df.columns)[0:9]]
    annotations_bed = pybedtools.BedTool(annotations_df.to_string(index=False,
                        header=False),from_string=True)

    annots_isoforms = annotations_bed.intersect(theseisoforms_bed,wo=True, s=True)
    annots_isoforms_df = pd.read_csv(annots_isoforms.fn, sep="\t",header=None)
    annots_isoforms_df["strain"] = strain
    annots_isoforms_df["start_dist"] = [getDist(annots_isoforms_df.iloc[i], \
                                        location = "start") for i in \
                                        range(0,annots_isoforms_df.shape[0])]
    annots_isoforms_df["end_dist"] = [getDist(annots_isoforms_df.iloc[i], \
                                        location = "end") for i in \
                                        range(0,annots_isoforms_df.shape[0])]
    if cores > 1:
        pool = mp.Pool(processes=cores)
        arg = list(set(annots_isoforms_df[12]))
        fcn = partial(getType,
                      df = annots_isoforms_df)
        results = pool.map(fcn, arg)
        new_df = fastConcat(results)
        pool.close()
        pool.join()
    else:
        arg = list(set(annots_isoforms_df[12]))
        results = [getType(i,df = annots_isoforms_df,threshold = threshold) for i in arg]
        new_df = pd.concat(results)
    oldcols =  [0, 1, 2, 5, 7, 10,11,12,14,19,
        "strain","start_dist","end_dist","type","features"]
    newcols = ["chrom", "start", "end", "strand", "type", "read_start","read_end","read_name",
        "read_strand","overlap","strain","start_dist","end_dist","transcript","features"]
    new_df = new_df[oldcols]
    new_df = new_df.rename(columns=dict(zip(oldcols,newcols)))


    nomatch = theseisoforms_bed.intersect(annotations_bed,wo=True, s=True, v=True)
    nomatch = nomatch.to_dataframe()
    nomatch["strain"] = strain
    nomatch["start_dist"] = None
    nomatch["end_dist"] = None
    nomatch["type"] = 'Intergenic_transcripts'

    oldcols2 =  ["chrom", "start", "end", "name","strand", "strain","type"]
    newcols2 = ["chrom", "read_start", "read_end", "read_name", "read_strand", "strain","transcript"]
    nomatch = nomatch[oldcols2]
    nomatch = nomatch.rename(columns=dict(zip(oldcols2,newcols2)))

    out =  pd.concat([new_df, nomatch])
    out = out[newcols]
    out["len"] = out["read_end"] - out["read_start"]
    oo = pd.merge(out, isoform_df[["name","clusterStart","clusterEnd","clusterId"]], left_on="read_name",right_on="name")
    oo = oo.drop(columns=["name"])
    return(oo)

# def intersectBed_multi(strains,isoform_df,cores=32,
#                        genebeddir = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}_genes.bed",
#                        toremove = "three_prime_UTR|five_prime_UTR",
#                        savefile = "/g/steinmetz/project/IESY/analysis/rna/isoforms/directrna_isoformsVfeatures.pickle"):
#     if not os.path.isfile(savefile):
#         pool = mp.Pool(processes=cores)
#         fcn = partial(intersectBed,
#                       isoform_df = isoform_df,
#                       genebeddir = genebeddir,
#                       toremove = toremove)
#         results = pool.map(fcn, strains)
#         isoform_annotations = pd.concat(results)
#         pickle.dump(isoform_annotations, open(savefile, "wb"))
#     else:
#         isoform_annotations = pickle.load(open(savefile, "rb"))
#     return(isoform_annotations)

def getGeneCounts(intersectbed,
                  fullbeddir = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed"):
    if strain in ["BY4741","SLS045"]:
        newstrain = "S288C"
        chrom = "chrIX"
    else:
        newstrain = strain
        chrom = "{}_1".format(newstrain)
    annotations_full = pd.read_csv(fullbeddir.format(newstrain),sep = "\t", header=None)
    synixrgenes = list(annotations_full.loc[(annotations_full[0]==chrom) & (annotations_full[7]=="gene")][3])
    readcount = collections.Counter(intersectbed[3])
    genecount = pd.Series({i:readcount[i] for i in synixrgenes}).reset_index().sort_values(0)
    genecount["cn"] = [i.split("-")[-1] if strain not in ["JS94","BY4741","SLS045"] else 1 for i in genecount["index"]]
    genecount["name"] = [i.rstrip("-123456789") for i in genecount["index"]]
    genecount["strain"] = strain
    return(genecount)

def getOvlps(start_end_tuple, refin, df, threshold=5):

    ## NEED TO CHANGE THIS FOR FEATURE BASED WITH SYNIXR!

    out = df.loc[(df["clusterStart"]==start_end_tuple[0]) &
                (df["clusterEnd"]==start_end_tuple[1])]

    refin["start_dist"] = abs(refin["clusterStart"] - start_end_tuple[0])
    refin["end_dist"] = abs(refin["clusterEnd"] - start_end_tuple[1])
    refin = refin.loc[(refin["start_dist"]<=threshold) & (refin["end_dist"]<=threshold)]
    refin = refin.sort_values(["start_dist","end_dist"])

    if refin.shape[0] > 0:
        out = out.assign(ref_chr = refin.iloc[0]["chrom"],
            ref_start = refin.iloc[0]["clusterStart"],
            ref_end = refin.iloc[0]["clusterEnd"]
        )
    else:
        out = out.assign(ref_chr = None,
            ref_start = None,
            ref_end = None
        )
    return(out)


def ovlpRefByLen(strain, ref, chrom, cores = 32, threshold = 5,
                 inbase="/g/steinmetz/project/IESY/analysis/rna/isoforms/clusters/",
                 outbase = "/g/steinmetz/project/IESY/analysis/rna/isoforms/ovlps/",
                 save = True,
                 mtif = "/g/steinmetz/project/IESY/tifseq/mtifs.tsv",
                 novelf = "/g/steinmetz/project/IESY/genomes/annotations/scramble/noveljcns/noveljcns.pickle"):

    threshold = int(threshold)

    if save:
        Path(outbase + "{}/{}/".format(str(threshold),strain)).mkdir(parents=True, exist_ok=True)
        if "chrIX" in chrom:
            if strain in ["BY4741", "SLS045"]:
                thisf_out = outbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
            else:
                thisf_out = outbase + "{}/{}/directrna_isoforms_{}_syn{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
        else:
            thisf_out = outbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))

        if os.path.isfile(thisf_out):
            out = pickle.load(open(thisf_out,'rb'))
            return(out)

    if "chrIX" in chrom:
        if strain in ["BY4741", "SLS045"]:
            thisf = inbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
        else:
            thisf = inbase + "{}/{}/directrna_isoforms_{}_syn{}.pickle".format(str(threshold),strain,strain,"".join(chrom))
    else:
        thisf = inbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),strain,strain,"".join(chrom))

    if "chrIX" in chrom:
        if ref in ["BY4741", "SLS045"]:
            thisf_ref = inbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),ref,ref,"".join(chrom))
        else:
            thisf_ref = inbase + "{}/{}/directrna_isoforms_{}_syn{}.pickle".format(str(threshold),ref,ref,"".join(chrom))
    else:
        thisf_ref = inbase + "{}/{}/directrna_isoforms_{}_{}.pickle".format(str(threshold),ref,ref,"".join(chrom))

    df = pickle.load(open(thisf,'rb'))
    refdf = pickle.load(open(thisf_ref,'rb'))

    #df = df.sample(1000)
    #refdf = refdf.sample(1000)

    #queries = list(range(0,refdf.shape[0]))
    queries = list(set(list(zip(df["clusterStart"],df["clusterEnd"]))))
    pool = mp.Pool(processes=cores)
    #fcn = partial(isoformCluster.getOvlps,
    fcn = partial(getOvlps,
                  refin = refdf,
                  df = df,
                  threshold = threshold)
    results = pool.map(fcn, queries)

    #ovlplens_match = pd.concat(results)
    ovlplens_match = fastConcat(results)
    ovlplens_match = ovlplens_match.dropna(subset = ["ref_chr", "ref_start","ref_end"])
    pool.close()
    pool.join()

    ovlplens_nomatch = ovlplens_match.merge(df, indicator = True, how = "right")
    ovlplens_nomatch = ovlplens_nomatch.loc[ovlplens_nomatch["_merge"]=="right_only"].drop(columns="_merge")
    ovlplens_match["lenMatch"] = True
    ovlplens_nomatch["lenMatch"] = False
    ovlplens = pd.concat([ovlplens_match, ovlplens_nomatch])
    ovlplens = ovlplens.sort_values(["chrom","read_start","read_end","clusterId","start","end"])



    out = add_mtifs(ovlplens, threshold = threshold,
    #out = add_mtifs(ovlplens, threshold = threshold,
                    mtifs = mtif,
                    cores = cores)

    out = add_noveljunctions(out,
                       strain,
                       novelf = novelf)

    out2 = out.drop_duplicates(["read_name"])
    thiscount = out2.groupby("clusterId").size().reset_index().rename(columns={0:"nreads"})
    out = pd.merge(out,thiscount, on="clusterId")

    out = out.drop_duplicates()
    out = out.sort_values(["chrom","read_start","read_end","nreads","clusterId","start","end"])

    if save:
        pickle.dump(out,open(thisf_out, "wb"))

    return(out)

def match_mtif(start_end_tuple, df, mtifs_df, threshold):
    ## NEED TO ADD STRAND!
    this = df.loc[(df["clusterStart"]==start_end_tuple[0]) &
                (df["clusterEnd"]==start_end_tuple[1])]
    thischr = this.iloc[0]["chrom"]
    thisstrand = this.iloc[0]["read_strand"]
    if thischr not in set(mtifs_df["chrom"]):
        if this["lenMatch"].any():
            thisstart = this.iloc[0]["ref_start"]
            thisend = this.iloc[0]["ref_end"]
            thischr = this.iloc[0]["ref_chr"]
        else:
            this = this.assign(mtif = False, mtif_closest = None,
                               mtif_closest_start = None, mtif_closest_end = None)
            return(this)
    else:
        thisstart = this.iloc[0]["clusterStart"]
        thisend = this.iloc[0]["clusterEnd"]
    thesemtifs = mtifs_df.loc[(mtifs_df["chrom"]==thischr) & (mtifs_df["strand"]==thisstrand)]

    thesemtifs = thesemtifs.assign(start_dist = abs(thesemtifs["start"] - thisstart))
    thesemtifs = thesemtifs.assign(end_dist = abs(thesemtifs["end"] - thisend))
    thesemtifs = thesemtifs.assign(avg_dist = (thesemtifs["start_dist"] + thesemtifs["end_dist"])/2)
    matches = thesemtifs.loc[(thesemtifs["start_dist"]<=threshold) & (thesemtifs["end_dist"]<=threshold)]
    matches = matches.sort_values(["avg_dist"])
    if thesemtifs.shape[0] < 1:
        print(thischr)
        print(thisstrand)
        print(this)
    if matches.shape[0] < 1:
        thesemtifs = thesemtifs.sort_values(["avg_dist"])
        this = this.assign(mtif = False,
            mtif_closest = thesemtifs.index[0],
            mtif_closest_start = thesemtifs.iloc[0]["start_dist"],
            mtif_closest_end = thesemtifs.iloc[0]["end_dist"]
            )
    else:
        this = this.assign(mtif = True,
            mtif_closest = matches.index[0],
            mtif_closest_start = matches.iloc[0]["start_dist"],
            mtif_closest_end = matches.iloc[0]["end_dist"]
            )

    return(this)

def add_mtifs(df, threshold = 5,
              mtifs = "/g/steinmetz/project/IESY/tifseq/mtifs.tsv",
              cores = 32):

    def int2roman(number):
        numerals={1:"I", 4:"IV", 5:"V", 9: "IX", 10:"X", 40:"XL", 50:"L",
                  90:"XC", 100:"C", 400:"CD", 500:"D", 900:"CM", 1000:"M"}
        result=""
        for value, numeral in sorted(numerals.items(), reverse=True):
            while number >= value:
                result += numeral
                number -= value
        return result

    mtifs_df = pd.read_table(mtifs, sep="\t")
    mtifs_df = mtifs_df.assign(chrom = ["chr" + int2roman(int(i.lstrip("chr"))) for i in mtifs_df["chr"]])

    #queries = list(range(0,df.shape[0]))
    queries = list(set(list(zip(df["clusterStart"],df["clusterEnd"]))))
    pool = mp.Pool(processes=cores)
    fcn = partial(match_mtif,
                  df = df,
                  mtifs_df = mtifs_df,
                  threshold = threshold)
    results = pool.map(fcn, queries)
    #pdb.set_trace()
    out = fastConcat(results)
    pool.close()
    pool.join()
    return(out)

def add_noveljunctions(df,
                   strain,
                   novelf = "/g/steinmetz/project/IESY/genomes/annotations/scramble/noveljcns/noveljcns.pickle"):
    novel_junctions = pickle.load(open(novelf,"rb"))
    if strain in novel_junctions.keys():
        thisbed = novel_junctions[strain]["annotations"]
        if len(set(thisbed["seqname"]).union(set(df["chrom"]))) > 0:
            newbed = thisbed.loc[thisbed["feature"]=="engineered_region"]
            newbed = pd.concat([newbed.loc[newbed["segs"]==i].iloc[0:2] for i in list(set(newbed["segs"]))])
            newbed = newbed.groupby("segs").agg({"seqname":np.unique, "start":np.max, "end":np.min}).reset_index()
            newbed = newbed.rename(columns = {"start":"end","end":"start","segs":"name"})
            newbed["diff"] = newbed["end"]-newbed["start"]
            newbed = newbed.loc[newbed["diff"]<=36]
            newbed = newbed[["seqname","start","end","name"]]
            newbed["start"] = newbed["start"].astype("int")
            newbed["end"] = newbed["end"].astype("int")
            if newbed.shape[0] == 0:
                out = df
                out["noveljcn"] = False
            else:
                novel_bed = pybedtools.BedTool(newbed[["seqname","start","end"]].to_string(index=False,
                                    header=False),from_string=True)
                df2 = df[["chrom","read_start","read_end"]]
                df2_bed = pybedtools.BedTool(df2.to_string(index=False,
                                    header=False),from_string=True)
                #import pdb; pdb.set_trace()
                novel_jnc_reads_full = df2_bed.intersect(novel_bed, wo=True, F=1)
                novel_jnc_reads_partial = df2_bed.intersect(novel_bed, wo=True)
                try:
                    thisdf_full = pd.read_csv(novel_jnc_reads_full.fn, sep="\t",header=None)
                    thisdf_full = thisdf_full.drop_duplicates()
                    thisdf_partial = pd.read_csv(novel_jnc_reads_partial.fn, sep="\t",header=None)
                    thisdf_partial = thisdf_partial.drop_duplicates()
                    thismerge = pd.merge(thisdf_partial,thisdf_full,how="left",indicator=True)
                    thismerge = thismerge.drop_duplicates()
                    thismerge["loxpend"] = [i=="left_only" for i in thismerge["_merge"]]
                    thismerge = thismerge.rename(columns = {0: "chrom", 1: "read_start", 2: "read_end", 6: "junction"})
                    thismerge = thismerge[["chrom","read_start","read_end","junction","loxpend"]]
                    out = pd.merge(df, thismerge, how="left", on=["chrom","read_start","read_end"], indicator=True)
                    out["noveljcn"] = [i=="both" for i in out["_merge"]]
                    out = out.drop(columns="_merge")
                except:
                    out = df
                    out["noveljcn"] = False
        else:
            out = df
            out["noveljcn"] = False
    else:
        out = df
        out["noveljcn"] = False

    return(out)

def queryd(index, df, d):
    i = df.iloc[index]
    i["clusterID"] = d[i["chrom"]][i["clusterId"]]
    return(pd.DataFrame(i).T)

def combinedfs(strain,
               outbase= "/g/steinmetz/project/IESY/analysis/rna/isoforms/combined/",
               inbase = "/g/steinmetz/project/IESY/analysis/rna/isoforms/ovlps/",
               save=True, cores = 32, threshold = 5):

    threshold = int(threshold)

    if save:
        Path(outbase + "{}/{}/".format(str(threshold),strain)).mkdir(parents=True, exist_ok=True)
        thisf_out = outbase + "{}/{}/directrna_isoforms_{}.pickle".format(str(threshold),strain,strain)

        if os.path.isfile(thisf_out):
            out = pickle.load(open(thisf_out,'rb'))
            return(out)

    pickles = glob.glob(inbase+"{}/{}/*.pickle".format(str(threshold), strain), recursive = True)
    dfs = [pickle.load(open(i,'rb')) for i in pickles]
    df = pd.concat(dfs)
    df = df.reset_index(drop = True)
    df = df.sort_values(["chrom","read_start","read_end","clusterId","start","end"])
    test = df.sort_values(["chrom","clusterId"]).drop_duplicates(["chrom","clusterId"])
    test = test.reset_index(drop=True)
    d = {i : dict(zip(test.loc[test["chrom"]==i]["clusterId"],test.loc[test["chrom"]==i].index)) for i in set(test["chrom"])}

    # df = df.sample(5000)
    queries = list(range(0,df.shape[0]))
    pool = mp.Pool(processes=cores)
    fcn = partial(queryd,
                  df = df,
                  d = d)
    results = pool.map(fcn, queries)
    o = fastConcat(results)
    pool.close()
    pool.join()
    o = o.drop(columns = ["clusterId"])

    o = o.sort_values(["chrom","read_start","read_end","nreads","clusterID","start","end"])

    if save:
        pickle.dump(o,open(thisf_out, "wb"))

    return(o)

def testannot(ind, df, annotations):
    x = df.iloc[ind]
    annotations = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed"
    thisstrain = x["strain"].split("|")[0]
    if (thisstrain in ["BY4741","SLS045"]):
        thisstrain = "S288C"
    thisannotation = pd.read_table(annotations.format(thisstrain), sep = "\t", header=None)
    thisannotation = thisannotation.loc[thisannotation[3].str.contains(x["features"])]
    x.loc["feature_start"] = thisannotation[1].min()
    x.loc["feature_end"] = thisannotation[2].max()
    return(pd.DataFrame(x).T)

def check2orfs(x):

    #x = x_2orfs_sut.iloc[0]
    #print(x)
    thesefeatures = x["features"].split("|")
    genes = [i for i in thesefeatures if re.match(re.compile("^Y"),i)]
    ncrnas = [i for i in thesefeatures if not re.match(re.compile("^Y"),i)]

    if len(genes) >= 2:
        x.loc["feature_type"] = "gene"
        x.loc["features"] = "|".join(thesefeatures)
    elif len(ncrnas) >= 2:
        x.loc["features"] = "|".join(thesefeatures)
        thistranscript = x["transcript"].split("_")[0:-1]
        thistranscript.append("ncRNA")
        #print(thistranscript)
        x.loc["transcript"] = "_".join(thistranscript)
    else:
        featuretype = ncrnas[0][0:3]
        if (featuretype == "XUT") or (featuretype == "CUT"):
            featuretype = "CUT/XUT"
        x.loc["features"] = "|".join(ncrnas)
        x.loc["transcript"] = featuretype
    return(x)

def cleanIsoforms(x, annotations = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed"):
        # fix exceptionally long annotations


    x_totest = x[(x["feature_end"]-x["feature_start"] >= 5000)]
    x_notest = x[~(x["feature_end"]-x["feature_start"] >= 5000)]

    pool = mp.Pool(processes=32)
    arg = list(range(0,x_totest.shape[0]))
    fcn = partial(testannot,
                  df = x_totest,
                  annotations = annotations)
    results = pool.map(fcn, arg)
    #x_totest = isoformCluster.fastConcat(results)
    x_totest = pd.concat(results)
    pool.close()
    pool.join()
    x = pd.concat([x_notest,x_totest]).sort_values(["chrom","clusterStart","clusterEnd"])

    # get rid of sut >2 ORFs


    # x_minus2orfs = x.loc[~x["transcript"].isin(["Covering_>=2_ORFs","Overlap_>=2_ORFs"])]
    # x_2orfs_nosut = x.loc[((x["transcript"].isin(["Covering_>=2_ORFs","Overlap_>=2_ORFs"])) & (x["features"].str.contains("CUT|XUT|SUT")==False))]
    # x_2orfs_sut = x.loc[(x["transcript"].isin(["Covering_>=2_ORFs","Overlap_>=2_ORFs"])) & (x["features"].str.contains("CUT|XUT|SUT"))]
    # x_2orfs_sut = x_2orfs_sut.apply(check2orfs, axis = 1)
    # x = pd.concat([x_minus2orfs,x_2orfs_nosut,x_2orfs_sut]).sort_values(["chrom","clusterStart","clusterEnd"])

    # fix start/end distance
    x_plus = x.loc[x["strand"]=="+"]
    x_plus = x_plus.assign(start_dist =  x_plus.clusterStart - x_plus.feature_start,
                             end_dist = x_plus.clusterEnd - x_plus.feature_end)
    x_minus = x.loc[x["strand"]=="-"]
    x_minus = x_minus.assign(start_dist = x_minus.feature_end - x_minus.clusterEnd,
                             end_dist = x_minus.feature_start - x_minus.clusterStart)
    x = pd.concat([x_minus,x_plus]).sort_values(["chrom","clusterStart","clusterEnd"])

    # # fix annotations, more covering
    # x_stay = x.loc[~((x["start_dist"]<=25) & (x["end_dist"]>=0))]
    # x_change = x.loc[((x["start_dist"]<=25) & (x["end_dist"]>=0))]
    # x_change = x_change.assign(transcript=[re.sub("Overlap_3'_of_one_ORF","Covering_one_intact_ORF",i) for i in x_change["transcript"]])
    # x_change = x_change.assign(transcript=[re.sub("Overlap_5'_of_one_ORF","Covering_one_intact_ORF",i) for i in x_change["transcript"]])
    # x_change = x_change.assign(transcript=[re.sub("Overlap","Covering",i) for i in x_change["transcript"]])
    # x = pd.concat([x_stay,x_change]).sort_values(["chrom","clusterStart","clusterEnd"])
    # x = x.reset_index(drop = True)
    return(x)

def getReadsBtwn(x, chrom, start, end, strand, threshold = 100):
        thischr = chrom
        thisstart = start
        thisend = end
        thisstrand = strand
#         matches = x.loc[
#             (x["chrom"]==thischr) & (x["strand"]==strand) &
#             ((x["clusterEnd"] >= thisstart - threshold) &
#             (x["clusterStart"] <= thisend + threshold))
#         ]
        matches = x.loc[
            (x["chrom"]==thischr) & (x["strand"]==strand) &
            ((x["start"] >= thisstart - threshold) &
            (x["end"] <= thisend + threshold))
        ]
        return(matches)

def calcEnds(ind, df, reads, threshold = 100):
    #print(x)
    x = df.iloc[ind]
    thischrom = x[0]
    thisstart = x[1]
    thisend = x[2]
    thisstrand = x[5]
    thisdist = x["dist"]
    thispair = x["pair"]
    thisposition = x["position"]
    thesereads = getReadsBtwn(reads, thischrom, thisstart, thisend, thisstrand, threshold)
    #print(len(thesereads["start_dist"]))
    o = thesereads[["end_dist","strand"]]
    o = o.assign(between = thisdist, pair = thispair, position = thisposition)
    return(o)


def findWT(pair,syndf,wtdf):
    #thispair = syndf.loc[syndf["pair"]==pair]
    #print(pair)
    thispair = pair
    this1 = thispair.iloc[[0]]
    this2 = thispair.iloc[[1]]
    wtdf = wtdf.loc[wtdf[3].str.contains("|".join(list(thispair[3])))]

    if (wtdf.shape[0] == 2):
        if len(list(set(wtdf["pair"])))==1:
            thispair = thispair.assign(wtconvergent = True, wtpair = True, distdiff = list(set(thispair["dist"]))[0] - list(set(wtdf["dist"]))[0] )
            doind = False
        else:
            doind = True
    else:
        doind = True

    if doind:
        this1wt = wtdf.loc[wtdf[3].str.contains("|".join(list(this1[3])))]
        this2wt = wtdf.loc[wtdf[3].str.contains("|".join(list(this2[3])))]
        if this1wt.shape[0]>0:
            this1 = this1.assign(wtconvergent = True, wtpair = False, distdiff = list(set(this1["dist"]))[0] - list(set(this1wt["dist"]))[0] )
        else:
            this1 = this1.assign(wtconvergent = False, wtpair = False, distdiff = None )
        if this2wt.shape[0]>0:
            this2 = this2.assign(wtconvergent = True, wtpair = False, distdiff = list(set(this2["dist"]))[0] - list(set(this2wt["dist"]))[0] )
        else:
            this2 = this2.assign(wtconvergent = False, wtpair = False, distdiff = None )
        thispair = pd.concat([this1,this2])
    return(thispair)

if False: '''

import sys, os
import site
import glob

from importlib.machinery import SourceFileLoader
import pickle
import pandas as pd
import re
import random
import json
import numpy as np

import pybedtools
import warnings
warnings.filterwarnings('ignore')
pybedtools.set_tempdir('/tmpdata/brooks/tmp')
import collections

sys.path.append("/g/steinmetz/project/IESY/software/scrambleTools/")

from scrambleTools import isoformCluster

from functools import partial
import multiprocessing as mp

import collections

import glob

threshold = 5

with open("/g/steinmetz/project/IESY/software/scrambleTools/scrambleTools/kernelSnakemake/config.json", 'r') as f:
    config = json.load(f)

REF = "BY4741"
STRAINS = [i["strain"] for i in config["data"][0]["samples"]]
CHRS = ["chrIX", "chrI","chrII","chrIII","chrIV","chrV",
    "chrVI","chrVII","chrVIII","chrX","chrXI","chrXII",
    "chrXIII","chrXIV","chrXV","chrXVI"]

for i in CHRS:
    for j in STRAINS:
        basicinfo = isoformCluster.runStrain(strain = j, chrom = i, save = True,
            genebeddir = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/{}.bed",
            tokeep = "CUT|SUT|XUT|gene|rRNA_gene|tRNA_gene|snRNA_gene",
            cores = 1,
            threshold = 5)

for i in CHRS:
    for j in STRAINS:
        allinfo_chrIX = isoformCluster.ovlpRefByLen(j, "BY4741", i, cores = 32, threshold = 5,
            inbase="/g/steinmetz/project/IESY/analysis/rna/isoforms/clusters/",
            outbase = "/g/steinmetz/project/IESY/analysis/rna/isoforms/ovlps/",
            save = True,
            mtif = "/g/steinmetz/project/IESY/tifseq/mtifs.tsv",
            novelf = "/g/steinmetz/project/IESY/genomes/annotations/scramble/noveljcns/noveljcns.pickle")



'''
