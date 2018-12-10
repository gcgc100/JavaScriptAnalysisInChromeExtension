#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import inspect
import json

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import UnpackExtension


def main():
    parser = argparse.ArgumentParser(
            "Unpack a extension crx file into source code")
    parser.add_argument("crx", help="crx file path")
    parser.add_argument("--output",
            default="../output/",
            help="The output directory to save extension src code")

    try:
        args = parser.parse_args()
        UnpackExtension.unpack_extension(args.crx, args.output)
        # if args.crx is not None:
        #     UnpackExtension.unpack_extension(args.crx, "../data/extSrcFinal/")
        # else:
        #     args.pring_help()
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        print e
        sys.exit(1)

if __name__ == "__main__":
    main()
