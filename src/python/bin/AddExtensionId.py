#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import sys
import argparse
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import AddExtensionId
from analyser import Analyser


def main():
    parser = argparse.ArgumentParser("Add extension id to sqlite database")
    parser.add_argument("db", help="sqlite database")
    parser.add_argument("extensionIdList",
                        help="Extension id list json file")
    parser.add_argument("category",
                        help="The category of the extension")
    parser.add_argument("--extensionExcluded",
                        help="The extensions excluded")


    try:
        args = parser.parse_args()
        AddExtensionId.init_database(args.db)
        AddExtensionId.addExtensionId(args.db, 
                args.extensionIdList, 
                args.category,
                args.extensionExcluded)
        AddExtensionId.setExtensionDetail(args.db)
    except Exception as e:
        print e
        sys.exit()


if __name__ == "__main__":
    main()
    
