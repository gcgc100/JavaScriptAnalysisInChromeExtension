#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os

import argparse
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import analyser


def main():
    parser = argparse.ArgumentParser("Add permissions to database")
    parser.add_argument("--VulJqueryList", help="The file should contain vulnerable jquery version list. One version per line. Default:../nodejs/vulJqueryVersionList.txt", default="../nodejs/vulJqueryVersionList.txt")

    # try:
    args = parser.parse_args()
    a = analyser.Analyser(os.path.join(parent_dir, "../data/data.db"))
    with open(os.path.join(parent_dir, args.VulJqueryList)) as f:
        for v in f:
            a.tagVulnerableJquery(v[:-1])
    
    # except Exception as e:
    #     print e
    #     sys.exit()


if __name__ == "__main__":
    main()
