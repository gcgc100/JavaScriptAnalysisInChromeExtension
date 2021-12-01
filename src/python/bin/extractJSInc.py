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
from StaticAnalyser import StaticAnalyser
from DynamicAnalyser import DynamicAnalyser
from TarnishAnalyser import TarnishAnalyser
from ExtAnaAnalyser import ExtAnaAnalyser


def selectExtension(db):
    """Select the extensions which need to be handle

    :db: TODO
    :returns: TODO

    """
    eList = []
    # basetime = datetime.datetime.strptime("2021-11-20", "%Y-%m-%d")
    # exts = select((e.extensionId, max(e.downloadTime)) for e in db.Extension if e.analysedStatus == 129 and e.downloadTime > basetime)
    exts = select((e.extensionId, max(e.downloadTime)) for e in db.Extension)
    for e in exts:
        extensions = select(ex for ex in db.Extension if ex.extensionId==e[0])
        extension = list(filter(lambda x: x.downloadTime==e[1], extensions))[0]
        if extension.extensionStatus == ExtensionStatus.UnPublished:
            continue
        if extension.extensionStatus == ExtensionStatus.ExtensionChecked:
            continue
        if extension.extensionStatus == ExtensionStatus.Downloaded:
            continue
        yield extension
# DB session will be ended when line86-92 is executed. 
# Reason: Lazy load in selectExtension function caused.
# Not sure whether the bug is solved. Need more tetsts.
@db_session
def allPack(db, script_folder, static, dynamic, tarnish, extAnalysis, srcBasePath):
    """TODO: Docstring for allPack.

    :db_path: TODO
    :script_folder: TODO
    :returns: TODO

    """
    # eList = select(e for e in db.Extension if (e.extensionId, e.downloadTime) in ((e.extensionId, max(e.downloadTime)) for e in db.Extension))
    with db_session:
        eList = selectExtension(db)
    for e in eList:
        with db_session:
            if e.extensionStatus in [ExtensionStatus.Init, ExtensionStatus.UnPublished, ExtensionStatus.Detailed, ExtensionStatus.Downloaded, ExtensionStatus.LibSet, ExtensionStatus.Unpacked]:
                continue
            if e.extensionStatus in [ExtensionStatus.PermissionSetted]:
                try:
                    logger.info("Extension\n({0}, status:{1})\n to be analysed".format(e.extensionId,
                        e.extensionStatus.name))
                    if e.analysedStatus & AnalysedStatus.Error.value != 0:
                        logger.warning("Extension ({0}) contains error not solved".format(e.extensionId))
                        continue
                    crxPath = e.crxPath
                    if not os.path.exists(e.srcPath):
                        logger.error("{0} extension src code not exists".format(e.srcPath))
                        continue
                    detect(db, e, script_folder, static, dynamic, tarnish, extAnalysis)
                    logger.info("Extension:{0} analysed".format(e.extensionId))
                except KeyboardInterrupt as e:
                    raise e
                except Exception as err:
                    logger.error("{0},{1}".format(e.extensionId, err))
                    dbid = e.id
                    db.rollback()
                    e = db.Extension.get(id=dbid)
                    e.analysedStatus = e.analysedStatus | AnalysedStatus.Error.value
                    db.commit()

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
    if extension.analysedStatus & AnalysedStatus.Error.value != 0:
        logger.warning("Extension ({0}) contains error not solved".format(extension.extensionId))
        return
    #Commit every time in case error occured during some kind of detection, then the result of other detection is abandoned. The analysedStatus Error set also may be mismatch.
    if static:
        if extension.analysedStatus & AnalysedStatus.Static.value == 0:
            StaticAnalyser(db).detect(extension, script_folder)
            db.commit()
    if dynamic:
        if extension.analysedStatus & AnalysedStatus.Dynamic.value == 0:
            DynamicAnalyser(db).detect(extension, script_folder)
            db.commit()
    if tarnish:
        if extension.analysedStatus & AnalysedStatus.Tarnish.value == 0:
            TarnishAnalyser(db).detect(extension, False)
            db.commit()
            # Analyser.detect_with_tarnish(db, e)
    if extAnalysis:
        if extension.analysedStatus & AnalysedStatus.ExtAnalysis.value == 0:
            ExtAnaAnalyser(db).detect(extension)
            db.commit()
            # Analyser.detect_with_extAnalysis(db, e)
    if proxyDetection:
        Analyser.proxy_detect_javascript_in_html(extension, script_folder)

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
            allPack(db, args.script, args.static, args.dynamic, 
                    args.tarnish, args.extAnalysis, srcPath)
        elif args.cmd == "oneExtension":
            with db_session:
                if not srcPath.endswith("/"):
                    srcPath= srcPath + "/"
                path = srcPath
                for i in range(2):
                    path = os.path.split(path)[0]
                extension_id = os.path.split(path)[1]
                assert re.match("[a-z]{32}", extension_id), "illegal extensionId"
                extension = db.Extension(srcPath=args.srcPath, 
                        extensionId=extension_id, 
                        crxPath=crxPath, 
                        extensionStatus=ExtensionStatus.PermissionSetted,
                        analysedStatus=0)
                script_folder = args.script
                detect(db, extension, script_folder, args.static, args.dynamic, args.tarnish, args.extAnalysis, args.proxyDetection)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)

if __name__ == "__main__":
    main()
