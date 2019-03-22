#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import os
import inspect
import sys

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import statistic

def main():
    parser = argparse.ArgumentParser("Fit database so that it can be merged derectly")
    parser.add_argument("db1", help="Database to be merged into")
    parser.add_argument("db2", help="Database to be merged")

    try:
        args = parser.parse_args()
        statistic.init_sum_database(args.db1)
        statistic.fit_new_sqlite_db(args.db1, args.db2)
    except Exception as e:
        print e
        sys.exit()
        
if __name__ == "__main__":
    main()
