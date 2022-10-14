# requires python 3.5


import os
from Bio import SeqIO
from linecache import getline
import re
import pandas as pd
import subprocess
import tempfile
import glob
import shutil

revAdapters = ["teloprime_umi_r", "teloprimeR"]

def processReadList(x):
    #print(x)
    # first read contain seqinfo
    readid = x[0].split(" ")[0]
    runid = x[0].split(" ")[1].split("=")[1]
    df = []
    for ind, d in enumerate(x):
        #print(ind)
        if d == "start alignments:":
            j = 1
            #print(x[ind+j].split(","))
            if (ind+j) < len(x):
                while (len(x[ind+j].split(",")) == 4):
                    thisline = x[ind+j].split(",")
                    thisd = {
                        "readid" : readid,
                        "runid" : runid,
                        "position" : "start",
                        "adapter" : thisline[0],
                        "fullscore" : float(thisline[1].split("=")[1]),
                        "partialscore" : float(thisline[2].split("=")[1]),
                        "start"  : int(thisline[3].split(":")[1].lstrip().split("-")[0]),
                        "end" : int(thisline[3].split(":")[1].lstrip().split("-")[1])
                    }
                    df.append(pd.DataFrame(thisd,index=[0]))
                    j += 1
                    if (ind+j) >= len(x):
                        break
        elif d == "end alignments:":
            j = 1
            if (ind+j) < len(x):
                while (len(x[ind+j].split(",")) == 4) and (j < len(x)):
                    thisline = x[ind+j].split(",")
                    thisd = {
                        "readid" : readid,
                        "runid" : runid,
                        "position" : "end",
                        "adapter" : thisline[0],
                        "fullscore" : float(thisline[1].split("=")[1]),
                        "partialscore" : float(thisline[2].split("=")[1]),
                        "start"  : int(thisline[3].split(":")[1].lstrip().split("-")[0]),
                        "end" : int(thisline[3].split(":")[1].lstrip().split("-")[1])
                    }
                    df.append(pd.DataFrame(thisd,index=[0]))
                    j += 1
                    if (ind+j) >= len(x):
                        break
    #df = pd.concat(df)
    if len(df) > 0:
        df = pd.concat(df)
    else:
        df = None
    return(df)

def porechopRead(porechop):
    porechop_d = {}
    yesreverse = []
    noreverse = []
    with open(porechop, "r") as f:
        for ind, line in enumerate(f,1):
            #print(ind)
            if "middle adapters" in line:
                break
            elif "runid" in line:
                entry = [line]
                thisid = line.split(" ")[0]
                i = 1
                newline = getline(f.name, ind + i)
                while newline != "\n":
                        entry.append(newline.rstrip().lstrip())
                        i += 1
                        newline = getline(f.name, ind + i)
                porechop_d[thisid] = processReadList(entry)
                if porechop_d[thisid] is not None:
                    if porechop_d[thisid].loc[porechop_d[thisid]["adapter"].isin(revAdapters)].shape[0] > 0:
                        yesreverse.append(thisid)
                    else:
                        noreverse.append(thisid)
    return(porechop_d, yesreverse, noreverse)

def extractReads(fastq, thislist, out, listfile = None):
    if listfile is None:
        listfile = tempfile.NamedTemporaryFile(mode='w', delete=False)
        print(listfile.name)
    with open(listfile.name, mode = "w") as f:
        for thisitem in thislist:
            f.write("{}\n".format(thisitem))
    with open(out, "w") as f2:
        cmd = ["seqtk", "subseq", fastq, f.name]
        print(cmd)
        p = subprocess.Popen(cmd, stdout=f2,
                     stderr=subprocess.PIPE)
        stdout, stderr = p.communicate()
    return(None)

def reverseReads(fastq):
    cmd = ["seqkit", "seq", "-r", "-p", fastq, ">", fastq+"_tmp"]
    p = subprocess.call(" ".join(cmd), shell=True)
    cmd2 = ["mv", fastq+"_tmp",fastq]
    p2 = subprocess.call(" ".join(cmd2), shell=True)
    return(None)

def combineReads(fileList, outFile):
    with open(outFile, 'w') as f:
        for fname in fileList:
            with open(fname) as infile:
                for line in infile:
                    f.write(line)
    return(None)

def process(fastq, porechop, tmpdir = None, outfastq = None):
    if tmpdir is None:
        tmpdir = "./"
    if outfastq is None:
        outfastq = "out.fastq"
    thistmp = tmpdir + "tmpFastaPorechopProcess"
    if not os.path.exists(thistmp):
        os.makedirs(thistmp)
    df, yesrev, norev = porechopRead(porechop)
    #print(yesrev)
    #print(norev)
    extractReads(fastq, yesrev, thistmp + "/yesrev.fastq")
    reverseReads(thistmp + "/yesrev.fastq")
    extractReads(fastq, norev, thistmp + "/norev.fastq")
    combineReads([thistmp + "/yesrev.fastq", thistmp + "/norev.fastq"], outfastq)
    shutil.rmtree(thistmp)
    return(df)
