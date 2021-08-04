#!/usr/bin/env python3
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
def allPack(script_folder, static, dynamic, tarnish, extAnalysis, srcBasePath, crxBasePath, db):
    """TODO: Docstring for allPack.

    :db_path: TODO
    :script_folder: TODO
    :returns: TODO

    """
    # __import__('pdb').set_trace()  # XXX BREAKPOINT
    eList = select(e for e in db.Extension if (e.extensionId, e.downloadTime) in ((e.extensionId, max(e.downloadTime)) for e in db.Extension if orm.raw_sql("e.extensionStatus=='{0}'".format(ExtensionStatus.Downloaded.name))))
    for e in eList:
        if not e.crxPath.startswith(crxBasePath):
            continue
        crxPath = e.crxPath
        if not os.path.exists(e.srcPath):
            logger.info("{0} extension src code not exists".format(e.srcPath))
            continue
        logger.info("Start to analyse extension{0}, dbId:{1}".format(e.extensionId, e.id))
        detect(db, e, script_folder, static, dynamic, tarnish, extAnalysis)
        logger.info("Extension{0} analysed".format(e.extensionId))

def detect(db, extension, script_folder, static=True, dynamic=True, tarnish=True, extAnalysis=True, proxyDetection=False):
    """TODO: Docstring for detect.

    :extension: TODO
    :script_folder: TODO
    :static: TODO
    :dynamic: TODO
    :tarnish: TODO
    :extAnalysis: TODO
    :proxy: TODO
    :returns: TODO

    """
    e = extension
    if static:
        Analyser.static_detect_javascript_in_html(e, script_folder, db)
        Analyser.detect_background_scripts(e, db)
        Analyser.detect_content_scripts(e, db)
        e.analysedStatus = e.analysedStatus | AnalysedStatus.Static.value
    if dynamic:
        Analyser.dynamic_detect_javascript_in_html(e, script_folder, db)
    if tarnish:
        Analyser.detect_with_tarnish(e, db)
    if extAnalysis:
        Analyser.detect_with_extAnalysis(e, db)
    if proxyDetection:
        Analyser.proxy_detect_javascript_in_html(e, script_folder)

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
    parser.add_argument("--tarnish",
            default=False,
            action='store_true',
            help="Analyse with tarnish. Tarnish is a website that can analyse an extension with certain id")
    parser.add_argument("--extAnalysis",
            default=False,
            action='store_true',
            help="Analyse with extAnalysis. ExtAnalysis is an open-source project that can be used to analyse extension")
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
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)

        if args.cmd == "allPack":
            allPack(args.script, args.static, args.dynamic, args.tarnish, args.extAnalysis, srcPath, crxPath, db)
        elif args.cmd == "oneExtension":
            with db_session:
                if not srcPath.endswith("/"):
                    srcPath= srcPath + "/"
                path = srcPath
                for i in range(2):
                    path = os.path.split(path)[0]
                extension_id = os.path.split(path)[1]
                assert re.match("[a-z]{32}", extension_id), "illegal extensionId"
                extension = db.Extension(srcPath=args.srcPath, extensionId=extension_id, crxPath=crxPath)
                script_folder = args.script
                detect(e, script_folder, args.static, args.dynamic, args.tarnish, args.extAnalysis, args.proxyDetection)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)

if __name__ == "__main__":
    main()
