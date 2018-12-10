#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import os
import inspect
import sys
import csv
from pprint import pprint

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

import statistic


def main():
    parser = argparse.ArgumentParser("Print the statistic result")
    parser.add_argument("cmd",
            choices=["summary", "sample", "latex"],
            help="summary: show summary data")
    parser.add_argument("--database",
                        help="slqite database")
    parser.add_argument("--latexData",
                        default="../data/latexData/data.csv",
                        help="latex data generated from R")

    categoryList=["accessibility", "blogging", "bygoogle", "communication", "fun", "news", "photos", "productivity", "searchTool", "shopping", "sports", "webDevelopment"]
    try:
        args = parser.parse_args()
        if args.cmd == "summary":
            statistic.summary()
            statistic.category_stat()
        elif args.cmd == "sample":
            statistic.SqliteStat(args.database).createSamepleTables()
        elif args.cmd == "latex":
            format_str = "\\newcommand{{\\{0}}}{{{1}}}"
            with open(args.latexData, 'rb') as csvfile:
                spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
                for row in list(spamreader)[1:]:
                    print format_str.format(row[1], row[2])
            s = statistic.Statistic()
            srcDb = statistic.SqliteStat(args.database)
            with open("../data/latexData/TopRemoteDomain.csv") as csvfile:
                data = csv.reader(csvfile, delimiter=',', quotechar='"')
                data = [{"name":x[1], "c":x[3]} for x in data]
                print(srcDb.latexTable(data, "Top Hosts in Remote JavaScript Inclusion", "top_hosts"))
            with open("../data/latexData/TopLibraryRemoteDomain.csv") as csvfile:
                data = csv.reader(csvfile, delimiter=',', quotechar='"')
                data = [{"name":x[1], "c":x[3]} for x in data]
                print(srcDb.latexTable(data, "Top Hosts in Remote JavaScript Library Inclusion", "top_hosts_library"))
            # print srcDb.latexCategoryTable
            # print srcDb.latexLanguageTable
            # print srcDb.JavaScriptNumberLatexTable

            # pprint(srcDb.IPSrcJS)
            # pprint(srcDb.extensionWithLocalhostJSInclusion)

            srcDb.cleanUp()
        else:
            print "unknow command"
    except Exception as e:
        print e
        sys.exit()

if __name__ == "__main__":
    main()
