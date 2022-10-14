#!/bin/bash

if [[ "$@" == "" ]]; then
  set -- "all"
fi

conda activate nanopore

snakemake \
  --cluster-config cluster.json \
  --cluster "{cluster.sbatch} -p {cluster.partition} \
  -t {cluster.time} \
  --cpus-per-task {cluster.n} --mem {cluster.mem} \
  {cluster.moreoptions}" --jobs 1500 --jobname "{rulename}.{jobid}" \
  --local-cores 32 \
  --keep-going \
  --latency-wait 600 --restart-times 2 "$@"
