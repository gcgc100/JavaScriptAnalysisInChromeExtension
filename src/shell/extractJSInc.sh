#!/bin/zsh



BASEDIR=$(dirname "$0")

if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

if [[ $GCEXTANA_EXTSRC == "/"* ]]; then
    extSrcDir=$GCEXTANA_EXTSRC
else
    extSrcDir=$DATADIR$GCEXTANA_EXTSRC
fi

if [[ $GCEXTANA_DATABASE == "/"* ]]; then
    database=$GCEXTANA_DATABASE
else
    database=$DATADIR$GCEXTANA_DATABASE
fi

if [[ $GCEXTANA_CRXDIR == "/"* ]]; then
    crxDir=$GCEXTANA_CRXDIR
else
    crxDir=$DATADIR$GCEXTANA_CRXDIR
fi

if [[ $GCEXTANA_SCRIPTDIR == "/"* ]]; then
    scriptDir=$GCEXTANA_SCRIPTDIR
else
    scriptDir=$DATADIR$GCEXTANA_SCRIPTDIR
fi

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
$PYTHON $BASEDIR/../python/bin/extractJSInc.py allPack ${database} ${scriptDir} --static --dynamic --extAnalysis --srcPath ${extSrcDir} --crxPath ${crxDir}
