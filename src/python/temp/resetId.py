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
    Reset row with id in mysql to undownload status
    """)
    parser.add_argument("--eid",
            help="Reset crxPath to NULL for ex_id")

    try:
        args = parser.parse_args()
        if args.eid is not None:
            MysqlManager.Manager().reset_crx_path(args.eid)
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
