#!/usr/bin/env python3

import argparse
from Bio import SeqIO
import Bio
import csv
import datetime
from itertools import repeat
from functools import partial
import multiprocessing as mp
import numpy as np
from pyfaidx import Fasta
import pyfaidx
import pandas as pd
import pybedtools
from pymummer import coords_file, alignment, nucmer
import re
import subprocess
import os
import tempfile
from tqdm import tqdm
import urllib
import uuid
import warnings
import pyranges as pr
from numpy import interp

from importlib.machinery import SourceFileLoader

def readFASTA(x, splitKey = None):
    """
    Is sequence file? Load from file if so. File should be FASTA format
    Use pyfasta
    """

    if type(x) is not str:
        raise TypeError("input must be type str. filename or sequence")
    if os.path.isfile(x):
        tmp_o = Fasta(x, key_function=lambda key: key.split()[0])
        if (splitKey is None):
            o = tmp_o
        else:
            o = { i.split(splitKey)[0] : tmp_o[i] for i in tmp_o.keys() }
    else:
        o = x
    return o

def readFASTA_SeqIO(x):
    """
    Is sequence file? Load from file if so. File should be FASTA format
    Use SeqIO
    """

    o = []
    if type(x) is list:
        for idx, i in enumerate(x):
            if os.path.isfile(i):
                with open(i, "r") as f:
                    d = SeqIO.to_dict(SeqIO.parse(f, "fasta"))
                    o.append(d)
            else:
                o.append(x)
    elif os.path.isfile(str(x)):
        with open(x, "r") as f:
            o = SeqIO.to_dict(SeqIO.parse(f, "fasta"))
    elif isinstance(x,dict):
        #proper offset
        if isinstance([i for i in x.values()][0], SeqIO.SeqRecord):
            o = x
        else:
            raise TypeError("input must be type filename or SeqIO.SeqRecord)")
    elif  isinstance(x, SeqIO.SeqRecord):
        o = x
    else:
        raise TypeError("input must be type filename or SeqIO.SeqRecord)")
    return o

def writeFASTA(seq, file):

    with open(file, "w") as f:
        if isinstance(seq, pyfaidx.FastaRecord) or isinstance(seq, pyfaidx.Sequence):
            f.write(">" + seq.name + "\n")
            f.write(str(seq) + "\n")
        elif isinstance(seq, pyfaidx.Fasta):
            for i in seq.keys():
                f.write(">" + seq[i].name + "\n")
                f.write(str(seq[i]) + "\n")
        else:
            print("Not pyfaidx. Cannot write at this time.")
    return None

def readGFF(gff):

    gff_cnames = [
    'seqname',
    'source',
    'feature',
    'start',
    'end',
    'score',
    'strand',
    'frame',
    'attribute'
    ]
    gff_types = {
        'seqname':str,
        'source':str,
        'feature':str,
        'start':np.int32,
        'end':np.int32,
        'score':str,
        'strand':str,
        'frame':str,
        'attribute':str
    }
    with open(gff, mode = 'r') as f:
        data = [line.strip().split("\t") for line in f if len(line.strip().split("\t")) == 9]
        df = pd.DataFrame.from_records(data, columns = gff_cnames)
        df[['start','end']] = df[['start','end']].apply(pd.to_numeric, errors='ignore')
        df.set_index(["seqname","start","end"], inplace=True)
    return df

def writeGFF(gff,outfile):
    # reset index
    gff = gff.reset_index(level=["seqname", "start", "end"])
    gff = gff.reindex(columns=["seqname",
                        "source",
                        "feature",
                        "start",
                        "end",
                        "score",
                        "strand",
                        "frame",
                        "attribute"
                        ])
    with open(outfile,'w') as f:
        gff.to_csv(f, index=False, sep="\t", header=False, quoting=csv.QUOTE_NONE)

def getSeq(seq,chr,start,end):
    if os.path.isfile(str(seq)):
        seq = readFASTA_SeqIO(seq)
        #proper offset
        if chr in seq.keys():
            return seq[chr][start-1:end-1]
        else:
            warnings.warn(('Could not find sequence {} in supplied reference fasta file!!!'
                           ' Dropping gff entry').format(chr))
            return None
    elif isinstance(seq,dict):
        #proper offset
        if isinstance([i for i in seq.values()][0], Bio.SeqRecord.SeqRecord):
            if chr in seq.keys():
                return seq[chr][start-1:end-1]
            else:
                warnings.warn(('Could not find sequence {} in supplied reference fasta file!!!'
                               ' Dropping gff entry').format(chr))
                return None
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")

def runGSNAP(gsnap_index, query, gsnapPath):
    """
    Align sequences with GSNAP
    """
    def flipGSNAP(x):
        thisstart = x["subject_start"]
        thisend = x["subject_end"]
        if thisstart < thisend:
            x["strand"] = "+"
        else:
            x["strand"] = "-"
            x["subject_start"] = thisend
            x["subject_end"] = thisstart
        return(x)

    if not os.path.isdir(str(gsnap_index)):
        raise TypeError("gsnap_index  must be location of gsnap database")

    if os.path.isfile(str(query)):
        query_file = query
        query_name = query
    elif isinstance(query,Bio.SeqRecord.SeqRecord):
        query_file = tempfile.NamedTemporaryFile(mode='w')
        query_name = query_file.name
        Bio.SeqIO.write(query, query_name, "fasta")
    elif isinstance(query,dict):
        if isinstance([i for i in query.values()][0], Bio.SeqRecord.SeqRecord):
            query_file = tempfile.NamedTemporaryFile(mode='w')
            query_name = query_file.name
            towrite = [i for i in query.values()]
            Bio.SeqIO.write(towrite, query_name, "fasta")
        else:
            raise TypeError("input must be type filename or Bio.SeqRecord.SeqRecord)")
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")
    results_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
    cmds = [
        gsnapPath,
        "-D", os.path.dirname(gsnap_index),
        "-d", os.path.basename(gsnap_index),
        query_name,
        "-o", results_file.name,
        "-A","m8",
        # "--max-gmap-terminal", "500",
        # "--max-anchors", "500",
        "-n", "5000"
    ]
    print(" ".join(cmds))
    p = subprocess.Popen(cmds, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate()
    if p.returncode:
        # raise ValueError("cmds: %s\nstderr:%s\nstdout:%s"
        #                  % (" ".join(cmds), stderr, stdout))
        print("cmds: %s\nstderr:%s\nstdout:%s"
                          % (" ".join(cmds), stderr, stdout))
    try:
        df = pd.read_csv(results_file.name, sep ="\t", header=None)
        df.columns = ["query","subject","%_id","alignment_length","mismatches",
                        "gap_openings","query_start","query_end","subject_start",
                        "subject_end","Evalue", "bitscore"]
        df = df.apply(flipGSNAP, axis=1).sort_values("strand").drop_duplicates(["subject","subject_start","subject_end"])
        df = df.sort_values(["subject","subject_start","subject_end"]).reset_index(drop=True)
    except:
        with open(results_file.name, 'r') as f:
            for line in f:
                print(line)
        df = pd.DataFrame()
        # df.columns = ["query","subject","%_id","alignment_length","mismatches",
        #                 "gap_openings","query_start","query_end","subject_start",
        #                 "subject_end","Evalue", "bitscore"]
    if type(query_file) is tempfile._TemporaryFileWrapper:
        query_file.close()
    if type(results_file) is tempfile._TemporaryFileWrapper:
        results_file.close()
    return(df)

def runBlat(ref, query, blatPath):
    """
    Align sequences with Blat
    """
    if os.path.isfile(str(ref)):
        reference_file = ref
        reference_name = ref
    elif isinstance(ref,Bio.SeqRecord.SeqRecord):
        reference_file = tempfile.NamedTemporaryFile(mode='w')
        reference_name = reference_file.name
        Bio.SeqIO.write(ref, reference_name, "fasta")
    elif isinstance(ref,dict):
        if isinstance([i for i in ref.values()][0], Bio.SeqRecord.SeqRecord):
            reference_file = tempfile.NamedTemporaryFile(mode='w')
            reference_name = reference_file.name
            towrite = [i for i in ref.values()]
            Bio.SeqIO.write(towrite, reference_name, "fasta")
        else:
            raise TypeError("input must be type filename or Bio.SeqRecord.SeqRecord)")
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")

    if os.path.isfile(str(query)):
        query_file = query
        query_name = query
    elif isinstance(query,Bio.SeqRecord.SeqRecord):
        query_file = tempfile.NamedTemporaryFile(mode='w')
        query_name = query_file.name
        Bio.SeqIO.write(query, query_name, "fasta")
    elif isinstance(query,dict):
        if isinstance([i for i in query.values()][0], Bio.SeqRecord.SeqRecord):
            query_file = tempfile.NamedTemporaryFile(mode='w')
            query_name = query_file.name
            towrite = [i for i in query.values()]
            Bio.SeqIO.write(towrite, query_name, "fasta")
        else:
            raise TypeError("input must be type filename or Bio.SeqRecord.SeqRecord)")
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")

    results_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
    #print(results_file.name)
    cmds = [
        blatPath,
        reference_name,
        query_name,
        results_file.name
    ]
    p = subprocess.Popen(cmds, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate()
    if p.returncode:
        raise ValueError("cmds: %s\nstderr:%s\nstdout:%s"
                         % (" ".join(cmds), stderr, stdout))

#     with open(results_file.name,'r') as f:
#         print(f.readlines())

    df = pd.read_csv(results_file.name, sep ="\t", skiprows=[0,1,4], header=None)
    df.columns = (df.iloc[0].map(str) + df.iloc[1].map(str))
    df.columns = [i.replace(" ","").replace("nan","") for i in df.columns]
    df = df.drop([0,1])
    df = df.reset_index(drop=True)
    if type(reference_file) is tempfile._TemporaryFileWrapper:
        reference_file.close()
    if type(query_file) is tempfile._TemporaryFileWrapper:
        query_file.close()
    if type(results_file) is tempfile._TemporaryFileWrapper:
        results_file.close()
    return(df)

def runMummer(ref, query):
    """
    Align sequences with MUMmer
    """
    useTempRef = False
    useTempQuery = False

    if os.path.isfile(str(ref)):
        reference_file = ref
        reference_name = ref
    elif isinstance(ref,Bio.SeqRecord.SeqRecord):
        useTempRef = True
        reference_file = tempfile.TemporaryFile(mode='w')
        #NamedTemporaryFile(mode='w+b', delete=False)
        # reference_file = os.path.abspath(str(datetime.datetime.now().time())
        #                     + "_ref.fasta")
        reference_file = str(uuid.uuid4())
        Bio.SeqIO.write(ref, reference_file, "fasta")
    elif isinstance(ref,dict):
        if isinstance([i for i in ref.values()][0], Bio.SeqRecord.SeqRecord):
            useTempRef = True
            #reference_file = tempfile.TemporaryFile(mode='w+t')
            # reference_file = os.path.abspath(str(datetime.datetime.now().time())
            #                     + "_ref.fasta")
            reference_file = str(uuid.uuid4())
            towrite = [i for i in ref.values()]
            Bio.SeqIO.write(towrite, reference_file, "fasta")
        else:
            raise TypeError("input must be type filename or Bio.SeqRecord.SeqRecord)")
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")

    if os.path.isfile(str(query)):
        query_file = query
        query_name = query
    elif isinstance(query,Bio.SeqRecord.SeqRecord):
        useTempQuery = True
        #query_file = tempfile.TemporaryFile(mode='w+t')
        # query_file = os.path.abspath(str(datetime.datetime.now().time())
        #                     + "_query.fasta")
        query_file = str(uuid.uuid4())
        Bio.SeqIO.write(query, query_file, "fasta")
    elif isinstance(query,dict):
        if isinstance([i for i in query.values()][0], Bio.SeqRecord.SeqRecord):
            useTempQuery = True
            #reference_file = tempfile.TemporaryFile(mode='w+t')
            # query_file = os.path.abspath(str(datetime.datetime.now().time())
            #                     + "_query.fasta")
            query_file = str(uuid.uuid4())
            towrite = [i for i in query.values()]
            Bio.SeqIO.write(towrite, query_file, "fasta")
        else:
            raise TypeError("input must be type filename or Bio.SeqRecord.SeqRecord)")
    else:
        raise TypeError("input must be Bio.SeqRecord.SeqRecord")
    # results_file = os.path.abspath(str(datetime.datetime.now().time())
    #                         + "_results")
    results_file = str(uuid.uuid4())
    runner = nucmer.Runner(reference_file, query_file, results_file)
    runner.run()
    file_reader = coords_file.reader(results_file)
    #alignments = [coord for coord in file_reader if not coord.is_self_hit()] #Remove self hits
    alignments = [coord for coord in file_reader]
    # print(alignments)
    # clean up
    if useTempRef:
        if type(reference_file) is tempfile._TemporaryFileWrapper:
            reference_file.close()
        os.remove(reference_file)
    if useTempQuery:
        if type(query_file) is tempfile._TemporaryFileWrapper:
            query_file.close()
        os.remove(query_file)
    if type(results_file) is tempfile._TemporaryFileWrapper:
        results_file.close()
    os.remove(results_file)
    # print(reference_file)
    # print(query_file)
    # print(results_file)

    col_labels = ["S1", "E1", "S2", "E2", "LEN_1", "LEN_2", "%_IDY",
        "LEN_R", "LEN_Q", "FRM", "NAME_R", "NAME_Q"]
    if alignments:
        #print([str(i).split("\t") for i in alignments])
        df = pd.DataFrame.from_records([str(i).split("\t") for i in alignments],
                columns=col_labels)
        df["S1"] = df["S1"].astype(int)
        df["E1"] = df["E1"].astype(int)
        df["S2"] = df["S2"].astype(int)
        df["E2"] = df["E2"].astype(int)
        df["LEN_1"] = df["LEN_1"].astype(int)
        df["LEN_2"] = df["LEN_2"].astype(int)
        df["LEN_R"] = df["LEN_R"].astype(int)
        df["LEN_Q"] = df["LEN_Q"].astype(int)
        df["%_IDY"] = df["%_IDY"].astype(float)
        df["NAME_R"] = df["NAME_R"].astype(str)
        df["NAME_Q"] = df["NAME_Q"].astype(str)

    else:
        df = pd.DataFrame([],columns=col_labels)

    return df

def gffMod(df, hits, doReps=False, repNum=1, use=["blat", "mummer", "gsnap"][2]):

    def add2id(matchobj,i):
        x = str(matchobj.group(0).rstrip(";"))+ "-" + str(i) + ";"
        return x
    out = pd.DataFrame.copy(df)
    if use == "gsnap":
        seqname = hits["subject"]
        start_s = int(hits["subject_start"])
        end_s = int(hits["subject_end"])+1
        thisstrand = out.iloc[0]["strand"]
    elif use == "mummer":
        seqname = hits["NAME_Q"]
        start_s = int(hits["S2"])
        end_s = int(hits["E2"])+1
        thisstrand = out.iloc[0]["strand"]
    elif use == "blat":
        seqname = str(hits["Qname"])
        start_s = int(hits["Qstart"])+1
        end_s = int(hits["Qend"])+1
        thisstrand = out.iloc[0]["strand"]
    else:
        seqname = hits["seqname"]
        start_s = int(hits["start"])
        end_s = int(hits["end"])
        thisstrand = out.iloc[0]["strand"]
    #print(thisstrand)
    oppositestrand = lambda x: "-" if x is "+" else "+"
    samestrand = lambda x: "+" if x is "+" else "-"
    # clean up web encoding (affects tRNA genes)
    attribute = urllib.request.unquote(out.iloc[0]["attribute"]).rstrip('"').lstrip('"')
    # do some attributes in yeast gff have two sets of quotes??
    attribute = attribute.rstrip('"').lstrip('"')
    if doReps:
    	attribute = re.sub("ID=.*?;", lambda line: add2id(line,repNum), attribute)
    	attribute = re.sub("Name=.*?;", lambda line: add2id(line,repNum), attribute)
    	attribute = re.sub("gene=.*?;", lambda line: add2id(line,repNum), attribute)

    if use == "mummer":
        if end_s < start_s:
            start = end_s
            end = start_s
            strand = oppositestrand(thisstrand)
            #strand = thisstrand
        else:
            start = start_s
            end = end_s
            strand = thisstrand
    elif use == "gsnap":
        if hits["strand"] == "-":
            strand = oppositestrand(thisstrand)
            start = start_s
            end = end_s
        else:
            strand = thisstrand
            start = start_s
            end = end_s
    elif use == "blat":
        if hits["strand"] == "-":
            strand = oppositestrand(thisstrand)
        else:
            strand = thisstrand
        # if end_s < start_s:
        #     print("WTF WTF!")
        #     print(df)
        #     print(hits)
        #     start = end_s
        #     end = start_s
        # else:
        start = start_s
        end = end_s
    else:
        if end_s < start_s:
            start = end_s
            end = start_s
            strand = oppositestrand(thisstrand)
            #strand = thisstrand
        elif "strand" in hits:
            if hits["strand"] == "-":
                strand = oppositestrand(thisstrand)
            else:
                strand = thisstrand
            start = start_s
            end = end_s
        else:
            start = start_s
            end = end_s
            strand = thisstrand

    out.index = pd.MultiIndex.from_tuples([(seqname,start,end)], names=("seqname","start","end"))
    # if strand == "-":
    #     # this means it is on opposite strand FROM ANNOTATION!
    #     out.loc[(seqname,start,end),"strand"] = oppositestrand(df["strand"])
    # else:
    #     out.loc[(seqname,start,end),"strand"] = samestrand(df["strand"])
    out.loc[(seqname,start,end),"strand"] = strand
    out.loc[(seqname,start,end),"score"] = "."
    out.loc[(seqname,start,end),"attribute"] = attribute
    return out

def mapGFF(gff_in, to_fa, from_fa, onlyHighest,
           correct_tRNA, enforceLen, use,
           unmapped, blatPath=None,
           gsnap_index = None, gsnapPath = None,
           useEmergencyMapper = False, full_gff = None,
           verbose = True):
    def fail(x, feature_seq, unmapped, emergency, full_gff,
             to_fa, from_fa, onlyHighest, correct_tRNA,
             enforceLen, use, blatPath,
             gsnapPath = None, gsnap_index = None):
        print("Failed to translate gff entry: {}".format(x))
        if gsnap_index is not None:
            use = "gsnap"
            # try with gsnap first
            print("Trying to map with gsnap")
            gsnaphits = runGSNAP(gsnap_index, feature_seq, gsnapPath)
            #print("tyring gsnap")
            #print(gsnaphits)
            if gsnaphits.shape[0] > 0:
                if gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1).any():
                    # exact chr match -- just return that
                    gsnaphits = gsnaphits[gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1)]
                # this is a syn match?
                if onlyHighest:
                    gsnaphits = gsnaphits[gsnaphits["%_id"] >= gsnaphits.max()["%_id"]]
                if correct_tRNA:
                    # correct for tRNA and other annotations that may present mapping problems
                    if gff_in.feature[0]=="tRNA_gene":
                        gsnaphits = gsnaphits[gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1)]
                if enforceLen:
                    # make the ref:query match lengths equal
                    gsnaphits = gsnaphits[gsnaphits.apply(lambda x : (abs(len(feature_seq) - int(x["alignment_length"]))/len(feature_seq)) <= 0.1, axis=1)]
                gsnaphits = gsnaphits.reset_index()
                if gsnaphits.shape[0] > 0:
                    y = gsnaphits
                else:
                    y = None
            else:
                y = None
        else:
            y = None

        if y is None:
            if emergency:
                print("Trying to map with emergency mapper")
                y = emergencyMapper(x, full_gff, to_fa, from_fa, onlyHighest,
                           correct_tRNA, enforceLen, use, blatPath, gsnap_index,
                           gsnapPath)
                use = None

            else:
                y = None
            if y is None:
                if unmapped is not None:
                    x.to_csv(unmapped, sep = "\t", mode = "a", header = False)
        return (y,use)

    #try:
    if unmapped is not None:
        with open(unmapped, 'w') as f:
            f.write('')
    if verbose:
        print(gff_in)
    if type(from_fa) is Bio.SeqRecord.SeqRecord:
        feature_seq = from_fa
    else:
        from_seq = readFASTA_SeqIO(from_fa)
        feature_seq = getSeq(from_seq,gff_in.index.get_level_values('seqname')[0],
                           gff_in.index.get_level_values('start')[0],
                           gff_in.index.get_level_values('end')[0])
    #print(feature_seq)
    if feature_seq is not None:
        if (use=="blat") and (len(feature_seq) > 5000):
            message = "Feature {} has length {} which is too long for blat. Falling back to use mummer"
            print(message.format(gff_in.attribute[0], len(feature_seq)))
            use = "mummer"
        if (use=="gsnap") and (len(feature_seq) > 75):
            message = "Feature {} has length {} which is too long for blat. Falling back to use mummer"
            print(message.format(gff_in.attribute[0], len(feature_seq)))
            use = "mummer"
        if (use=="mummer") and (len(feature_seq) <= 50):
            message = "Feature {} has length {} which is too short for mummer. Falling back to use gsnap"
            print(message.format(gff_in.attribute[0], len(feature_seq)))
            use = "gsnap"
        to_seq = readFASTA_SeqIO(to_fa)
        if use == "mummer":
            mummerhits = runMummer(feature_seq,to_seq)
            mummerhits["%_IDY"] = pd.to_numeric(mummerhits["%_IDY"])
            #print(mummerhits)
            if mummerhits.shape[0] > 0:
                if mummerhits.apply(lambda x : x["NAME_R"] == x["NAME_Q"], axis=1).any():
                    # exact chr match -- just return that
                    mummerhits = mummerhits[mummerhits.apply(lambda x : x["NAME_R"] == x["NAME_Q"], axis=1)]
                # this is a syn match?
                if onlyHighest:
                    mummerhits = mummerhits[mummerhits["%_IDY"] >= mummerhits.max()["%_IDY"]]
                if correct_tRNA:
                    # correct for tRNA and other annotations that may present mapping problems
                    if gff_in.feature[0]=="tRNA_gene":
                        mummerhits = mummerhits[mummerhits.apply(lambda x : x["NAME_R"] == x["NAME_Q"], axis=1)]
                if enforceLen:
                    # make the ref:query match lengths equal
                    #print(mummerhits)
                    mummerhits = mummerhits[mummerhits.apply(lambda x : (abs(int(x["LEN_1"]) - int(x["LEN_2"]))/int(x["LEN_1"])) <= 0.1, axis=1)]
                #print(mummerhits)
                mummerhits = mummerhits.reset_index()
                if mummerhits.shape[0] > 0:
                    matches = mummerhits
                else:
                    matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                             to_fa, from_fa, onlyHighest, correct_tRNA,
                             enforceLen, use, blatPath, gsnapPath, gsnap_index)


            else:
                matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                         to_fa, from_fa, onlyHighest, correct_tRNA,
                         enforceLen, use, blatPath, gsnapPath, gsnap_index)

        elif use == "blat":
            blathits = runBlat(feature_seq,to_seq, blatPath)
            blathits["%_IDY"] = pd.to_numeric(blathits["match"])/pd.to_numeric(blathits["Tsize"])
            if blathits.shape[0] > 0:
                if blathits.apply(lambda x : x["Tname"] == x["Qname"], axis=1).any():
                    # exact chr match -- just return that
                    blathits = blathits[blathits.apply(lambda x : x["Tname"] == x["Qname"], axis=1)]
                # this is a syn match?
                if onlyHighest:
                    blathits = blathits[blathits["%_IDY"] >= blathits.max()["%_IDY"]]
                if correct_tRNA:
                    # correct for tRNA and other annotations that may present mapping problems
                    if gff_in.feature[0]=="tRNA_gene":
                        blathits = blathits[blathits.apply(lambda x : x["Tname"] == x["Qname"], axis=1)]
                if enforceLen:
                    # make the ref:query match lengths equal
                    #print(blathits)
                    blathits = blathits[blathits.apply(lambda x : (abs(int(x["Tsize"]) - int(x["Qsize"]))/int(x["Tsize"])) <= 0.1, axis=1)]
                blathits = blathits.reset_index()
                if blathits.shape[0] > 0:
                    matches = blathits
                else:
                    matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                             to_fa, from_fa, onlyHighest, correct_tRNA,
                             enforceLen, use, blatPath, gsnapPath, gsnap_index)

            else:
                matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                         to_fa, from_fa, onlyHighest, correct_tRNA,
                         enforceLen, use, blatPath, gsnapPath, gsnap_index)

        elif use == "gsnap":
            gsnaphits = runGSNAP(gsnap_index, feature_seq, gsnapPath)
            #print("tyring gsnap")
            #print(gsnaphits)
            if gsnaphits.shape[0] > 0:
                if gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1).any():
                    # exact chr match -- just return that
                    gsnaphits = gsnaphits[gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1)]
                # this is a syn match?
                if onlyHighest:
                    gsnaphits = gsnaphits[gsnaphits["%_id"] >= gsnaphits.max()["%_id"]]
                if correct_tRNA:
                    # correct for tRNA and other annotations that may present mapping problems
                    if gff_in.feature[0]=="tRNA_gene":
                        gsnaphits = gsnaphits[gsnaphits.apply(lambda x : x["query"] == x["subject"], axis=1)]
                if enforceLen:
                    # make the ref:query match lengths equal
                    gsnaphits = gsnaphits[gsnaphits.apply(lambda x : (abs(len(feature_seq) - int(x["alignment_length"]))/len(feature_seq)) <= 0.1, axis=1)]
                gsnaphits = gsnaphits.reset_index()
                if gsnaphits.shape[0] > 0:
                    matches = gsnaphits
                else:
                    matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                             to_fa, from_fa, onlyHighest, correct_tRNA,
                             enforceLen, use, blatPath, gsnapPath, gsnap_index)

            else:
                matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                         to_fa, from_fa, onlyHighest, correct_tRNA,
                         enforceLen, use, blatPath, gsnapPath, gsnap_index)


    else:
        matches, use = fail(gff_in, feature_seq, unmapped, useEmergencyMapper, full_gff,
                 to_fa, from_fa, onlyHighest, correct_tRNA,
                 enforceLen, use, blatPath, gsnapPath, gsnap_index)
        use = None
    if matches is not None:
        if matches.shape[0] > 1:
            if use == "blat":
                matches["Qend"] = matches["Qend"].astype('int64')
                matches = matches.sort_values("Qend").reset_index()
            elif use == "mummer":
                matches["S2"] = matches["S2"].astype('int64')
                matches = matches.sort_values("S2").reset_index()
            elif use == "gsnap":
                matches["subject_end"] = matches["subject_end"].astype('int64')
                matches = matches.sort_values("subject_end").reset_index()
            out = gffMod(gff_in, matches.iloc[0], doReps=True, repNum=1, use=use)
            for i in range(1,(matches.shape[0])):
                #print(i)
                newrow = gffMod(gff_in,matches.loc[i], doReps=True, repNum=i+1, use=use)
                out = out.append(newrow)
        else:
            out = gffMod(gff_in, matches.iloc[0], use=use)
    else:
        out = None
    # except:
    #     print("ERROR: Cannot translate {}".format(gff_in))
    #     out = None
    return(out)

def mapMultipleGFF(from_fa, gff_in, to_fa, onlyHighest=True,
           correct_tRNA=True, enforceLen=True, use=["blat","mummer","gsnap"][1],
           blatPath = "/g/steinmetz/brooks/anaconda/envs/nanopore/bin/blat",
           gsnap_index = None,
           gsnapPath = "/g/steinmetz/brooks/anaconda/envs/nanopore/bin/gsnap",
           usemp = True, nproc = 32, unmapped = "unmapped.gff",
           useEmergencyMapper = True, full_gff = None, verbose = True):
    with open(unmapped, 'w') as f:
        f.write("# unmapped gff entries\n")
    if gff_in.shape[0] > 0:
        if usemp:
            print("Using multiprocessing")
            pool = mp.Pool(processes=nproc)
            #results = [pool.apply(mapGFF, args=(from_fa,gff_in.iloc[[x]], to_fa)) for x in range(0,gff_in.shape[0])]
            gff_arg = [gff_in.iloc[[x]] for x in range(0,gff_in.shape[0])]
            #results = pool.starmap(mapGFF, zip(gff_arg,repeat(to_fa),repeat(from_fa)))
            if full_gff is None:
                full_gff = gff_in
            fcn = partial(mapGFF, to_fa = to_fa, from_fa = from_fa, onlyHighest = onlyHighest,
                       correct_tRNA = correct_tRNA, enforceLen = enforceLen, use = use,
                       blatPath = blatPath, unmapped = unmapped, full_gff = full_gff,
                       gsnap_index = gsnap_index, gsnapPath = gsnapPath,
                       useEmergencyMapper = useEmergencyMapper, verbose = verbose)
            #print(fcn)
            results = pool.map(fcn, gff_arg)
            pool.close()
            pool.join()
            #results = pool.map(partial(mapGFF, gff_in=gff_arg), to_fa=to_fa, from_fa=from_fa)
            #results.close()
            #results.join()
            ##
            ##
            # if all(v is None for v in results):
            #     out = None
            # else:
            out = pd.concat(results)
            ##
            ##
            return out
        else:
            print("Not implemented")
            # print("Using tqdm")
            # out = mapGFF(from_fa, gff_in.iloc[[0]], to_fa)
            # if gff_in.shape[0] > 1:
            #     for i in tqdm(range(1,(gff_in.shape[0]))):
            #         #print(i)
            #         newrow = mapGFF(from_fa, gff_in.iloc[[i]], to_fa)
            #         # if newrow is not None:
            #         #     out = out.append(newrow)
            # return out
    else:
        return None

def addSeg(to_fa, seg_file, gff = None, onlyHighest=True,
           correct_tRNA=True, enforceLen=True, use="mummer",
           blatPath = "/g/steinmetz/brooks/anaconda/envs/nanopore/bin/blat",
           gsnap_index = None,
           gsnapPath = "/g/steinmetz/brooks/anaconda/envs/nanopore/bin/gsnap",
           usemp=True, nproc=32, unmapped = "unmapped.gff", verbose = True):
    if unmapped is not None:
        with open(unmapped, 'w') as f:
            f.write("# unmapped gff entries\n")
    print("Using {} for alignment".format(use))
    if os.path.isfile(seg_file):
        with open(seg_file,'r') as f:
            df = pd.read_csv(f,sep='\t')
        temp_file = tempfile.NamedTemporaryFile(mode='w')
        #temp_file = str(uuid.uuid4())
        with open(temp_file.name,'w') as f2:
            for i in df["number"]:
                f2.write(">"+str(i) + "\n")
                f2.write(str(df.loc[df["number"] == i].iloc[0]["seq"])+"\n")
        dummy_gff = pd.DataFrame.from_records([{
            "seqname":"dummy",
            "start":1,
            "end":1,
            "source":"ANB",
            "feature":"engineered_region",
            "score":".",
            "strand":"+",
            "frame":".",
            "attribute":"ID=;"
        }],index=("seqname","start","end"))
        thisfrom = readFASTA_SeqIO(temp_file.name)
        #out = pd.DataFrame()
        results = []
        segments = [x for x in thisfrom.keys()]
        if usemp:
            gff_arg = dummy_gff
            for i in range(0,len(segments)):
                ii = segments[i]
                if i == 0:
                    gff_arg.iloc[i].attribute = "ID=" + str(ii) + ";"
                else:
                    gff_arg = gff_arg.append(dummy_gff)
                    gff_arg.iloc[i].attribute = "ID=" + str(ii) + ";"
            gff_arg = [gff_arg.iloc[[x]] for x in range(0,gff_arg.shape[0])]
            from_fa_arg = [thisfrom[s] for s in segments]
            pool = mp.Pool(processes=nproc)
            results = pool.starmap(mapGFF, zip(gff_arg,
                                                repeat(to_fa),
                                                [thisfrom[s] for s in segments],
                                                repeat(onlyHighest),
                                                repeat(correct_tRNA),
                                                repeat(enforceLen),
                                                repeat(use),
                                                repeat(unmapped),
                                                repeat(blatPath),
                                                repeat(gsnap_index),
                                                repeat(gsnapPath),
                                                repeat(False),
                                                repeat(None),
                                                repeat(verbose)
                                                ))
            # def fcn(i):
            #     result = mapGFF(gff_in = gff_arg[i], to_fa = to_fa, from_fa = from_fa_arg[i],
            #             onlyHighest = onlyHighest,correct_tRNA = correct_tRNA,
            #             enforceLen = enforceLen, use = use,
            #             blatPath = blatPath, unmapped = unmapped)
            #     return(result)
            # results = pool.map(fcn, list(range(0,len(gff_arg))))
            out = pd.concat(results)
        else:
            for i in tqdm(range(0,len(segments))):
                ii = segments[i]
                dummy_gff.iloc[0].attribute = "ID=" + str(ii) + ";"
                thisentry = mapGFF(gff_in = dummy_gff, to_fa = to_fa, from_fa = thisfrom[ii], unmapped = unmapped,
                                    use = use, onlyHighest = onlyHighest, correct_tRNA = correct_tRNA,
                                    enforceLen = enforceLen, gsnap_index = gsnap_index,
                                    gsnapPath = gsnapPath)
                if thisentry is not None:
                    results.append(thisentry)
            out = pd.concat(results)
        if gff is not None:
            out = gff.append(out)
        temp_file.close()
        out = out.sort_index()
        return out
    else:
        raise IOError("must provide filename for argument segment_table")

def addLoxp(to_fa,  loxpseq = None, segments = None, gff = None, onlyHighest=False,
           correct_tRNA=False, enforceLen=True, use="gsnap",
           gsnap_index = None,
           gsnapPath = "/g/steinmetz/brooks/anaconda/envs/nanopore/bin/gsnap",
           unmapped = "unmapped.gff", verbose = True, circular = True):

    def findSegs(x, segments, circular=True):
        thissegments = segments.copy(deep=True)
        thissegments = thissegments.astype({"start":int,
                                            "end":int})
        thissegments = thissegments.assign(start_d = int(x["start"]) - thissegments["end"],
                                            end_d = int(x["end"]) - thissegments["start"])
        thissegments = thissegments.sort_values("start")

        leftseg = thissegments.loc[thissegments["start_d"]<=5]
        leftseg = leftseg.sort_values("start_d", ascending=False)
        if leftseg.shape[0] > 0:
            leftseg = leftseg.iloc[0]
        else:
            if circular:
                leftseg = thissegments.iloc[-1]
            else:
                leftseg = ""
        if type(leftseg) is not str:
            leftseg = leftseg["attribute"].rstrip(";").split("=")[1]

        rightseg = thissegments.loc[thissegments["end_d"]<=5]
        rightseg = rightseg.sort_values("end_d", ascending=False)
        if rightseg.shape[0] > 0:
            rightseg = rightseg.iloc[0]
        else:
            if circular:
                rightseg = thissegments.iloc[0]
            else:
                rightseg = ""
        if type(rightseg) is not str:
            rightseg = rightseg["attribute"].rstrip(";").split("=")[1]
        x["attribute"] = "ID={}:{};".format(leftseg,rightseg)
        return(x)

    if loxpseq is None:
        loxpseq = "ATAACTTCGTATAATGTACATTATACGAAGTTAT"
    if unmapped is not None:
        with open(unmapped, 'w') as f:
            f.write("# unmapped gff entries\n")
    print("Using {} for alignment".format(use))
    temp_file = tempfile.NamedTemporaryFile(mode='w')
    with open(temp_file.name,'w') as f2:
        f2.write(">loxpsym"+ "\n")
        f2.write(str(loxpseq)+"\n")
    dummy_gff = pd.DataFrame.from_records([{
        "seqname":"loxpsym",
        "start":1,
        "end":1,
        "source":"ANB",
        "feature":"site_specific_recombination_target_region",
        "score":".",
        "strand":".",
        "frame":".",
        "attribute":"ID=;"
    }],index=("seqname","start","end"))
    thisfrom = readFASTA_SeqIO(temp_file.name)

    thisentry = mapGFF(gff_in = dummy_gff, to_fa = to_fa, from_fa = thisfrom["loxpsym"],
                        use = use, onlyHighest = onlyHighest, correct_tRNA = correct_tRNA,
                        enforceLen = enforceLen, gsnap_index = gsnap_index,
                        gsnapPath = gsnapPath, unmapped = unmapped)

    if segments is not None:
        thisentry_drop = thisentry.reset_index()
        segments_drop = segments.reset_index()
        segments_drop = segments_drop.loc[segments_drop["seqname"].isin(list(set(thisentry_drop["seqname"])))]
        args = {
            "segments" : segments_drop,
            "circular" : circular
        }
        thisentry_drop = thisentry_drop.apply(findSegs, axis=1, **args)
        thisentry = thisentry_drop.set_index(["seqname","start","end"])
    out = thisentry
    if gff is not None:
        out = gff.append(out)
    temp_file.close()
    out = out.sort_index()
    return out

def emergencyMapper(x, gff, to_fa, from_fa, onlyHighest,
           correct_tRNA, enforceLen, use,
           blatPath, gsnap_index,
           gsnapPath):
    """
    Map entry based on neighboring alignments. Coordinates are relative to
    neighboring alignments. This makes a lot of assumptions
    but is necessary for small fragments that do not have unique
    alignments. Relies on mapping with SCRaMbLE segs.
    Need to do this wrt to segments to other mappings!!
    """

    if "site_specific_recombination_target_region" in list(gff.feature):
        x = x.reset_index()
        seq = x["seqname"][0]
        start = x.start[0]
        end = x.end[0]
        # locate adjacent loxPsym sites
        gff = gff.reset_index()
        loxPsyms = gff.loc[gff.feature == "site_specific_recombination_target_region"]
        loxPsyms = loxPsyms.assign(dstart = abs(loxPsyms["start"] - start),
                                 dend = abs(loxPsyms["end"] - end))
        loxPsyms_start = loxPsyms.sort_values(["dstart"]).reset_index()
        loxPsyms_end = loxPsyms.sort_values(["dend"]).reset_index()

        # start of feature is closest
        if loxPsyms_start["dstart"].iloc[0] <= loxPsyms_end["dend"].iloc[0]:
            if loxPsyms_start["end"].iloc[0] < start:
                leftSym = loxPsyms_start.iloc[[0]]
                # special exception for last loxPsym site
                if (int(leftSym["start"]) >= max(loxPsyms_start["start"])):
                    rightSym = loxPsyms_start.iloc[[0]]
                    rightSym["start"] = max(gff["end"]) + 1
                    rightSym["end"] = max(gff["end"]) + 1
                else:
                    i = 0
                    while ((i < loxPsyms_end.shape[0]) and
                            ((loxPsyms_end.iloc[[i]].equals(leftSym)) or
                            (int(loxPsyms_end.iloc[[i]]["start"]) < int(leftSym["start"])))):
                              i = i + 1
                    rightSym = loxPsyms_end.iloc[[i]]
            else:
                rightSym = loxPsyms_start.iloc[[0]]
                # special exception for first loxPsym site
                if (int(rightSym["start"]) <= min(loxPsyms_start["start"])):
                    leftSym = loxPsyms_start.iloc[[0]]
                    leftSym["start"] = 0
                    leftSym["end"] = 0
                else:
                    i = 0
                    while ((i < loxPsyms_end.shape[0]) and
                          ((loxPsyms_start.iloc[[i]].equals(rightSym)) or
                              (int(loxPsyms_start.iloc[[i]]["start"]) > int(rightSym["start"])))):
                            i = i + 1
                    leftSym = loxPsyms_start.iloc[[i]]
        # start of feature is closest
        elif loxPsyms_end["dend"].iloc[0] < loxPsyms_start["dstart"].iloc[0]:
            if loxPsyms_end["start"].iloc[0] > end:
                rightSym = loxPsyms_end.iloc[[0]]
                # special exception for first loxPsym site
                if (int(rightSym["start"]) <= min(loxPsyms_start["start"])):
                    leftSym = loxPsyms_start.iloc[[0]]
                    leftSym["start"] = 0
                    leftSym["end"] = 0
                else:
                    i = 0
                    while ((i < loxPsyms_end.shape[0]) and
                        ((loxPsyms_start.iloc[[i]].equals(rightSym)) or
                              (int(loxPsyms_start.iloc[[i]]["start"]) > int(rightSym["start"])))):
                            i = i + 1
                    leftSym = loxPsyms_start.iloc[[i]]
            else:
                leftSym = loxPsyms_end.iloc[[0]]
                # special exception for last loxPsym site
                if (int(leftSym["start"]) >= max(loxPsyms_start["start"])):
                    rightSym = loxPsyms_start.iloc[[0]]
                    rightSym["start"] = max(gff["end"]) + 1
                    rightSym["end"] = max(gff["end"]) + 1
                else:
                    i = 0
                    while ((i < loxPsyms_end.shape[0]) and
                        ((loxPsyms_end.iloc[[i]].equals(leftSym)) or
                              (int(loxPsyms_end.iloc[[i]]["start"]) < int(leftSym["start"])))):
                            i = i + 1
                    rightSym = loxPsyms_end.iloc[[i]]

        gff_sub = gff.loc[(gff["seqname"]==seq) &
                           (gff["start"] > int(leftSym["end"])) &
                           (gff["end"] < int(rightSym["start"]))]
        gff_sub = gff_sub.assign(dstart = abs(gff_sub["start"] - start),
                                 dend = abs(gff_sub["end"] - end))
        gff_sub = gff_sub.loc[(gff_sub["dstart"]>0) & (gff_sub["dend"]>0)]
        if gff_sub.shape[0] == 0:
            print(x)
            print(gff_sub)
            print("Failed to map features in area")
            toreturn = None
        else:

            if min(gff_sub["dstart"]) < min(gff_sub["dend"]):
                gff_sub = gff_sub.sort_values(["dstart"])
            else:
                gff_sub = gff_sub.sort_values(["dend"])
            i = 0
            closest = None
            while ((closest is None) & (i < gff_sub.shape[0])):
                xi = gff_sub.iloc[[i]].set_index(["seqname","start","end"])
                closest = mapGFF(xi, to_fa, from_fa, onlyHighest,
                           correct_tRNA, enforceLen, use,
                           blatPath = blatPath, unmapped = None,
                           useEmergencyMapper = False,
                           full_gff = gff, gsnap_index = gsnap_index,
                           gsnapPath = gsnapPath)
                i = i + 1
            if closest is None:
                print(x)
                print(gff_sub)
                print("Failed to map features in area")
                toreturn = None
            else:
                thisdistance_start = int(x["start"]) - int(gff_sub.iloc[(i-1)]["start"])
                thisdistance_end = int(x["end"]) - int(gff_sub.iloc[(i-1)]["start"])
                closest = closest.reset_index()
                def gffUpdater(this, x = x,
                                thisdistance_start = thisdistance_start,
                                thisdistance_end = thisdistance_end):
                    this["start"] = int(this["start"]) + thisdistance_start
                    this["end"] = int(this["end"]) + thisdistance_end
                    this["feature"] = str(x["feature"][0])
                    this["source"] = str(x["source"][0])
                    this["score"] = str(x["score"][0])
                    this["attribute"] = str(x["attribute"][0])
                    if str(x["strand"][0]) == ".":
                        this["strand"] = str(x["strand"][0])
                    return(this)

                toreturn = closest.apply(gffUpdater, axis=1)
        return(toreturn)
    else:
        print("ERROR: Could not find loxPsym sequences in GFF file. Can't perform emergency mapping")
        return(None)


def mapBEDsingle(bed, mummerresult):
    def switchSE(x):
        if x["S2"] > x["E2"]:
            tmps = x["E2"]
            tmpe = x["S2"]
            x["S2"] = tmps
            x["E2"] = tmpe
            x["Strand"] = "-"
        else:
            x["Strand"] = "+"
        return(x)

    mummerresult = mummerresult.loc[mummerresult["NAME_Q"]==bed["chrom"]]
    mummerresult_forward = mummerresult.apply(switchSE, axis=1)
    mummerresult_pyrange = mummerresult_forward
    mummerresult_pyrange = mummerresult_pyrange.assign(Chromosome = mummerresult_forward["NAME_Q"],
                                                       Start = mummerresult_forward["S2"],
                                                       End = mummerresult_forward["E2"])
    mummerresult_pyrange = pr.PyRanges(mummerresult_pyrange)

    bed_pyranges = pr.PyRanges(chromosomes = [bed["chrom"]], starts = [bed["start"]], ends = [bed["end"]], strands = [bed["strand"]])

    thisoverlap = mummerresult_pyrange.overlap(bed_pyranges)

    if len(thisoverlap.chromosomes) < 1:
        warnings.warn("Entry {} maps to more than one chromosome".format(bed))

    newentries = []
    for chr in thisoverlap.chromosomes:
        this = thisoverlap[chr]
        if (len(this) > 1):
            for i in range(0,len(this)):
                newbed = bed.copy(deep=True)
                # new entry for each match
                if (i == 0):
                    # first entry
                    thismatch = thisoverlap.as_df().iloc[i]
                    newstart = int(round(interp(bed["start"],
                                        [thismatch["S2"],thismatch["E2"]],
                                        [thismatch["S1"],thismatch["E1"]])))
                    newbed["start"] = newstart
                    newbed["end"] = thismatch["E1"]
                    newbed["chrom"] = thismatch["NAME_R"]
                    newbed["name"] = "{}_{}".format(newbed["name"],str(i))
                    if (thismatch["Strand"]=="-"):
                        if (newbed["strand"] == "+"):
                            newbed["strand"] = "-"
                        elif (newbed["strand"] == "-"):
                            newbed["strand"] = "+"
                elif (i == len(thisoverlap)-1):
                    # last entry
                    thismatch = thisoverlap.as_df().iloc[i]
                    newend = int(round(interp(bed["end"],
                                        [thismatch["S2"],thismatch["E2"]],
                                        [thismatch["S1"],thismatch["E1"]])))
                    newbed["start"] = thismatch["S1"]
                    newbed["end"] = newend
                    newbed["chrom"] = thismatch["NAME_R"]
                    newbed["name"] = "{}_{}".format(newbed["name"],str(i))
                    if (thismatch["Strand"]=="-"):
                        if (newbed["strand"] == "+"):
                            newbed["strand"] = "-"
                        elif (newbed["strand"] == "-"):
                            newbed["strand"] = "+"
                else:
                    thismatch = thisoverlap.as_df().iloc[i]
                    newbed["start"] = thismatch["S1"]
                    newbed["end"] = thismatch["E1"]
                    newbed["chrom"] = thismatch["NAME_R"]
                    newbed["name"] = "{}_{}".format(newbed["name"],str(i))
                    if (thismatch["Strand"]=="-"):
                        if (newbed["strand"] == "+"):
                            newbed["strand"] = "-"
                        elif (newbed["strand"] == "-"):
                            newbed["strand"] = "+"
                newentries.append(pd.DataFrame(newbed).transpose())
        else:
            newbed = bed
            thismatch = thisoverlap.as_df().iloc[0]
            newstart = int(round(interp(bed["start"],
                                [thismatch["S2"],thismatch["E2"]],
                                [thismatch["S1"],thismatch["E1"]])))
            newend = int(round(interp(bed["end"],
                                [thismatch["S2"],thismatch["E2"]],
                                [thismatch["S1"],thismatch["E1"]])))
            newbed["start"] = newstart
            newbed["end"] = newend
            newbed["chrom"] = thismatch["NAME_R"]
            if (thismatch["Strand"]=="-"):
                if (newbed["strand"] == "+"):
                    newbed["strand"] = "-"
                elif (newbed["strand"] == "-"):
                    newbed["strand"] = "+"
            newentries.append(pd.DataFrame(newbed).transpose())
    if len(newentries) > 0:
        return(pd.concat(newentries))
    else:
        return(pd.DataFrame())

def addCount(x, df):
    #print(x)
    x = df.loc[[x]]
    #print(x)
    x = x.reset_index(drop=False)
    x["count"] = x.shape[0]

    return(x)

def mapBED(query_fasta, query_bed, ref_fasta, query_chrs = None, ref_chrs = None, nproc = 32):

    q_fa = readFASTA_SeqIO(query_fasta)

    r_fa = readFASTA_SeqIO(ref_fasta)
    if (type(query_bed) is not pd.core.frame.DataFrame):
        q_bed = pybedtools.BedTool(query_bed).to_dataframe()
    else:
        q_bed = query_bed

    if query_chrs is not None:
        if type(query_chrs) is str:
            query_chrs = [query_chrs]
        q_fa = {i:q_fa[i] for i in query_chrs}
        q_bed_others = q_bed.loc[~q_bed["chrom"].isin(query_chrs)]
        q_bed = q_bed.loc[q_bed["chrom"].isin(query_chrs)]

    if ref_chrs is not None:
        if type(ref_chrs) is str:
            ref_chrs = [ref_chrs]
        r_fa = {i:r_fa[i] for i in ref_chrs}

    align = runMummer(r_fa,q_fa)

    align = align.sort_values(["NAME_Q","S2","LEN_2","%_IDY"])

    #newbed = query_bed.apply(mapBEDsingle, mummerresult = align)

    pool = mp.Pool(processes=nproc)
    #results = [pool.apply(mapGFF, args=(from_fa,gff_in.iloc[[x]], to_fa)) for x in range(0,gff_in.shape[0])]
    bed_arg = [q_bed.iloc[x] for x in range(0,q_bed.shape[0])]

    fcn = partial(mapBEDsingle, mummerresult = align)
    print("Mapping BED entries")
    results = pool.map(fcn, bed_arg)
    out = pd.concat(results)


    # remove duplicates
    out_index = out.copy(deep=True)

    out_index = out_index.set_index(["chrom","start","end","name","score","strand"])
    group_arg = list(out_index.index)
    fcn2 = partial(addCount, df = out_index)
    print("Removing duplicates")
    pool2 = mp.Pool(processes=nproc)
    results = pool2.map(fcn2, group_arg)
    out = pd.concat(results)
    out = out.sort_values(["chrom","start","end","name","count"])
    out = out.drop_duplicates(["name"],keep="first").drop("count",axis=1)

    out = pd.concat([out,q_bed_others])
    out = out.sort_values(["chrom","start","end","name","score"])
    out = out.drop_duplicates(["name"])
    return(out)


if __name__ == "__main__":


    parser = argparse.ArgumentParser()
    parser.add_argument('--ref_fa', help='file path to reference genome, fasta format',
                        required=True, metavar = "REFERENCE FASTA FILE PATH")
    parser.add_argument('--ref_gff', help='file path to reference gff, can be partial',
                        required=False, default=None, metavar = "REFERENCE GFF FILE PATH")
    parser.add_argument('--full_gff', help='file path to full reference gff uf ref_gff is partial',
                        required=False, default=None, metavar = "FULL REFERENCE GFF FILE PATH")
    parser.add_argument('--query_fa', help='file path to query genome, fasta format',
                        required=True, metavar = "QUERY FASTA FILE PATH")
    parser.add_argument('--output_gff', help='file path to output gff',
                        required=True, metavar = "OUTPUT GFF FILE PATH")
    parser.add_argument('--annotation_filter', help='list of gff "type" features to exclude',
                        required=False, default=None, nargs="+", metavar = "FEATURE TYPE LIST")
    parser.add_argument('--segment_table', help='segment sequence table file name. columns: number,seq',
                        required=False, default=None, type=str, metavar = "FEATURE TYPE LIST")
    parser.add_argument('--loxpseq', help='loxpsym sequence',
                        required=False, default=None, type=str, metavar = "LOXPSYM SEQ")
    parser.add_argument('--cores', help='number of cores to use',
                        required=False, default=32, type=int)
    parser.add_argument('--use', help='aligner to use, blat, mummer or gsnap',
                        required=False, default="mummer", type=str)
    parser.add_argument('--blatpath', help='path to blat executable',
                        required=False, default="/g/steinmetz/brooks/anaconda/envs/nanopore/bin/blat", type=str)
    parser.add_argument('--unmapped', help='path to file for unmapped entries',
                        required=False, default="unmapped.gff", type=str)
    parser.add_argument('--useEmergencyMapper', help='use relative mapping with entries that fail to align',
                        required=False, default=True, type=bool)
    parser.add_argument('--specific_entry', help='only translate a specific entry in gff, index (integer). Used for jobs sent to cluster.',
                        required=False, default=None, type=int)
    parser.add_argument('--gsnap_index', help='location of genome index for gsnap',
                        required=False, default=None, type=str)
    parser.add_argument('--gsnap_path', help='path to gsnap binary',
                        required=False, default=None, type=str)
    args = parser.parse_args()
    # important paths
    # ref = {
    #     "fa" : ('/g/steinmetz/project/IESY/genomes/annotations/scramble/genomes/S288C_reference_genome_R64-2-1_20150113/'
    #           'S288C_reference_sequence_R64-2-1_20150113.fsa'),
    #     "gff" : ('/g/steinmetz/project/IESY/genomes/annotations/scramble/genomes/S288C_reference_genome_R64-2-1_20150113/'
    #           'saccharomyces_cerevisiae_R64-2-1_20150113_annotation_only.gff')}
    #
    # query = {
    #     "fa" : ('/g/steinmetz/project/IESY/genomes/annotations/scramble/genomes/'
    #             'JS710.fa'),
    #     "gff" : ('/g/steinmetz/project/IESY/genomes/annotations/scramble/genomes/'
    #             'test_JS710.gff')
    # }
    if args.ref_gff is not None:
        gff = readGFF(args.ref_gff)
        if args.full_gff is not None:
            full_gff = readGFF(args.full_gff)
        else:
            full_gff = gff
        if args.annotation_filter is not None:
            gff = gff[~gff['feature'].isin(args.annotation_filter)]
        if args.specific_entry is None:
            out = mapMultipleGFF(args.ref_fa, gff, args.query_fa, usemp=True, nproc=args.cores,
                use = args.use, blatPath = args.blatpath, unmapped = args.unmapped,
                useEmergencyMapper = args.useEmergencyMapper,
                gsnap_index = args.gsnap_index,
                gsnapPath = args.gsnap_path, full_gff = full_gff)
        else:
            if args.specific_entry < gff.shape[0]:
                out = mapGFF(gff_in = gff.iloc[[args.specific_entry]],
                            from_fa = args.ref_fa, to_fa = args.query_fa,
                            use = args.use, blatPath = args.blatpath,
                            unmapped = args.unmapped,
                            useEmergencyMapper = args.useEmergencyMapper, full_gff = full_gff,
                            onlyHighest=True, correct_tRNA=True, enforceLen=True,
                            gsnap_index = args.gsnap_index,
                            gsnapPath = args.gsnap_path)
            else:
                print("No such specific entry. Entry outside index.")
                out = None
    else:
        out = None

    if args.segment_table is not None:
        out = addSeg(args.query_fa, args.segment_table, gff = out, usemp=True, nproc=args.cores,
                    use = args.use, blatPath = args.blatpath, unmapped = args.unmapped)

    if args.loxpseq is not None:
        out = addLoxp(args.query_fa, loxpseq = args.loxpseq, segments = out, gff = out,
                    unmapped = args.unmapped,
                    use = "gsnap", gsnap_index = args.gsnap_index,
                    gsnapPath = args.gsnap_path)

    #out = out.drop_duplicates(["seqname","start","end"])
    if out is not None:
        out = out[~out.index.duplicated(keep='first')]
        #out = out.sort_values(["seqname","start","end"])
        writeGFF(out,args.output_gff)
    else:
        with open(args.output_gff, 'w') as f:
            f.write("")

    # EXAMPLE
    # BASE="/g/steinmetz/project/IESY/genomes/annotations/scramble"
    # REF_FA=$BASE/genomes/S288C_reference_genome_R64-2-1_20150113/S288C_reference_sequence_R64-2-1_20150113.fsa
    # REF_GFF=$BASE/genomes/S288C_reference_genome_R64-2-1_20150113/saccharomyces_cerevisiae_R64-2-1_20150113.gff
    #
    # QUERY_FA_1=/g/steinmetz/project/IESY/genomes/synIXR_scramble/JS734_ERCC92.fasta
    # OUTPUT_GFF_1=$BASE/gff/JS734.gff
    # /g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scripts/scrambleMapper.py \
    # --ref_fa $REF_FA --ref_gff $REF_GFF --query_fa $QUERY_FA_1 --output_gff $OUTPUT_GFF_1
    #
    # QUERY_FA_2=/g/steinmetz/project/IESY/genomes/synIXR_scramble/JS94_ERCC92.fasta
    # OUTPUT_GFF_2=$BASE/gff/JS94.gff
    # /g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scripts/scrambleMapper.py \
    # --ref_fa $REF_FA --ref_gff $REF_GFF --query_fa $QUERY_FA_2 --output_gff $OUTPUT_GFF_2
    #
    # QUERY_FA_3=/g/steinmetz/project/IESY/genomes/synIXR_scramble/JS731_ERCC92.fasta
    # OUTPUT_GFF_3=$BASE/gff/JS710.gff
    # /g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scripts/scrambleMapper.py \
    # --ref_fa $REF_FA --ref_gff $REF_GFF --query_fa $QUERY_FA_3 --output_gff $OUTPUT_GFF_3
    #
    # QUERY_FA_4=/g/steinmetz/project/IESY/genomes/synIXR_scramble/JS731_ERCC92.fasta
    # OUTPUT_GFF_4=$BASE/gff/JS731.gff
    # /g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scripts/scrambleMapper.py \
    # --ref_fa $REF_FA --ref_gff $REF_GFF --query_fa $QUERY_FA_4 --output_gff $OUTPUT_GFF_4
    #
    # QUERY_FA_5=/g/steinmetz/project/IESY/genomes/synIXR_scramble/S288C_ERCC92.fasta
    # OUTPUT_GFF_5=$BASE/gff/S288C.gff
    # /g/steinmetz/brooks/git/steinmetz-lab/yeast2_0/scripts/scrambleMapper.py \
    # --ref_fa $REF_FA --ref_gff $REF_GFF --query_fa $QUERY_FA_5 --output_gff $OUTPUT_GFF_5
