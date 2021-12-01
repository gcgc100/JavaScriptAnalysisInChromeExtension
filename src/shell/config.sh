#!/bin/zsh

DATADIR="../../data/"
DATADIR="/Volumes/research/data/"
export GCEXTANA_DATADIR=$DATADIR
export GCEXTANA_EXTENSIONIDLIST=$DATADIR"exIdList/"
#export GCEXTANA_DATABASE=$DATADIR"dataV1-2.db"
#Use local dataV1-2.db to speed up.
export GCEXTANA_DATABASE="./data/dataV1-2.db"
export GCEXTANA_CRXDIR=$DATADIR"crxFiles/"
export GCEXTANA_ARCHIVE=$DATADIR"archive/"
export GCEXTANA_EXTSRC=$DATADIR"extSrc/"
export GCEXTANA_SCRIPTDIR=$DATADIR"scripts/"
