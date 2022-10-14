#!/usr/bin/env python
import numpy as np
import pickle
import pandas as pd
from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
import pysam
from multiprocessing import Pool
import Levenshtein


def getRefLen(x, thisbam):
    if type(x) is str:
        out = thisbam.lengths[[ind for ind,val in enumerate(thisbam.references)
                                        if val == x][0]]
    else:
        out = []
        for i in x:
            out.append(thisbam.lengths[[ind for ind,val in enumerate(thisbam.references)
                                        if val == i][0]])
    return(out)

def getMatch(x, y=None, return_alignment=False, narrow=False, forceUMI=False):
    from Bio import pairwise2
    from Bio.pairwise2 import format_alignment
    from Bio.Seq import Seq
    def match_function(x, y):
        if x == y:
            return 4
        elif x == 'N' or y == 'N':
            return 0.5
        else:
            return -6
    if y is None:
        umi1 = "AAGCAGTGGTATCAACGCAGANNNNNNNNNNGTACATGGG"
        std1 = "AAGCAGTGGTATCAACGCAGAGTACATGGG"
        umi2 = "AAGCAGTGGTATCAACGCAGAGTACNNNNNNNNNNTT"
        std2 = "AAGCAGTGGTATCAACGCAGAGTACTT"
        if forceUMI:
            seqiter = ["umi1","umi2"]
        else:
            seqiter = ["umi1","umi2","std1","std2"]
            
        x_r = str(Seq(x).reverse_complement())
        bestmatch = ""
        bestscore = -5000
        for i in seqiter:
            s1 = pairwise2.align.localcs(x, eval(i),
                               match_function, -5, -2,
                                score_only = True, one_alignment_only = True)
            s2 = pairwise2.align.localcs(x_r, eval(i),
                               match_function, -5, -2,
                                score_only = True, one_alignment_only = True)
            #print(s1)
            if (type(s1) is float) and (type(s2) is float):
                if s1 >= bestscore:
                    bestmatch = i
                    bestscore = s1
                    isrc = False
                    thisalign = pairwise2.align.localcs(x, eval(bestmatch),
                                                       match_function, -5, -2)
                if s2 >= bestscore:
                    bestmatch = i
                    bestscore = s2
                    isrc = True
                    thisalign = pairwise2.align.localcs(x_r, eval(bestmatch),
                                                       match_function, -5, -2)
            else:
                bestmatch = None
                bestscore = None
        if return_alignment:
            if narrow:
                return_align = []
                for i in thisalign:
                    a = i[0][i[3]:i[4]]
                    b = i[1][i[3]:i[4]]
                    c = i[2]
                    d = i[3]
                    e = i[4]
                return_align.append((a,b,c,d,e))
            else:
                return_align = thisalign
            out = {
                "x" : x,
                "y" : bestmatch,
                "alignment" : return_align
            }
            return(out)
        else:
            return((bestmatch,bestscore))
    else:
        out = {
            "x" : x,
            "y" : y,
            "alignment" : pairwise2.align.localcs(x, y,
                               match_function, -5, -2)
        }
        return(out)


def getSoftclips(x, thisbam):
    try:
        out = {
            "read_name" : x.query_name,
            "read_len" : x.query_length,
            "adapter1_seq" : "",
            "adapter1_len" : 0,
            "adapter1_type" : "",
            "adapter1_score" : 0,
            "adapter2_seq" : "",
            "adapter2_len" : 0,
            "adapter2_type" : "",
            "adapter2_score" : 0,
            "ref_name" : x.reference_name,
            "ref_len" : getRefLen(x.reference_name, thisbam),
            "ref_start" : x.reference_start,
            "ref_end" : x.reference_end,
            "quality" : x.mapping_quality,
        }
        # this is the softclip, 4 is code for softclip
        if x.cigar[0][0] == 4:
                out["adapter1_seq"] = x.seq[0:x.cigar[0][1]]
                out["adapter1_len"] = x.cigar[0][1]
        if x.cigar[-1][0] == 4:
                out["adapter2_seq"] = x.seq[(len(x.seq)-x.cigar[-1][1]):]
                out["adapter2_len"] = x.cigar[-1][1]
    except:
        #print(x)
        out = {}
    return out

def alignAdapters(x):
    umi1 = "AAGCAGTGGTATCAACGCAGANNNNNNNNNNGTACATGGG"
    std1 = "AAGCAGTGGTATCAACGCAGAGTACATGGG"
    umi2 = "AAGCAGTGGTATCAACGCAGAGTACNNNNNNNNNNTT"
    std2 = "AAGCAGTGGTATCAACGCAGAGTACTT"
    pairs = {
        "umi1" : "umi2",
        "umi2" : "umi1",
        "std1" : "std2",
        "std2" : "std1"
    }
    try:
        if (x["adapter1_len"] < 500) and (x["adapter2_len"] < 500):
            a1 = getMatch(x["adapter1_seq"])
            a2 = getMatch(x["adapter2_seq"])
            x["adapter1_type"] = a1[0]
            x["adapter1_score"] = a1[1]
            x["adapter2_type"] = a2[0]
            x["adapter2_score"] = a2[1]
            # pairs do not match
            if x["adapter1_type"] != pairs[x["adapter2_type"]]:
                #print("pairs dont match")
                # pair1 score > pair2 score?
                if x["adapter1_score"] >= x["adapter2_score"]:
                    refdif = x["adapter1_score"]-x["adapter2_score"]
                    alttype = getMatch(x["adapter2_seq"],eval(pairs[x["adapter2_type"]]))
                    nextdif = x["adapter1_score"]-alttype["alignment"][0][2]
#                     print(x)
#                     print(refdif)
#                     print(nextdif)
                    if refdif >= nextdif:
                        #print("accepting correction")
                        x["adapter2_type"] = pairs[x["adapter2_type"]]
                        x["adapter2_score"] = x["adapter2_score"]["alignment"][0][2]
                else:
                    refdif = x["adapter2_score"]-x["adapter1_score"]
                    alttype = getMatch(x["adapter1_seq"],eval(pairs[x["adapter1_type"]]))
                    nextdif = x["adapter2_score"]-x["adapter1_score"]["alignment"][0][2]
#                     print(x)
#                     print(refdif)
#                     print(nextdif)
                    if refdif >= nextdif:
                        #print("accepting correction")
                        x["adapter1_type"] = pairs[x["adapter1_type"]]
                        x["adapter1_score"] = x["adapter1_score"]["alignment"][0][2]
#             else:
#                 print("Pairs match")
#                 print(x["adapter1_type"])
#                 print(x["adapter2_type"])
    except:
        out = x
    return x

def getUMI(alignment):
    """Get the aligned UMI sequence"""
    import re
    p = re.compile('[N]+')
    m = p.search(alignment[1]).span()
    o = alignment[0][m[0]:m[1]]
    o = re.sub("-","",o)
    return(o)

def alignedUMI(x, whichumi=[1,2]):
        if whichumi is 1:
            y = getUMI(getMatch(x.adapter1_seq,return_alignment=True, forceUMI=True)['alignment'][0])
        elif whichumi is 2:
            y = getUMI(getMatch(x.adapter2_seq,return_alignment=True, forceUMI=True)['alignment'][0])
        return(y)

def blockUMI(df):
    if 'umi1' not in df.columns:
        df = df.assign(umi1 = df.apply(alignedUMI,axis=1,whichumi=1))
    if 'umi2' not in df.columns:
        df = df.assign(umi2 = df.apply(alignedUMI,axis=1,whichumi=2))
    return df

def parallelUMI(df,partitions,cores):
    data_split = np.array_split(df, partitions)
    pool = Pool(cores)
    data = pd.concat(pool.map(blockUMI, data_split))
    pool.close()
    pool.join()
    return data

def fetchUMIseqs(x):
    from Bio.Seq import Seq
    if x.adapter1_type == "umi1":
        umi1 = x.umi1
    else:
        umi1 = str(Seq(x.umi1).reverse_complement())
    if x.adapter2_type == "umi2":
        umi2 = x.umi2
    else:
        umi2 = str(Seq(x.umi2).reverse_complement())
    return(umi1,umi2)

def calcLevenshtein(x, y):
    # exclude row itself
    x_umis = fetchUMIseqs(x)
    y_umis = fetchUMIseqs(y)
    return((Levenshtein.distance(x_umis[0],y_umis[0]),
            Levenshtein.distance(x_umis[1],y_umis[1])
    ))

def findMinLevenshtein(x, df):
    df = df[df.read_name != x.read_name]
    dists = {index : calcLevenshtein(x, y) for index, y in df.iterrows()}
    return(dists)

def evalDup(x, df, neighborhood, cutoff, return_scores):
    """
    Evaluate whether sequence is a duplicate
    """
    # find any other reads within specified neighborhood
    df_hood = df[(df.ref_name==x.ref_name) &
             ((df.ref_start <= x.ref_start+neighborhood) & (df.ref_start >= x.ref_start-neighborhood)) &
             ((df.ref_end <= x.ref_end+neighborhood) & (df.ref_end >= x.ref_end-neighborhood))]
    dists = findMinLevenshtein(x, df_hood)
    if return_scores:
        o = {index: i for index, i in dists.items() if (i[0]<=cutoff) and (i[1]<=cutoff)}
        return(o)
    else:
        o = [i for index, i in dists.items() if (i[0]<=cutoff) and (i[1]<=cutoff)]
        if len(o)>0:
            return(True)
        else:
            return(False)

def blockDup(df, neighborhood=100, cutoff=3, return_scores = False):
    df = df.assign(isdup = df.apply(evalDup,axis = 1, df = df,
                                    neighborhood = neighborhood, cutoff=cutoff,
                                    return_scores = return_scores))
    return(df)

def parallelDups(df,partitions=24,cores=24):
    """
    Find duplicates in dataframe based on UMIs
    in adapter1 or adapter2 sequences
    """
    if ('umi1' not in df.columns) or ('umi2' not in df.columns):
        df = parallelUMI(df,partitions=24,cores=24)
    data_split = np.array_split(df, partitions)
    pool = Pool(cores)
    data = pd.concat(pool.map(blockDup, data_split))
    pool.close()
    pool.join()
    return data
