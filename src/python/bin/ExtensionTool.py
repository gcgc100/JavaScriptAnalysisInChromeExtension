#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import sys
import argparse
import inspect
import json
import time
import wget

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import ExtensionUtils
import utils
from analyser import Analyser

from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger


def allPack(dbpath, extensionList, crxDir, archiveDir):
    """All things together

    :dbpath: TODO
    :extensionList: TODO
    :crxDir: TODO
    :archiveDir: TODO
    :returns: TODO

    """
    utils.makedirsWithoutError(crxDir)
    utils.makedirsWithoutError(archiveDir)
    for d in os.listdir(extensionList):
        category = d.split(".")[0]
        ExtensionUtils.init_database(dbpath, os.path.join(extensionList, d), category)
        jsonFile = os.path.join(extensionList, d)
        # ExtensionUtils.addExtensionId(dbpath, jsonFile, category)

    db.create_engine(dbpath)
    eList = db.select("select * from extensionTable")
    db._db_ctx.connection.cleanup()
    db.engine = None
    for extRow in eList:
        category = extRow["category"]
        eid = extRow["extensionId"]
        try:
            retCode = ExtensionUtils.setExtensionDetailForOne(dbpath, eid)
            if retCode == 1:
                extensionDownloadUrl = "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&x=id%3D{0}%26installsource%3Dondemand%26uc"
                try:
                    fname = wget.download(extensionDownloadUrl.format(eid), 
                            out=os.path.join(crxDir,"{0}.crx".format(eid)))
                    print "\n"
                    logger.info(fname)
                except Exception as e:
                    # __import__('pdb').set_trace()  # XXX BREAKPOINT
                    raise e
            elif retCode == 0:
                logger.info("Get extension detail failed")
            elif retCode == 2:
                logger.info("Extension already the newest")
            else:
                logger.error("Error return when set detail")
        except Exception as e:
            ExtensionUtils.resetInfoForExtension(dbpath, eid)
            continue
            # raise e
    logger.info("Check the output crx files in {0}".format(crxDir))
    checkCrxFiles = filter(lambda x: not x.endswith(".crx"), os.listdir(crxDir))
    tmpFiles = filter(lambda x: x.endswith(".tmp"), checkCrxFiles)
    for tmpFile in tmpFiles:
        logger.info("Found tmp file in {0}, remove it.".format(crxDir))
        os.remove(os.path.join(crxDir, tmpFile))
    if len(checkCrxFiles) > len(tmpFiles):
        logger.warning("Still contain other unexpected files in {0}. Chech them manually:\n{1}".format(crxDir, checkCrxFiles))

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
    # parser.add_argument("--extensionExcluded",
    #                     help="The extensions excluded")


    try:
        args = parser.parse_args()
        if args.cmd == "addExtensionId":
            ExtensionUtils.init_database(args.db,
                    args.extensionIdList,
                    args.category)
        elif args.cmd == "setDetail":
            parametersToBeChecked = ["extensionId"]
            ret = True
            for p in parametersToBeChecked:
                if getattr(args, p) is None:
                    print "{0} can not be empty\n".format(p)
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
                    print "{0} can not be empty\n".format(p)
                    ret = False
            if not ret:
                sys.exit(1)
            ExtensionUtils.setPermissionAllPack(args.db, args.extensionCollection)
        elif args.cmd == "resetExtension":
            parametersToBeChecked = ["extensionId"]
            ret = True
            for p in parametersToBeChecked:
                if getattr(args, p) is None:
                    print "{0} can not be empty\n".format(p)
                    ret = False
            if not ret:
                sys.exit(1)
            ExtensionUtils.resetInfoForExtension(args.db, args.extensionId)
        elif args.cmd == "allPack":
            parametersToBeChecked = ["extensionIdList", "crxDir", "archiveDir"]
            ret = True
            for p in parametersToBeChecked:
                if getattr(args, p) is None:
                    print "{0} can not be empty\n".format(p)
                    ret = False
            if not ret:
                sys.exit(1)
            allPack(args.db, args.extensionIdList, args.crxDir, args.archiveDir)
    except Exception as e:
        print e
        sys.exit(1)


if __name__ == "__main__":
    main()
    
