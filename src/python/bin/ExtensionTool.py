#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import inspect
import json
import time
import threading

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import ExtensionUtils
import utils
from OrmDatabase import *
from ExtensionUtils import downloadExt
from ExtensionUtils import downloadExtList

import mylogging
logger = mylogging.logger

gc_timeout = False

@db_session
def allPack(db, crxDir, archiveDir, checkNewVersion=False):
    """All things together

    :dbpath: TODO
    :extensionList: TODO
    :crxDir: TODO
    :archiveDir: Unused, maybe for backup in the future
    :returns: TODO

    """
    os.makedirs(crxDir, exist_ok=True)
    os.makedirs(archiveDir, exist_ok=True)

    # The setDetail and download must be done together in case the downloaded extension miss match the extension detail
    if checkNewVersion:
        ExtensionUtils.setDetailAndDownloadInDB(db, crxDir, checkNewVersion, True)
    else:
        ExtensionUtils.setDetailAndDownloadInDB(db, crxDir, checkNewVersion)
    # downloadInDB(db, crxDir)

def main():
    parser = argparse.ArgumentParser("")
    parser.add_argument("cmd",
            choices = ["addExtensionId", "SetDetail", "addPermission", 
                "resetExtension", "allPack", "unpackAllInDB", "unpack",
                "NewVersionDownload", "setHash"],
            help="The command to be used")
    parser.add_argument("db", help="sqlite database")
    parser.add_argument("--extensionIdList",
                        help="Extension id list json file")
    parser.add_argument("--category",
                        help="The category of the extension")
    parser.add_argument("--extensionId",
                        help="Used when setDetail. The extension id to be set detail.")
    parser.add_argument("--crxDir",
                        help="The directory to save crx files")
    parser.add_argument("--extensionCollection",
                        help="The directory which contains all source code of extensions")
    parser.add_argument("--archiveDir",
                        help="The directory to save the archived zip file")
    parser.add_argument("--extSrcDir",
                        help="The directory to save the archived zip file")
    parser.add_argument("--checkNewVersion",
            default=False,
            action="store_true",
            help="Need to check all extension for new version?")


    args = parser.parse_args()
    try:
        dbpath = os.path.abspath(args.db)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
    except dbapiprovider.OperationalError as e:
        logger.info(e)
        logger.info("Database {0} not available.".format(dbpath))
        exit(1)

    except BindingError as e:
        if e.args[0] != "Database object was already bound to SQLite provider":
            raise e
    if args.cmd == "addExtensionId":
        extensionList = args.extensionIdList
        for d in os.listdir(extensionList):
            ExtensionUtils.init_database(db, os.path.join(extensionList, d))
    elif args.cmd == "setDetail":
        parametersToBeChecked = ["extensionId"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        exitCode = ExtensionUtils.setExtensionDetailForOne(db.Extension.get(extensionId=args.extensionId)[0])
        if exitCode == 1:
            exitCode = 0
        elif exitCode == 0:
            exitCode = 1
        sys.exit(exitCode)
    elif args.cmd == "addPermission":
        parametersToBeChecked = []
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        logger.info("Set permission in sqlite databse for extensions")
        ExtensionUtils.setPermissionAllPack(db)
        logger.info("Permissions are all set in sqlite databse")
    elif args.cmd == "resetExtension":
        parametersToBeChecked = ["extensionId"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        with db_session:
            extension = db.Extension.get(extensionId=args.extensionId)
        extension.reset()
    elif args.cmd == "allPack":
        parametersToBeChecked = ["crxDir", "archiveDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
            
        allPack(db, args.crxDir, args.archiveDir, args.checkNewVersion)
    elif args.cmd == "unpackAllInDB":
        parametersToBeChecked = ["extSrcDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        with db_session:
            exts = select(e for e in db.Extension if 
                    orm.raw_sql("e.extensionStatus=='{0}'".format(ExtensionStatus.Downloaded.name)))
            extSrcRootDir = args.extSrcDir
            for e in exts:
                crxDir = e.crxPath
                extSrcPath = e.standardExtSrcPath(extSrcRootDir)
                os.makedirs(extSrcPath, exist_ok=True)
                try:
                    logger.info("Start to unpack {0}".format(e.crxPath))
                    ExtensionUtils.unpackExtension(e.crxPath, extSrcPath)
                except FileNotFoundError as err:
                    with open("UnpackCrxError.log", 'a') as f:
                        f.write(e.extensionId)
                        f.write("\n")
                    logger.error("{0}({1}) extension unpack error:{2}".format(e.extensionId, e.id, err))
                    os.rmdir(extSrcPath)  # Remove version folder
                    ppath = os.path.dirname(extSrcPath)
                    if len(os.listdir(ppath)) == 0:
                        # Check whether the extension src dir is empty, if so remove it
                        os.rmdir(ppath)
                    continue
                e.extensionStatus = ExtensionStatus.Unpacked
                e.srcPath = extSrcPath
                db.commit()
    elif args.cmd == "unpack":
        parametersToBeChecked = ["crxDir", "extSrcDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        ExtensionUtils.unpackExtension(args.crxDir, args.extSrcDir)
    elif args.cmd == "NewVersionDownload":
        parametersToBeChecked = ["crxDir", "archiveDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        setDetailAndDownloadInDB(db, args.crxDir, True)
    elif args.cmd == "setHash":
        orm.sql_debug(True)
        with db_session:
            # jsList = select(js for js in db.JavaScriptInclusion if js.extension.downloadTime > datetime.datetime.strptime("2021-1-1", "%Y-%m-%d"))
            jsList = select(js for js in db.JavaScriptInclusion )
            for js in jsList:
                try:
                    if js.hash == "":
                        js.hash = js.setHash(prefixPath="/Users/guanchong/MyDocuments/workspace/extensionSecurity/ChromeExtensionJSInc/JavaScriptAnalysisInChromeExtension/")
                except Exception as e:
                    logger.error(e)
                    continue



if __name__ == "__main__":
    main()
