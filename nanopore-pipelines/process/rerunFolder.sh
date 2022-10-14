#!/usr/bin/env bash

# renmae _pass_ files
# find -name "*_pass_*" | sed -e "p;s/_pass_/_/g" | xargs -n2 mv

while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -d | --directory )
    shift; DIR=$1
    ;;
  -j | --jobs )
    shift; J=$1
    ;;
  -c | --cores )
    shift; CORES=$1
    ;;
  -s | --snakefiles )
    shift; SNAKEFILE=$1
    ;;
  -dd | --deletedir )
    shift; DD=$1
    ;;
  -b | --backupdir )
    shift; B=$1
    ;;
  -C | --cluster )
    C=true
    ;;
  --basecall )
    BASECALL=true
    ;;
  -n | --dryrun )
    DRY=true
    ;;
  -h | --help )
cat << EOF
usage: rerunFolder.sh [-d <directory>]

options:
-d, --directory       directory to rerun
-j, --jobs            # jobs to rerun in parallel
-c, --cores           cores to use
-s, --snakefile       Snakefiles dir to link
-dd, --deletedir      directory to look for done.log to remove
-b, --backupdir       backupdir to retrieve fast5.tgz if it was deleted
-C, --cluster         whether to run on the cluster
--basecall            delete everything and force basecall from fast5
-n, --dryrun          don't actually run

EOF
    exit
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi

if [[ -z "$DIR" ]]; then echo "Must supply directory with -d, --directory";exit ; fi

if [[ -z "$SNAKEFILE" ]]; then echo "Must supply Snakefile script directory to link with -s, --snakefiles";exit ; fi

if [[ -z "$B" ]]; then B='none'; fi

if [[ -z "$CORES" ]]; then CORES=1; fi

if [[ -z "$J" ]]; then J=1; fi

if [[ -z "$C" ]]; then C=false; fi

if [[ -z "$BASECALL" ]]; then BASECALL=false; fi

if [[ -z "$DRY" ]]; then DRY=false; fi

#conda activate nanopore

if [[ ! -z "$DD" ]];
then
  if $BASECALL;
  then
    printf "RESULTS\n"
    printf "Are you sure you want to delete $DD? \n\ttype 'yes' to confirm followed by [ENTER]:\n"
    read CONFIRM
    if [ $CONFIRM == "yes" ];
    then
      rm -rf $DD
    fi
  else
    find $DD -name "done.log" -exec rm {} \;
  fi
fi

rerun(){
  f=$1
  B=$2
  SNAKEFILE=$3
  C=$4
  DRY=$5
  BASECALL=$6

  echo "rerunning directory $f"
  cd $f
  #echo $B
  if [ "$B" != "none" ];
  then
    #echo "retrieving fast5.tgz from: $B"
    FAST5="./fast5.tgz"
    if [ ! -e "$FAST5" ];
    then
      THISD=$(basename $f)
      A=$B/$THISD
      echo "retrieving fast5.tgz from: $A"
      #echo $A
      tar -xzvf $A.tgz ./fast5.tgz
    fi
  fi

  RUN="./run.out"
  if [ -e  "$RUN" ];
  then
      rm $RUN
  fi
  S1="./Snakefile"
  if [ -e "$S1" ];
  then
      rm "$S1"
  else
    if [ -L "$S1" ];
    then
        rm "$S1"
    fi
  fi
  S2="./snakemake.sh"
  if [ -e "$S2" ];
  then
      rm "$S2"
  else
    if [ -L "$S2" ];
    then
        rm "$S2"
    fi
  fi
  S3="./cluster.json"
  if [ -e "$S3" ];
  then
      rm "$S3"
  else
    if [ -L "$S3" ];
    then
        rm "$S3"
    fi
  fi
  #echo $BASECALL
  if $BASECALL;
  then
    # printf "Are you sure you want to delete all data for $f and basecall again? \n\ttype 'yes' to confirm followed by [ENTER]:\n"
    # read CONFIRM
    CONFIRM="yes"
    if [ $CONFIRM == "yes" ];
    then
      if [ ! -e "$FAST5" ];
      then
        echo "Must supply backup directory to pull fast5.tgz with -b, --backupdir "; exit
      else
        echo $f
        find ./ -maxdepth 1 -type d -name "*" ! -name fast5 ! -name . ! -name .. ! -name config.json -exec rm -rf {} +
        find ./ -maxdepth 1 -type f -name "*" ! -name fast5.tgz ! -name *.fast5 ! -name config.json -exec rm -rf {} +
        THISFAST5="fast5"
        if [ ! -d "$THISFAST5" ];
        then
          mkdir $THISFAST5
        fi
        tar --skip-old-files -xzf fast5.tgz -C fast5
        # check for tar within tgz
        THISTAR=$(find ./fast5 -name "*.tar" -o -name "*.tgz")
        if [[ ! -z $THISTAR ]];
        then
          find ./ -name "*.tar" -o -name "*.tgz" -exec tar --skip-old-files -xf {} -C fast5 \;
        fi
        python /g/steinmetz/project/IESY/software/nanotools/process_basecall/toBasecall.py \
          --file $f/config.json \
          --savePath $f \
          --reads $f/fast5
        ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/Snakefile" .
        ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/snakemake.sh" .
        ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/cluster.json" .
      fi
    fi
  else
    ln -s "$SNAKEFILE/Snakefile" .
    ln -s "$SNAKEFILE/snakemake.sh" .
    ln -s "$SNAKEFILE/cluster.json" .
  fi

  if $C;
  then
    SLURM="./slurm"
    if [ -d "$SLURM" ];
    then
      rm slurm/*
    else
      mkdir slurm
    fi
    ERROR="./error"
    if [ -d "$ERROR" ];
    then
      rm error/*
    else
      mkdir error
    fi
    if $DRY;
    then
      snakemake -n
    else
      sh ./snakemake.sh &> run.out
    fi
  else
    if $DRY;
    then
      snakemake -n
    else
      snakemake --cores $CORES --keep-going
    fi
  fi
}

export -f rerun
#echo $BASECALL
#echo $B
find $DIR -not -path '*/\.*' -name "Snakefile" | sed -r 's|/[^/]+$||' | \
  sort | uniq | parallel -j$J rerun {} $B $SNAKEFILE $C $DRY $BASECALL

# accessory scripts

# for D in `find /g/steinmetz/project/IESY/sequencing/Data/minION/directrna -mindepth 1 -maxdepth 1 -type d`
# do
#     cd $D
#     rm Snakefile
#     ln -s /g/steinmetz/project/IESY/software/nanotools/process/Snakefile .
#     cd /g/steinmetz/project/IESY/sequencing/Data/minION/directrna
# done

# find /g/steinmetz/project/IESY/sequencing/Data/minION/directrna -name config.json -exec sed -i 's/transfer\///g' {} \;
# find /g/steinmetz/project/IESY/sequencing/Data/minION/teloprime -name config.json -exec sed -i 's/transfer\///g' {} \;
#
#
# example
# /g/steinmetz/project/IESY/software/nanotools/process/rerunFolder.sh \
#   -d /g/steinmetz/project/IESY/sequencing/Data/minION/teloprime \
#   -c 32 \
#   -s /g/steinmetz/project/IESY/software/nanotools/process/ \
#   -dd /g/steinmetz/project/IESY/sequencing/Results/minION/teloprime \
#   -b /g/tier2/steinmetz/project/IESY/sequencing/data/minion/RNA/teloprime_back
#
#   # example
# /g/steinmetz/project/IESY/software/nanotools/process/rerunFolder.sh \
#   -d /g/steinmetz/project/IESY/sequencing/Data/minION/directrna/BY4741_20180629 \
#   -c 32 \
#   -s /g/steinmetz/project/IESY/software/nanotools/process/ \
#   -n
