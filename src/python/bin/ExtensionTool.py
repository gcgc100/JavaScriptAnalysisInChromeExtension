#!/usr/bin/env python
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
def allPack(dbpath, extensionList, crxDir, archiveDir):
    """All things together

    :dbpath: TODO
    :extensionList: TODO
    :crxDir: TODO
    :archiveDir: TODO
    :returns: TODO

    """
    os.makedirs(crxDir, exist_ok=True)
    os.makedirs(archiveDir, exist_ok=True)
    for d in os.listdir(extensionList):
        ExtensionUtils.init_database(os.path.join(extensionList, d))
    eList = select(extension for extension in Extension if extension.downloadStatus==0 and extension.updateTime is None)
    for extension in eList:
        eid = extension.extensionId
        try:
            retCode = ExtensionUtils.setExtensionDetailForOne(extension)
            if retCode == 1:
                try:
                    downloadExt(eid, save_path=crxDir)
                    extension.crxPath = os.path.join(crxDir, "{0}.crx".format(eid))
                except Exception as e:
                    logger.error(e)
                    raise e
            elif retCode == 0:
                logger.info("Get extension detail failed")
            elif retCode == 2:
                logger.info("Extension already the newest")
            elif retCode == 404:
                extension.downloadStatus = retCode
            else:
                logger.error("Unexpected return when set detail:%s" % retCode)
        except Exception as e:
            logger.error(e)
            extension.reset()
            if e.args[0] == 'http error':
                extension.downloadStatus = e.args[1]
            continue

@db_session
def downloadNewVersion(crxDir, archiveDir):
    """TODO: Docstring for downloadNewVersion.

    :arg1: TODO
    :returns: TODO

    """
    os.makedirs(crxDir, exist_ok=True)
    os.makedirs(archiveDir, exist_ok=True)
    eList = select(extension for extension in Extension)
    #TODO: Should select the extensions without repeat. Now there are no repeat in db now, so no need to filter.
    for e in eList:
        eid = e.extensionId
        extension = Extension(extensionId=eid, category=e.category, downloadStatus=0)
        try:
            retCode = ExtensionUtils.setExtensionDetailForOne(extension)
            if retCode == 1:
                try:
                    downloadExt(eid, save_path=crxDir)
                    extension.crxPath = os.path.join(crxDir, "{0}.crx".format(eid))
                except Exception as e:
                    logger.error(e)
                    raise e
            elif retCode == 0:
                logger.info("Get extension detail failed")
            elif retCode == 2:
                logger.info("Extension already the newest")
            elif retCode == 404:
                extension.downloadStatus = retCode
            else:
                logger.error("Unexpected return when set detail:%s" % retCode)
        except Exception as e:
            logger.error(e)
            extension.reset()
            #TODO: The extension row should be removed instead of reset here
            if e.args[0] == 'http error':
                extension.downloadStatus = e.args[1]
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
    # parser.add_argument("--extensionExcluded",
    #                     help="The extensions excluded")


    args = parser.parse_args()
    try:
        dbpath = os.path.abspath(args.db)
        db.bind(provider='sqlite', filename=dbpath, create_db=True)
        db.generate_mapping(create_tables=True)
    except BindingError as e:
        if e.args[0] != "Database object was already bound to SQLite provider":
            raise e
    if args.cmd == "addExtensionId":
        ExtensionUtils.init_database(
                args.extensionIdList)
    elif args.cmd == "setDetail":
        parametersToBeChecked = ["extensionId"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        exitCode = ExtensionUtils.setExtensionDetailForOne(args.db, args.extensionId)
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
        ExtensionUtils.setPermissionAllPack(args.extensionCollection)
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
            extension = Extension.get(extensionId=args.extensionId)
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
            
        allPack(args.db, args.extensionIdList, args.crxDir, args.archiveDir)
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
                        extSrcDir)
    elif args.cmd == "NewVersionDownload":
        parametersToBeChecked = ["crxDir", "archiveDir"]
        ret = True
        for p in parametersToBeChecked:
            if getattr(args, p) is None:
                print("{0} can not be empty\n".format(p))
                ret = False
        if not ret:
            sys.exit(1)
        downloadNewVersion(args.crxDir, args.archiveDir)


if __name__ == "__main__":
    main()
