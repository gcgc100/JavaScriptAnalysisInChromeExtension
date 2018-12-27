#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")

dataDir=$BASEDIR/../../data/
database=${dataDir}data.db
extSrcDir=${dataDir}extSrc/
scriptDir=${dataDir}scripts/
crxDir=${dataDir}crxFiles/


if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        dataDir=$BASEDIR/../../tests/shellTests/
        if [[ ! -f "${dataDir}test.db" ]]; then
            cp ${dataDir}crxTestData/test.db ${dataDir}test.db
        fi
        #cp ${dataDir}crxTestData/test.db ${dataDir}test.db
        database=${dataDir}test.db
        if [[ ! -d  "${dataDir}extSrc/" ]]; then
            cp -R ${dataDir}extsrcTestData/extSrc/ ${dataDir}extSrc/
        fi
        #cp -R ${dataDir}extsrcTestData/extSrc/ ${dataDir}extSrc/
        extSrcDir=${dataDir}extSrc/
        scriptDir=${dataDir}scripts/
        if [[ ! -d  "${dataDir}crxFiles/" ]]; then
            cp -R ${dataDir}crxTestData/crxFiles/ ${dataDir}crxFiles/
        fi
        #cp -R ${dataDir}crxTestData/crxFiles/ ${dataDir}crxFiles/
        crxDir=${dataDir}crxFiles/
    else
        source $1
    fi
fi


echo Start
echo "time: $(date +%s)"
mkdir -p ${scriptDir}

bash $BASEDIR/fixExtensionSrcDirName.sh ${extSrcDir} || exit 1
echo "Analysing extension"
let "total=$(ls -lh $cate | wc -l)-1"
count=0
python $BASEDIR/../python/bin/AddPermission.py ${database} ${extSrcDir}
for extension in ${extSrcDir}*; do
        cat << EOF
Analysing $extension
EOF
        let "count=count+1"
        echo "$count/$total extensions done"
        # dynamic method
        python $BASEDIR/../python/bin/extractJSInc.py $extension -o ${database} --script ${scriptDir} --crxPath ${crxDir}$(basename $extension).crx
        if [[ $? -eq "2" ]]; then
            # if python code return 2, user want to stop unpacking and press ctrl-C
            break
        fi
        echo $(date +%s)
        # static method
        python $BASEDIR/../python/bin/extractJSInc.py $extension -o ${database} --script ${scriptDir} --crxPath ${crxDir}$(basename $extension).crx --static
        if [[ $? -eq "2" ]]; then
            # if python code return 2, user want to stop unpacking and press ctrl-C
            break
        fi
        echo $(date +%s)
done
echo $(date +%s)


#for cate in ${extSrcDir}*; do
#    echo "Analysing extension in $cate"
#    bash $BASEDIR/fixExtensionSrcDirName.sh ${cate}/ || exit 1
#    let "total=$(ls -lh $cate | wc -l)-1"
#    count=0
#    python $BASEDIR/../python/bin/AddPermission.py ${database} ${cate}
#    for extension in ${cate}/*; do
#        cat << EOF
#Analysing $extension
#EOF
#        let "count=count+1"
#        echo "$count/$total extensions done"
#        python $BASEDIR/../python/bin/extractJSInc.py $extension -o ${database} --script ${scriptDir} --crxPath ${crxDir}$(basename $cate)/$(basename $extension).crx
#        if [[ $? -eq "2" ]]; then
#            # if python code return 2, user want to stop unpacking and press ctrl-C
#            break
#        fi
#        echo $(date +%s)
#        python $BASEDIR/../python/bin/extractJSInc.py $extension -o ${database} --script ${scriptDir} --crxPath ${crxDir}$(basename $cate)/$(basename $extension).crx --static
#        if [[ $? -eq "2" ]]; then
#            # if python code return 2, user want to stop unpacking and press ctrl-C
#            break
#        fi
#        echo $(date +%s)
#    done
#done
#echo $(date +%s)
