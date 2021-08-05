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
    setDetailAndDownloadInDB(db, crxDir, checkNewVersion)
    # downloadInDB(db, crxDir)

@db_session
def setDetailAndDownloadInDB(db, crxDir, checkNewVersion=False):
    eList = select(extension for extension in db.Extension if orm.raw_sql("extension.extensionStatus!='{0}'".format(
            ExtensionStatus.UnPublished.name)))

    for extension in eList:
        eid = extension.extensionId
        with db_session:
            try:
                if extension.extensionStatus == ExtensionStatus.Init:
                    retCode = ExtensionUtils.setExtensionDetailForOne(extension)
                    crxDirTmp = os.path.join(crxDir, eid)
                    os.makedirs(crxDirTmp, exist_ok=True)
                    fileName = extension.version.replace(".", "-")
                    downloadExt(eid, name=fileName, save_path=crxDirTmp)
                    extension.crxPath = os.path.join(crxDirTmp, "{0}.crx".format(fileName))
                    extension.extensionStatus = ExtensionStatus.Downloaded
                elif extension.extensionStatus == ExtensionStatus.UnPublished:
                    pass
                elif extension.extensionStatus in [ExtensionStatus.Detailed, ExtensionStatus.Downloaded, ExtensionStatus.Unpacked, ExtensionStatus.PermissionSetted]:
                    if checkNewVersion:
                        newExt = db.Extension(extensionId = extension.extensionId)
                        newExt.analysedStatus = 0
                        newExt.extensionStatus = ExtensionStatus.Init
                        retCode = ExtensionUtils.setExtensionDetailForOne(newExt)
                        if newExt.version == extension.version:
                            __import__('pdb').set_trace()  # XXX BREAKPOINT
                            db.rollback()
                        else:
                            crxDirTmp = os.path.join(crxDir, eid)
                            os.makedirs(crxDirTmp, exist_ok=True)
                            fileName = newExt.version.replace(".", "-")
                            downloadExt(eid, name=fileName, save_path=crxDirTmp)
                            newExt.crxPath = os.path.join(crxDirTmp, "{0}.crx".format(fileName))
                            newExt.extensionStatus = ExtensionStatus.Downloaded
                            db.commit()
                else:
                    assert False, "Unknown extension status with solution"
            except Exception as e:
                logger.error(e)
                db.rollback()
                continue

def main():
    parser = argparse.ArgumentParser("Add extension id to sqlite database")
    parser.add_argument("cmd",
            choices = ["addExtensionId", "SetDetail", "addPermission", 
                "resetExtension", "allPack", "unpack", "NewVersionDownload"],
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
        extensionList = args.extensionIdList
        for d in os.listdir(extensionList):
            ExtensionUtils.init_database(os.path.join(extensionList, d), db)
        # ExtensionUtils.init_database(
        #         args.extensionIdList, db)
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
            
        allPack(db, args.crxDir, args.archiveDir)
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
        for eid in os.listdir(crxDir):
            for crx in os.listdir(os.path.join(crxDir, eid)):
                if crx.endswith(".crx"):
                    version = crx[:-4]
                    assert(len(eid)==32)
                    extSrcDir = os.path.join(extSrcRootDir, eid, version)
                    os.makedirs(extSrcDir, exist_ok=True)
                    ExtensionUtils.unpackExtAndFilldb(eid, os.path.join(crxDir, eid, crx),
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
        setDetailAndDownloadInDB(db, args.crxDir, True)


if __name__ == "__main__":
    main()
