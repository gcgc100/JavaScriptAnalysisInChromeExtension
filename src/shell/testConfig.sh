#!/bin/zsh

DATADIR="../../tests/shellTests/"
#DATADIR="/Volumes/research/shellTests/"
export GCEXTANA_DATADIR=$DATADIR
export GCEXTANA_EXTENSIONIDLIST=$DATADIR"exIdList/"
export GCEXTANA_DATABASE=$DATADIR"test.db"
export GCEXTANA_CRXDIR=$DATADIR"crxFiles/"
export GCEXTANA_ARCHIVE=$DATADIR"archive/"
export GCEXTANA_EXTSRC=$DATADIR"extSrc/"
export GCEXTANA_SCRIPTDIR=$DATADIR"scripts/"

export PYTHON=/usr/local/opt/python@3.7/bin/python3
