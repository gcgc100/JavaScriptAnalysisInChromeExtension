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
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        archive=$BASEDIR/../../tests/shellTests/archive/
    elif [[ $1 = "test2" ]]; then
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        #rm -f $database
        #cp $BASEDIR/../../data/data.db $database
        #archive=$BASEDIR/../../tests/shellTests/archive/

        TMPFLAG=1
        if [[ $TMPFLAG == 1 ]]; then
            rm -f $database
            cp $BASEDIR/../../data/data.db $database
            archive=$BASEDIR/../../tests/shellTests/archive/
            $PYTHON $BASEDIR/../python/temp/SampleDBUtil.py --dbpath $database
        else
            cp $BASEDIR/../../tests/shellTests/testTmpBackup.db $database
        fi


    else
        source $1
    fi
fi

mkdir -p ${archive}crx/
tmpData=$BASEDIR/../../data/tmpData
mkdir -p $tmpData
if [[ ! -z $1 ]]; then
    if [[ $1 = "test2" ]]; then
        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py NewVersionDownload $database --crxDir $crxDir --archiveDir $archive
    else
        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --extensionIdList $extensionIdList --crxDir $crxDir --archiveDir $archive
    fi
fi
