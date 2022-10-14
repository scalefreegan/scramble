conda activate nanopore
f=$(pwd)
tar --skip-old-files -xzf fast5.tgz -C fast5

THISTAR=$(find ./fast5 -name "*.tar")
if [[ ! -z $THISTAR ]];
then
  find ./ -name "*.tar" -exec tar --skip-old-files -xf {} -C fast5 \;
fi
python /g/steinmetz/project/IESY/software/nanotools/process_basecall/toBasecall.py \
  --file $f/config.json \
  --savePath $f \
  --reads $f/fast5
ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/Snakefile" .
ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/snakemake.sh" .
ln -s "/g/steinmetz/project/IESY/software/nanotools/process_basecall/cluster.json" .

mkdir slurm error

#sh ./snakemake.sh &> run.out
./snakemake.sh

rm -rf ./fast5 ./fast5.tgz

rm Snakefile snakemake.sh cluster.json
ln -s "/g/steinmetz/project/IESY/software/nanotools/process/Snakefile" .
ln -s "/g/steinmetz/project/IESY/software/nanotools/process/snakemake.sh" .
ln -s "/g/steinmetz/project/IESY/software/nanotools/process/cluster.json" .

snakemake -t
