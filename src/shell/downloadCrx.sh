#!/bin/zsh


BASEDIR=$(dirname "$0")
if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

echo $BASEDIR

extensionIdList=$DATADIR$GCEXTANA_EXTENSIONIDLIST
database=$DATADIR$GCEXTANA_DATABASE
crxDir=$DATADIR$GCEXTANA_CRXDIR
archive=$DATADIR$GCEXTANA_ARCHIVE

#if [[ ! -z $1 ]]; then
#    if [[ $1 = "test" ]]; then
#        #extensionIdList=$BASEDIR/../../tests/shellTests/exIdListWithMulVulLib/
#        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
#        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
#        database=$BASEDIR/../../tests/shellTests/test.db
#        archive=$BASEDIR/../../tests/shellTests/archive/
#    elif [[ $1 = "testNewVersion" ]]; then
#        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
#        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
#        database=$BASEDIR/../../tests/shellTests/test.db
#        cp $BASEDIR/../../tests/shellTests/crxTestData/testNewVersion.db $database
#        archive=$BASEDIR/../../tests/shellTests/archive/
#    else
#        source $1
#        exit
#    fi
#fi

mkdir -p ${archive}crx/
#tmpData=$DATADIR/../../data/tmpData
#mkdir -p $tmpData
#if [[ ! -z $1 ]]; then
#    if [[ $1 = "testNewVersion" ]]; then
#        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py NewVersionDownload $database --crxDir $crxDir --archiveDir $archive
#    else
#        $PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir $crxDir --archiveDir $archive
#    fi
#else
#    $PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir $crxDir --archiveDir $archive
#fi
#$PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir "../../data/5-2/crx/" --archiveDir "../../data/5-2/archive/" --checkNewVersion
$PYTHON $BASEDIR/../python/bin/ExtensionTool.py allPack $database --crxDir $crxDir --archiveDir $archive --checkNewVersion
