#!/usr/bin/env python3

import argparse
import json
import collections
import os

def toBasecall(file, savePath, reads = None, tmpdir = None):
    with open(file) as f:
        data = json.load(f)
    if ("base" in data.keys()):
        data.pop("base")
    if reads is None:
        data["reads"] = data["datadir"] + "/" + data["strain"] + "_" + data["date"]
    else:
        data["reads"] = reads
    if tmpdir is None:
        data["tmpdir"] = "/scratch/brooks/tmp"
    else:
        data["tmpdir"] = tmpdir
    if ("annotations" not in data.keys()):
        bed_base = "/g/steinmetz/project/IESY/genomes/annotations/scramble/bed/"
        strain = data["strain"]
        if strain in ["BY4741", "SLS045"]:
            data["annotations"] = bed_base + "S288C.bed"
        else:
            data["annotations"] = bed_base + data["strain"] + ".bed"
    data_ordered = collections.OrderedDict(sorted(data.items()))
    if not os.path.exists(savePath):
        os.mkdir(savePath)
    with open(savePath + '/config.json', 'w') as outfile:
        json.dump(data_ordered, outfile, indent="\t")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', help='file path to config.json to change',
                        required=True, metavar = "CONFIG.JSON IN")
    parser.add_argument('--savePath', help='path to save new config.json',
                        required=True, default=None, metavar = "CONFIG.JSON OUT [path]")
    parser.add_argument('--reads', help='file path to fast5 reads',
                        required=False, default=None, metavar = "FAST5 PATH")
    parser.add_argument('--tmpdir', help='tmpdir for basecalling',
                        required=False, default=None, metavar = "TMPDIR LOC")

    args = parser.parse_args()
    print("Writing basecalling config file to {}".format(args.savePath + '/config.json'))
    toBasecall(args.file, args.savePath, reads = args.reads, tmpdir = args.tmpdir)
