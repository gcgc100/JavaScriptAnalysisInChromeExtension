#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import inspect
import json
import shutil

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from gClifford import mylogging
logger = mylogging.logger

import analyser


def main():
    parser = argparse.ArgumentParser("Extract JavaScript Inclusion and save to sqlite database")
    parser.add_argument("extension", help="The extension to be analysed")
    parser.add_argument("-o", "--output", 
            default="sqliteDB.db",
            help="The sqlite database which is used to save data")
    parser.add_argument("-s", "--script", 
            default="../data/scripts",
            help="The folder used to save downloaded scripts. Dont move the script files. The file path is saved in sqlite database. If moved, they will not match.")
    parser.add_argument("--static",
            default=False,
            action='store_true',
            help="Static method only. Dyanmic method is more accurate but slower. By default:use both static and dynamic method")
    parser.add_argument("--crxPath",
            default="",
            help="The crx file path. Must be set when dynamic extract info")


    try:
        args = parser.parse_args()
        types_collected = ["ContentScript", "Background", "static"]
        if args.static:
            # analyser.Analyser(args.output).analyse_jsinc_in_html(args.extension, args.script, False)
            pass
        else:
            types_collected.append("dynamic")
        analyser.Analyser(args.output).analyse_extension(args.extension, args.script, types_collected,  args.crxPath)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        logger.error(e)
        sys.exit()

if __name__ == "__main__":
    main()
