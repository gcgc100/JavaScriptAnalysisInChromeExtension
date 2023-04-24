#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
import argparse

def merge(fileList, output):
    """Merge fileList to output

    :fileList: TODO
    :output: TODO
    :returns: TODO

    """
    ret = []
    for f in fileList:
        if not f.endswith(".json"):
            continue
        with open(f) as f:
            eIdList = json.load(f)
        ret.extend(eIdList)
    ret = list(set(ret))
    with open(output, "w") as f:
        json.dump(ret, f, indent=4)

def main():
    parser = argparse.ArgumentParser("Handle the extension id list files")
    parser.add_argument("cmd", help="CMD type.",
            choices = ["merge"])
    parser.add_argument("--dir", help="merge multiple json id list files to one")

    try:
        args = parser.parse_args()
        if args.cmd == "merge":
            root = args.dir
            flist = [os.path.join(root, d) for d in os.listdir(root)]
            merge(flist, "idList.json")
    except Exception as e:
        print(e)
        sys.exit()
    
if __name__ == "__main__":
    main()
