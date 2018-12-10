#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import AddExtensionId


def main():
    parser = argparse.ArgumentParser("Add permissions to database")
    parser.add_argument("database", help="The data to save permissions into")
    parser.add_argument("extensionCollection", help="The dir which contain extension source code")

    try:
        args = parser.parse_args()
        AddExtensionId.setPermissionAllPack(args.database, args.extensionCollection)
    except Exception as e:
        print e
        sys.exit()


if __name__ == "__main__":
    main()
