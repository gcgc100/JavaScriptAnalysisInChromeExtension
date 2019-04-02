#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import inspect
import json
import re
import shutil

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import UnpackExtension
import utils

from OrmDatabase import *

import mylogging
logger = mylogging.logger


def main():
    parser = argparse.ArgumentParser(
            "Unpack a extension crx file into source code")
    parser.add_argument("cmd",
                        help="The command to be used")
    parser.add_argument("--crx", help="crx file path")
    parser.add_argument("--db", help="Database path")
    parser.add_argument("--output",
            default="../output/",
            help="The output directory to save extension src code")

    try:
        args = parser.parse_args()
        try:
            dbpath = os.path.abspath(args.db)
            db.bind(provider='sqlite', filename=dbpath, create_db=True)
            db.generate_mapping(create_tables=True)
        except BindingError as e:
            if e.args[0] != "Database object was already bound to SQLite provider":
                raise e
        if args.cmd == "allPack":
            # allPack(args.crx, args.output)
            outputDir = args.output
            os.makedirs(outputDir, exist_ok=True)
            with db_session:
                for e in Extension.select():
                # for d in os.listdir(crxDir):
                    logger.info("Unpacking extension: {0}".format(e.extensionId))

                    #remove all the userProfiles in tmp
                    userProfiles = filter(lambda x: x.startswith(".org.chromium.Chromium"), os.listdir("/tmp/"))
                    for up in userProfiles:
                        shutil.rmtree(os.path.join("/tmp", up))
                    # if d.endswith(".tmp"):
                    #     logger.warning("Found tmp file in crxDir, skip it")
                    #     continue
                    eid = e.extensionId
                    assert re.match("[a-z]{32}", eid)
                    if os.path.isdir(os.path.join(outputDir, eid)):
                        logger.info("Source for extension({0}) exists, skip".format(eid))
                        continue
                    try:
                        srcPathTmp = UnpackExtension.unpack_extension(e.crxPath, outputDir)
                        #Clear userprofile 
                        userProfiles = filter(lambda x: x.startswith(".org.chromium.Chromium"), os.listdir("/tmp/"))
                        for up in userProfiles:
                            shutil.rmtree(os.path("/tmp", up))
                        srcPath = os.path.join(outputDir, e.extensionId)
                        os.rename(srcPathTmp, srcPath)
                        subDirs = os.listdir(srcPath)
                        if "manifest.json" not in subDirs:
                            if len(subDirs) == 1:
                                srcPath = os.path.join(srcPath, subDirs[0])
                                subDirs = os.listdir(srcPath)
                                if "manifest.json" not in subDirs:
                                    logger.error("Source code illegal. No manifest found in source code.")
                                    srcPath = None
                            else:
                                logger.error(
                                    "Multi versions of source code found")
                                srcPath = None
                        e.srcPath = srcPath
                    except KeyboardInterrupt as e:
                        # Not an error, user wants to stop unpacking.
                        sys.exit(2)
                    except Exception as e:
                        raise e
                        print(e)
                        with open("UnpackCrxError.log", 'a') as f:
                            f.write("\n{0}\n".format(eid));
                        continue
        elif args.cmd == "unpackOne":
            UnpackExtension.unpack_extension(args.crx, args.output)
        # if args.crx is not None:
        #     UnpackExtension.unpack_extension(args.crx, "../data/extSrcFinal/")
        # else:
        #     args.pring_help()
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)

if __name__ == "__main__":
    main()
