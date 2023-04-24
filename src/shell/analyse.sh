#!/bin/zsh

BASEDIR=$(dirname "$0")
if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

echo $BASEDIR

if [[ $GCEXTANA_DATABASE == "/"* ]]; then
    database=$GCEXTANA_DATABASE
else
    database=$DATADIR$GCEXTANA_DATABASE
fi

if [[ $GCEXTANA_EXTSRC == "/"* ]]; then
    extSrcDir=$GCEXTANA_EXTSRC
else
    extSrcDir=$DATADIR$GCEXTANA_EXTSRC
fi

if [[ $GCEXTANA_SCRIPTDIR == "/"* ]]; then
    scriptDir=$GCEXTANA_SCRIPTDIR
else
    scriptDir=$DATADIR$GCEXTANA_SCRIPTDIR
fi


echo "Start to analyse extensions"
$PYTHON $BASEDIR/../python/bin/Starter.py Analyse --db ${database} --scriptDir ${scriptDir}
