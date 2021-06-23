#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import inspect
import json
import shutil
import hashlib
import re
import datetime

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import mylogging
logger = mylogging.logger

import Analyser
from OrmDatabase import *

@db_session
def allPack(script_folder, static, dynamic, srcBasePath, crxBasePath):
    """TODO: Docstring for allPack.

    :db_path: TODO
    :script_folder: TODO
    :returns: TODO

    """
    # __import__('pdb').set_trace()  # XXX BREAKPOINT
    # eList = db.select("select * from extensionTable where downloadStatus = 1")
    eList = select(e for e in Extension if e.downloadStatus==1)
    for e in eList:
        if not e.crxPath.startswith(crxBasePath):
            continue
        crxPath = e.crxPath
        # crxPath = os.path.join(crxBasePath, 
        #         "{0}.crx".format(e.extensionId))
        if not os.path.exists(e.srcPath):
            logger.info("{0} extension src code not exists".format(e.srcPath))
            continue
        # ds = ["downloadStatus", "userNum"]
        # for d in ds:
        #     # if e.has_key(d):
        #     if d in e:
        #         e.pop(d)
        logger.info("Start to analyse extension{0}, dbId:{1}".format(e.extensionId, e.id))
        Analyser.detect_background_scripts(e)
        Analyser.detect_content_scripts(e)
        if static:
            Analyser.static_detect_javascript_in_html(e, script_folder)
        if dynamic:
            Analyser.dynamic_detect_javascript_in_html(e, script_folder)
        logger.info("Extension{0} analysed".format(e.extensionId))

def main():
    parser = argparse.ArgumentParser("Extract JavaScript Inclusion and save to sqlite database")
    parser.add_argument("cmd",
                        help="")
    parser.add_argument("db",
            help="The sqlite database which is used to save data")
    parser.add_argument("--srcPath", help="The extension to be analysed")
    parser.add_argument("script",
            help="The folder used to save downloaded scripts. Dont move the script files. The file path is saved in sqlite database. If moved, they will not match.")
    parser.add_argument("--static",
            default=False,
            action='store_true',
            help="Detect the JavaScript inclusions with static method. Dyanmic method is more accurate but slower.")
    parser.add_argument("--dynamic",
            default=False,
            action='store_true',
            help="Static method. Dyanmic method is more accurate but slower. By default:use both static and dynamic method")
    parser.add_argument("--proxyDetection",
            default=False,
            action='store_true',
            help="Detect the JavaScript incusions with proxy method")
    parser.add_argument("--crxPath",
            default="",
            help="The crx file path. Must be set when dynamic extract info")


    try:
        args = parser.parse_args()
        srcPath = args.srcPath
        crxPath = args.crxPath

        dbpath = os.path.abspath(args.db)
        db.bind(provider='sqlite', filename=dbpath, create_db=True)
        db.generate_mapping(create_tables=True)

        if args.cmd == "allPack":
            allPack(args.script, args.static, args.dynamic, srcPath, crxPath)
        elif args.cmd == "oneExtension":
            with db_session:
                if not srcPath.endswith("/"):
                    srcPath= srcPath + "/"
                path = srcPath
                for i in range(2):
                    path = os.path.split(path)[0]
                extension_id = os.path.split(path)[1]
                assert re.match("[a-z]{32}", extension_id), "illegal extensionId"
                extension = Extension(srcPath=args.srcPath, extensionId=extension_id, crxPath=crxPath)
                Analyser.detect_background_scripts(extension)
                Analyser.detect_content_scripts(extension)
                if args.static:
                    Analyser.static_detect_javascript_in_html(extension, args.script)
                if args.dynamic:
                    Analyser.dynamic_detect_javascript_in_html(extension, args.script)
                if args.proxyDetection:
                    Analyser.proxy_detect_javascript_in_html(extension, args.script)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)

if __name__ == "__main__":
    main()
