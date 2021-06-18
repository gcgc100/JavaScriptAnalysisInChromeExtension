#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")
PYTHON=python3

#extensionIdList=$BASEDIR/../../data/extensionIdList/
extensionIdList=$BASEDIR/../../data/extensionIdListSample10/
crxDir=$BASEDIR/../../data/crxFiles/
database=$BASEDIR/../../data/data.db
archive=$BASEDIR/../../data/archive/

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        archive=$BASEDIR/../../tests/shellTests/archive/
    else
        source $1
    fi
fi

mkdir -p ${archive}crx/
tmpData=$BASEDIR/../../data/tmpData
mkdir -p $tmpData
$PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --extensionIdList $extensionIdList --crxDir $crxDir --archiveDir $archive
