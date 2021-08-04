#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import sys
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
def allPack(db, extensionList, crxDir, archiveDir, checkNewVersion=False):
    """All things together

    :dbpath: TODO
    :extensionList: TODO
    :crxDir: TODO
    :archiveDir: Unused, maybe for backup in the future
    :returns: TODO

    """
    os.makedirs(crxDir, exist_ok=True)
    os.makedirs(archiveDir, exist_ok=True)
    for d in os.listdir(extensionList):
        ExtensionUtils.init_database(os.path.join(extensionList, d), db)

            # select(e for e in self.db.Extension if orm.raw_sql('e.extensionStatus=="Init"'))
    # The setDetail and download must be done together in case the downloaded extension miss match the extension detail
    setDetailAndDownloadInDB(db, checkNewVersion)
    # downloadInDB(db, crxDir)

@db_session
def setDetailAndDownloadInDB(db, checkNewVersion=False):
    if checkNewVersion:
        eList = select(extension for extension in db.Extension if orm.raw_sql("extension.extensionStatus!='{0}'".format(
            ExtensionStatus.UnPublished.name)))
    else:
        eList = select(extension for extension in db.Extension if orm.raw_sql("extension.extensionStatus=='{0}'".format(ExtensionStatus.Init.name)) and extension.updateTime is None)

    for extension in eList:
        eid = extension.extensionId
        with db_session:
            try:
                if extension.extensionStatus == ExtensionStatus.Init:
                    retCode = ExtensionUtils.setExtensionDetailForOne(extension)
                    downloadExt(eid, save_path=crxDir)
                    extension.crxPath = os.path.join(crxDir, "{0}.crx".format(eid))
                    extension.extensionStatus = ExtensionStatus.Downloaded
                elif extension.extensionStatus == ExtensionStatus.UnPublished:
                    pass
                elif extension.extensionStatus in [ExtensionStatus.Detailed, ExtensionStatus.Downloaded]:
                    newExt = db.Extension(extension)
                    newExt.analysedStatus = 0
                    newExt.extensionStatus = ExtensionStatus.Init
                    retCode = ExtensionUtils.setExtensionDetailForOne(newExt)
                    if newExt.updateTime == extension.updateTime:
                        db.rollback()
                    else:
                        downloadExt(eid, save_path=crxDir)
                        newExt.crxPath = os.path.join(crxDir, "{0}.crx".format(eid))
                        newExt.extensionStatus = ExtensionStatus.Downloaded
                else:
                    assert False, "Unknown extension status with solution"
            except Exception as e:
                logger.error(e)
                db.rollback()
                continue

def main():
    parser = argparse.ArgumentParser("Add extension id to sqlite database")
    parser.add_argument("cmd",
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


    args = parser.parse_args()
    try:
        dbpath = os.path.abspath(args.db)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
    except BindingError as e:
        if e.args[0] != "Database object was already bound to SQLite provider":
            raise e
    if args.cmd == "addExtensionId":
        ExtensionUtils.init_database(
                args.extensionIdList, db)
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
        parametersToBeChecked = ["extensionCollection"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        logger.info("Set permission in sqlite databse for extensions")
        ExtensionUtils.setPermissionAllPack(args.extensionCollection, db)
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
        parametersToBeChecked = ["extensionIdList", "crxDir", "archiveDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
            
        allPack(db, args.extensionIdList, args.crxDir, args.archiveDir)
    elif args.cmd == "unpack":
        parametersToBeChecked = ["crxDir", "extSrcDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        crxDir = args.crxDir
        extSrcRootDir = args.extSrcDir
        for crx in os.listdir(crxDir):
            if crx.endswith(".crx"):
                eid = crx[:-4]
                assert(len(eid)==32)
                extSrcDir = os.path.join(extSrcRootDir, eid)
                os.makedirs(extSrcDir, exist_ok=True)
                ExtensionUtils.unpackExtAndFilldb(eid, os.path.join(crxDir, crx),
                        extSrcDir, db)
    elif args.cmd == "NewVersionDownload":
        parametersToBeChecked = ["crxDir", "archiveDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        setDetailInDB(db, True)


if __name__ == "__main__":
    main()
