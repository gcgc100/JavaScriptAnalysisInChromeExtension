#!/bin/bash

shopt -s nullglob

PYTHON=python3
BASEDIR=$(dirname "$BASH_SOURCE")

database=$BASEDIR/$GCEXTANA_DATABASE
crxDir=$BASEDIR/$GCEXTANA_CRXDIR
extSrcDir=$BASEDIR/$GCEXTANA_EXTSRC
scriptDir=$BASEDIR/$GCEXTANA_SCRIPTDIR


#dataDir=$BASEDIR/../../data/
#if [[ ! -z $1 ]]; then
#    if [[ $1 = "test" ]]; then
#        dataDir=$BASEDIR/../../tests/shellTests/
#        if [[ ! -f "${dataDir}test.db" ]]; then
#            cp ${dataDir}crxTestData/test.db ${dataDir}test.db
#        fi
#        database=${dataDir}test.db
#        if [[ ! -d  "${dataDir}extSrc/" ]]; then
#            cp -R ${dataDir}extsrcTestData/extSrc/ ${dataDir}extSrc/
#        fi
#        extSrcDir=${dataDir}extSrc/
#        scriptDir=${dataDir}scripts/
#        if [[ ! -d  "${dataDir}crxFiles/" ]]; then
#            cp -R ${dataDir}crxTestData/crxFiles/ ${dataDir}crxFiles/
#        fi
#        crxDir=${dataDir}crxFiles/
#    else
#        source $1
#        exit
#    fi
#fi


echo Start
echo "time: $(date +%s)"
mkdir -p ${scriptDir}

echo "Analysing extension"
$PYTHON $BASEDIR/../python/bin/ExtensionTool.py addPermission ${database}
$PYTHON $BASEDIR/../python/bin/extractJSInc.py allPack ${database} ${scriptDir} --static --dynamic --srcPath ${extSrcDir} --crxPath ${crxDir}
