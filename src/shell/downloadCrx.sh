#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")

downloadCrx() {
    if [[ ! -n $1 || ! -n $2 || ! -n $3 || ! -n $4 ]]; then
        cat << EOF
    Download extension crx file from http://chrome-extension-downloader.com and save to ../../data/crxFiles

    Must provide two papameters,\nThe first one is ,\nThe second is 
    $$1: json file with id list array
    $$2: the category of the extension
    $$3: output dir where the crx files is saved to
    $$4: the sqlite database. All the ids will be saved into database
EOF
        #echo -e "Must provide two papameters,\nThe first one is json file with id list array,\nThe second is the category of the extension"
        exit 1
    fi
    outputDir=$3
    dbDir=$4
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    python $BASEDIR/../python/bin/ExtensionTool.py addExtensionId $dbDir --extensionIdList $1 --category $2

    TMPFILE="$(mktemp -t --suffix=.SUFFIX downloadCrx_sh.XXXXXX)"
    trap "rm -f '$TMPFILE'" 0               # EXIT
    #trap "rm -f '$TMPFILE'; exit 1" 2       # INT
    trap "rm -f '$TMPFILE'; exit 1" 1 15    # HUP TERM

    roll_back() {
        rm -f '$TMPFILE'
        rm -f $ex_id.crx
        python $BASEDIR/../python/bin/ExtensionTool.py resetExtension $dbDir --extensionId $ex_id
        exit 1
    }
    trap roll_back 2

    mkdir -p ${outputDir}$2
    ex_id=$(cat "$1" | python -c "import json, sys; print json.load(sys.stdin)[0]") || exit 1
    while [[ ! -z $ex_id ]]; do
        echo $ex_id
        python $BASEDIR/../python/bin/ExtensionTool.py setDetail $dbDir --extensionId $ex_id
        ret=$?
        if [ $ret == 0 ]; then
            wget --output-document=$ex_id.crx "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&x=id%3D"$ex_id"%26installsource%3Dondemand%26uc"
            if [ $? != 0 ]; then
                echo "Download $ex_id failed"
                echo $ex_id >> $2DownloadError
                rm -f $ex_id.crx
            else
                mv $ex_id.crx ${outputDir}$2
            fi
        elif [ $ret == 1 ]; then
            echo "Get extension detail failed"
        else
            echo "Extension already the newest"
        fi

        cat "$1" | python -c "import json, sys; data=json.load(sys.stdin); s=json.dumps(data[1:]) if len(data)>0 else \"[]\"; print s;" | tee $TMPFILE 1>/dev/null
        mv -f $TMPFILE "$1"
        ex_id=$(cat "$1" | python -c "import json, sys; data=json.load(sys.stdin); ex_id=data[0] if len(data)>0 else ''; print ex_id;") || exit 1
    done
    mkdir -p ${outputDir}ErrorCrx/
    if [[ -f $2DownloadError ]]; then
        mv $2DownloadError ${outputDir}ErrorCrx/
    fi
    trap "rm -f '$TMPFILE'; exit 1" 2       # INT
    zip -r ${outputDir}$2.zip ${outputDir}$2
}

extensionIdList=$BASEDIR/../../data/cacheData/
crxDir=$BASEDIR/../../data/crxFiles/
database=$BASEDIR/../../data/data.db
archive=$BASEDIR/../../data/archive/

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        extensionIdList=$BASEDIR/../../tests/shellTests/cacheData/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        archive=$BASEDIR/../../tests/shellTests/archive/
    else
        source $1
    fi
fi

mkdir -p ${archive}crx/

for i in ${extensionIdList}*; do
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    category=`basename $i`
    category=${category//.json/}
    downloadCrx $i ${category} $crxDir $database
    mv ${crxDir}*.zip ${archive}crx/
    rm -f $i
done
