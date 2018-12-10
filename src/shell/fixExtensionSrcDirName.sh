#!/bin/bash

# change all the sub dir name from "extension_([a-z]{32})" to "\1/0_0_0"
# e.g.:
# "extension_aabcgdmkeabbnleenpncegpcngjpnjkc" to 
# "aabcgdmkeabbnleenpncegpcngjpnjkc/0_0_0".
# Since python program need dir structure like extension_id/version/src_code

if [[ $1 != *"/" ]]; then
    echo "arg1 must be a dir and endwith /"
    exit 1
fi

fail_counter=0
succ_counter=0

for subdir in $1*; do
    subdir=$(basename $subdir)
    if [[ $subdir =~ extension_[a-z]{32} ]]; then
        new_dir=$(echo $subdir | sed -e "s/extension_//g")
        mkdir -p $1$new_dir
        mv $1$subdir $1$new_dir/0_0_0
        ((succ_counter=succ_counter+1))
    else
        ((fail_counter=fail_counter+1))
    fi
done

echo "$succ_counter files rename successful"
echo "skip $fail_counter files"
