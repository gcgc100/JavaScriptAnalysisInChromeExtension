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

import SetVersion

def main():
    parser = argparse.ArgumentParser("Use dynamic method to set version for JavaScript")
    # parser.add_argument("--jquery", action="store_true", 
    #         help="Set jquery version for files")
    parser.add_argument("database",
                        help="Get files from database, and save result to database")
    parser.add_argument("--libtype", choices=["jquery", "Modernizr", "Underscore", "Moment", "RequireJS", "Backbone", "Handlebars", "Mootools", "Knockout", "Mustache"],
            help="Choose the name of library to be detected")

    try:
        args = parser.parse_args()
        SetVersion.set_all_version(args.libtype, args.database)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        shutil.rmtree("jqueryServer")
        sys.exit(2)
    except Exception as e:
        if os.path.exists("jqueryServer"):
            shutil.rmtree("jqueryServer")
        print e
        sys.exit(1)

if __name__ == "__main__":
    main()
