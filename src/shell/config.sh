#!/bin/zsh

DATADIR="../../data2022/"
#DATADIR="/Volumes/research/data/"
export GCEXTANA_DATADIR=$DATADIR
export GCEXTANA_EXTENSIONIDLIST=$DATADIR"exIdList/"
export GCEXTANA_DATABASE=$DATADIR"dataV1-2.db"
##Use local dataV1-2.db to speed up.
#export GCEXTANA_DATABASE="./data/dataV1-2.db"
export GCEXTANA_CRXDIR=$DATADIR"crxFiles/"
export GCEXTANA_ARCHIVE=$DATADIR"archive/"
export GCEXTANA_EXTSRC=$DATADIR"extSrc/"
export GCEXTANA_SCRIPTDIR=$DATADIR"scripts/"

export PYTHON=/usr/local/opt/python@3.7/bin/python3

echo "\x1b[33;21mSome customized arguments are used. Make sure that's what you want! Input C to continue\x1b[0m"
read -k 

if [[ $REPLY = "C" ]]; then
    echo ""
    export GCEXTANA_CRXDIR=$DATADIR"crxFiles/"
    export GCEXTANA_ARCHIVE=$DATADIR"archive/"
else
    echo "\nExit"
fi
