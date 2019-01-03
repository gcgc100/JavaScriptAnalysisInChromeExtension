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

from gClifford import mylogging
logger = mylogging.logger

def allPack(crxDir, outputDir):
    """Unpack all the crx files in crxDir
    """
    utils.makedirsWithoutError(outputDir)
    for d in os.listdir(crxDir):
        logger.info("Unpacking extension: {0}".format(d))
        userProfiles = filter(lambda x: x.startswith(".org.chromium.Chromium"), os.listdir("/tmp/"))
        for up in userProfiles:
            shutil.rmtree(os.path.join("/tmp", up))
        # if d.endswith(".tmp"):
        #     logger.warning("Found tmp file in crxDir, skip it")
        #     continue
        if not d.endswith(".crx"):
            logger.warning("{0} is not a crx file, skip it".format(d))
        eid = d.replace(".crx", "")
        assert re.match("[a-z]{32}", eid)
        if os.path.isdir(os.path.join(outputDir, eid)):
            continue
        try:
            UnpackExtension.unpack_extension(os.path.join(crxDir, d), outputDir)
            userProfiles = filter(lambda x: x.startswith(".org.chromium.Chromium"), os.listdir("/tmp/"))
            for up in userProfiles:
                shutil.rmtree(os.path("/tmp", up))
        except KeyboardInterrupt as e:
            # Not an error, user wants to stop unpacking.
            sys.exit(2)
        except Exception as e:
            print e
            with open("UnpackCrxError.log", 'a') as f:
                f.write("\n{0}\n".format(eid));
            continue
        


def main():
    parser = argparse.ArgumentParser(
            "Unpack a extension crx file into source code")
    parser.add_argument("cmd",
                        help="The command to be used")
    parser.add_argument("--crx", help="crx file path")
    parser.add_argument("--output",
            default="../output/",
            help="The output directory to save extension src code")

    try:
        args = parser.parse_args()
        if args.cmd == "allPack":
            allPack(args.crx, args.output)
        elif args.cmd == "unpackOne":
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
