#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")
PYTHON=python3

echo $BASEDIR

#extensionIdList=$BASEDIR/../../data/extensionIdList/
extensionIdList=$BASEDIR/../../data/extensionIdListSample10/
crxDir=$BASEDIR/../../data/crxFiles/
database=$BASEDIR/../../data/data.db
archive=$BASEDIR/../../data/archive/

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        #extensionIdList=$BASEDIR/../../tests/shellTests/exIdListWithMulVulLib/
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        archive=$BASEDIR/../../tests/shellTests/archive/
    elif [[ $1 = "testNewVersion" ]]; then
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        cp $BASEDIR/../../tests/shellTests/crxTestData/testNewVersion.db $database
        archive=$BASEDIR/../../tests/shellTests/archive/
    else
        source $1
        exit
    fi
fi

mkdir -p ${archive}crx/
tmpData=$BASEDIR/../../data/tmpData
mkdir -p $tmpData
if [[ ! -z $1 ]]; then
    if [[ $1 = "testNewVersion" ]]; then
        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py NewVersionDownload $database --crxDir $crxDir --archiveDir $archive
    else
        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir $crxDir --archiveDir $archive
    fi
else
    $PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir $crxDir --archiveDir $archive
fi
