#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import inspect
import json
import time
import threading

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import ExtensionUtils
import utils
from OrmDatabase import *
from ExtensionUtils import downloadExt
from ExtensionUtils import downloadExtList

def setUnpublished(extension):
    """

    :extension: TODO
    :returns: TODO

    """
    pass

def main():
    parser = argparse.ArgumentParser("")
    parser.add_argument("--db",
            default="../../data/dataV1-1Test.db",
            help="")

    try:
        args = parser.parse_args()
        dbpath = os.path.abspath(args.db)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
        ExtensionUtils.setUnpublished(db)
    except Exception as e:
        print(e)
        sys.exit()
    

if __name__ == "__main__":
    main()
