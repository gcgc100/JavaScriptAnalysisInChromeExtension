#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import MysqlManager


def main():
    parser = argparse.ArgumentParser("""
    Return next extension id for download.
    """)
    parser.add_argument("--crxPath",
            help="Get next id")

    try:
        args = parser.parse_args()
        if args.crxPath is not None:
            m = MysqlManager.Manager()
            ex_id = m.get_next_id();
            print ex_id
            if ex_id is None:
                sys.exit(1)
            m.set_crx_path(args.crxPath, ex_id)
        else:
            parser.print_help()
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        print e
        sys.exit(1)
    
if __name__ == "__main__":
    main()
