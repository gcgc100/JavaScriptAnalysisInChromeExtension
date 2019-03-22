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

import wget

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import ExtensionUtils
import utils
from OrmDatabase import *

from gClifford import mylogging
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
    utils.makedirsWithoutError(crxDir)
    utils.makedirsWithoutError(archiveDir)
    for d in os.listdir(extensionList):
        category = d.split(".")[0]
        ExtensionUtils.init_database(os.path.join(extensionList, d), category)

    # eList = select(extension for extension in Extension if Extension.downloadStatus==0 and (Extension.updateTime is None or Extension.updateTime!="404"))
    eList = select(extension for extension in Extension if extension.downloadStatus==0 and extension.updateTime is None)
    ocallback = wget.callback_progress
    global gc_timeout
    def call_back(blocks, block_size, total_size, bar_function):
        global gc_timeout
        if gc_timeout:
            raise Exception("Wget extension for two minutes. Set timeout and stop the thread")
        gc_timeout = False
        ocallback(blocks, block_size, total_size, bar_function)

    wget.callback_progress = call_back
    for extension in eList:
        category = extension.category
        eid = extension.extensionId
        try:
            retCode = ExtensionUtils.setExtensionDetailForOne(extension)
            if retCode == 1:
                extensionDownloadUrl = "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&x=id%3D{0}%26installsource%3Dondemand%26uc"
                try:
                    # fname = wget.download(, 
                    #         out=os.path.join(crxDir,"{0}.crx".format(eid)))
                    fname = [None]
                    curFname = fname[0]
                    startDownloadTime = time.time()
                    # lock = thread.allocate_lock()
                    lock = threading.Lock()
                    def wgetExtension(url, out, lock):
                        lock.acquire()
                        try:
                            fname[0] = wget.download(url, out)
                            lock.release()
                        except Exception as e:
                            fname[0] = "error"
                            logger.error("wget error: %s" % e)
                            lock.release()
                    # thread.start_new_thread(wgetExtension, 
                    threading.Thread(target=wgetExtension, args=
                            (
                                extensionDownloadUrl.format(eid), 
                                os.path.join(crxDir,"{0}.crx".format(eid)),
                                lock
                                )
                            ).start()
                    while(True):
                        if fname[0] == "error":
                            fname[0] = None
                            ExtensionUtils.resetInfoForExtension(extension)
                            break
                        if curFname != fname[0]:
                            lock.acquire()
                            logger.info(fname[0])
                            lock.release()
                            break
                        if time.time() - startDownloadTime > 120:
                            gc_timeout = True
                            ExtensionUtils.resetInfoForExtension(extension)
                            logger.info("wget has not return for 2 minutes, skip it")
                            break
                        time.sleep(0.5)
                    extension.crxPath = os.path.join(crxDir,"{0}.crx".format(eid))
                    print("\n")
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
            logger.error("Get detail failed. Error:%s" % e)
            ExtensionUtils.resetInfoForExtension(extension)
            if e.args[0] == 'http error':
                extension.downloadStatus = e.args[1]
            continue
            # raise e
    logger.info("Check the output crx files in {0}".format(crxDir))
    checkCrxFiles = list(filter(lambda x: not x.endswith(".crx"), os.listdir(crxDir)))
    tmpFiles = list(filter(lambda x: x.endswith(".tmp"), checkCrxFiles))
    for tmpFile in tmpFiles:
        logger.info("Found tmp file in {0}, remove it.".format(crxDir))
        os.remove(os.path.join(crxDir, tmpFile))
    if len(checkCrxFiles) > len(tmpFiles):
        logger.warning("Still contain other unexpected files in {0}. Chech them manually:\n{1}".format(crxDir, checkCrxFiles))
    wget.callback_progress =  ocallback

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


    args = parser.parse_args()
    try:
        dbpath = os.path.abspath(args.db)
        db.bind(provider='sqlite', filename=dbpath, create_db=True)
        db.generate_mapping(create_tables=True)
    except BindingError as e:
        if e.args[0] != "Database object was already bound to SQLite provider":
            raise e
    if args.cmd == "addExtensionId":
        ExtensionUtils.init_database(args.db,
                args.extensionIdList,
                args.category)
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
        ExtensionUtils.resetInfoForExtension(extension)
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


if __name__ == "__main__":
    main()
