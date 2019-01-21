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

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger

import Analyser
import Extension
import DatabaseConf
import Script


def insert(scripts, table_name):
    """Insert scripts into table based on the keys

    :scripts: TODO
    :table_name: TODO
    :returns: TODO

    """
    scriptLen = 0
    for script in scripts:
        script_file = {}
        for key in DatabaseConf.\
                TABLE_LIST[table_name]["columns"].keys():
            if key == "fileId":
                script_file[key] = script.dbFileId
            else:
                script_file[key] = getattr(script, key, None)
        if table_name == "FileTable":
            if os.path.isfile(getattr(script, "filepath", None)):
                with open(getattr(script, "filepath", None)) as fp:
                    hasher = hashlib.md5()
                    hasher.update(fp.read().encode('utf-8'))
                    hashStr = hasher.hexdigest()
                script_file["hash"] = hashStr
        lastid = db.insertNoCommit(table_name, **script_file)[1]
        scriptLen += 1
        # set fileid
        if table_name == "FileTable":
            script.dbFileId = lastid
    logger.info("%s items inserted", scriptLen)

def allPack(script_folder, static, dynamic, srcBasePath, crxBasePath):
    """TODO: Docstring for allPack.

    :db_path: TODO
    :script_folder: TODO
    :returns: TODO

    """
    # __import__('pdb').set_trace()  # XXX BREAKPOINT
    eList = db.select("select * from extensionTable where downloadStatus = 1")
    for e in eList:
        crxPath = os.path.join(crxBasePath, 
                "{0}.crx".format(e["extensionId"]))
        srcPath = os.path.join(srcBasePath, e["extensionId"], "0_0_0")
        if not os.path.exists(srcPath):
            logger.info("{0} extension src code not exists".format(srcPath))
            continue
        e["dbID"] = e.pop("id")
        ds = ["downloadStatus", "userNum"]
        for d in ds:
            # if e.has_key(d):
            if d in e:
                e.pop(d)
        extension = Extension.Extension(crxPath, srcPath, **e)
        logger.info("Start to analyse extension{0}, dbId:{1}".format(e["extensionId"], e["dbID"]))
        Analyser.detect_background_scripts(extension)
        Analyser.detect_content_scripts(extension)
        if static:
            Analyser.static_detect_javascript_in_html(extension, script_folder)
        if dynamic:
            Analyser.dynamic_detect_javascript_in_html(extension, script_folder)
        insert(extension.scripts, "FileTable")
        insert(filter(lambda e: e.filetype==Script.SCRIPT_WEBPAGE_SCRIPT, extension.scripts), "JavaScriptInHtmlTable")
        db._db_ctx.connection.commit()
        logger.info("Extension{0} analysed".format(e["extensionId"]))

def main():
    parser = argparse.ArgumentParser("Extract JavaScript Inclusion and save to sqlite database")
    parser.add_argument("cmd",
                        help="")
    parser.add_argument("db",
            help="The sqlite database which is used to save data")
    parser.add_argument("script",
            help="The folder used to save downloaded scripts. Dont move the script files. The file path is saved in sqlite database. If moved, they will not match.")
    parser.add_argument("--srcPath", help="The extension to be analysed")
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
        db.create_engine(args.db)
        srcPath = args.srcPath
        crxPath = args.crxPath
        if args.cmd == "allPack":
            allPack(args.script, args.static, args.dynamic, srcPath, crxPath)
        elif args.cmd == "oneExtension":
            if not srcPath.endswith("/"):
                srcPath= srcPath + "/"
            path = srcPath
            for i in range(2):
                path = os.path.split(path)[0]
            extension_id = os.path.split(path)[1]
            assert re.match("[a-z]{32}", extension_id), "illegal extensionId"
            extension = Extension.Extension(args.crxPath, args.srcPath, extensionId=extension_id)
            Analyser.detect_background_scripts(extension)
            Analyser.detect_content_scripts(extension)
            if args.static:
                Analyser.static_detect_javascript_in_html(extension, args.script)
            if args.dynamic:
                Analyser.dynamic_detect_javascript_in_html(extension, args.script)
            if args.proxyDetection:
                Analyser.proxy_detect_javascript_in_html(extension, args.script)
            insert(extension.scripts, "FileTable")
            insert(filter(lambda e: e.filetype==Script.SCRIPT_WEBPAGE_SCRIPT, extension.scripts), "JavaScriptInHtmlTable")
            db._db_ctx.connection.commit()
        if db._db_ctx.connection is not None:
            db._db_ctx.connection.cleanup()
        db.engine = None
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        logger.error(e)
        sys.exit()

if __name__ == "__main__":
    main()
