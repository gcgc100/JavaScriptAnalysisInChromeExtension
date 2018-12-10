#!/bin/bash

for i in $(seq 10); do
    echo $i
    python ptest.py
    [[ $? -eq "2" ]] | break
    #if [[ $? -eq "2" ]]; then
    #    break
    #fi
done
