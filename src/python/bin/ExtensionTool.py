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

import ExtensionUtils
from analyser import Analyser


def main():
    parser = argparse.ArgumentParser("Add extension id to sqlite database")
    parser.add_argument("cmd",
                        help="The command to be used")
    parser.add_argument("db", help="sqlite database")
    parser.add_argument("--extensionIdList",
                        help="Extension id list json file")
    parser.add_argument("--category",
                        help="The category of the extension")
    parser.add_argument("--extensionId",
                        help="Used when setDetail. The extension id to be set detail.")
    # parser.add_argument("--extensionExcluded",
    #                     help="The extensions excluded")


    try:
        args = parser.parse_args()
        if args.cmd == "addExtensionId":
            ExtensionUtils.init_database(args.db)
            ExtensionUtils.addExtensionId(args.db, 
                    args.extensionIdList, 
                    args.category)
        elif args.cmd == "setDetail":
            # ExtensionUtils.setExtensionDetail(args.db)
            exitCode = ExtensionUtils.setExtensionDetailForOne(args.db, args.extensionId)
            if exitCode == 1:
                exitCode = 0
            elif exitCode == 0:
                exitCode = 1
            sys.exit(exitCode)
        elif args.cmd == "addPermission":
            pass
        elif args.cmd == "resetExtension":
            ExtensionUtils.resetInfoForExtension(args.db, args.extensionId)
    except Exception as e:
        print e
        sys.exit(1)


if __name__ == "__main__":
    main()
    
