#!/bin/bash

source src/shell/testConfig.sh

BASEDIR=$(dirname "$0")
echo $BASEDIR
if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

echo $DATADIR

rm -rf $DATADIR$GCEXTANA_DATABASE
rm -rf $DATADIR$GCEXTANA_CRXDIR
rm -rf $DATADIR$GCEXTANA_ARCHIVE
rm -rf $DATADIR$GCEXTANA_EXTSRC
rm -rf $DATADIR$GCEXTANA_SCRIPTDIR
