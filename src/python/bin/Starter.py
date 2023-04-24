#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import inspect

import shutil
import subprocess
import functools
import random
import datetime
from threading import Thread
from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

import socketserver
import http.server as SimpleHTTPServer

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import mylogging
logger = mylogging.logger

import ExtensionUtils
from OrmDatabase import *
from StaticAnalyser import StaticAnalyser
from DynamicAnalyser import DynamicAnalyser
from TarnishAnalyser import TarnishAnalyser
from ExtAnaAnalyser import ExtAnaAnalyser
import utils

import SetVersion

@db_session
def preAnalyse(eDbId, db):
    """Preset for analysing
    :returns: True or False

    """
    extension = select(e for e in db.Extension if e.id == eDbId)
    if len(extension) != 1:
        logger.error("Trying to analysing nonexist extension({0})".format(eDbId))
        return False
    extension = extension.first()

    if extension.extensionStatus == ExtensionStatus.Init:
        logger.info("Extension({0},DBID:{1}) not detailed".format(extension.extensionId, eDbId))
        return False

    if extension.extensionStatus == ExtensionStatus.Detailed:
        logger.info("Extension({0},DBID:{1}) not downloaded".format(extension.extensionId, eDbId))
        return False

    if extension.extensionStatus == ExtensionStatus.UnPublished:
        logger.info("Extension({0},DBID:{1}) already unpublished".format(extension.extensionId, eDbId))
        return False

    if extension.extensionStatus == ExtensionStatus.Downloaded:
        logger.info("Unpacking Extension({0},DBID:{1})".format(extension.extensionId, eDbId))
        tmpSrcDir = "./data2022/extSrc"
        crxDir = extension.crxPath
        extSrcPath = extension.standardExtSrcPath(tmpSrcDir)
        os.makedirs(extSrcPath, exist_ok=True)
        try:
            logger.info("Start to unpack {0}".format(crxDir))
            ExtensionUtils.unpackExtension(crxDir, extSrcPath)
        except FileNotFoundError as err:
            with open("UnpackCrxError.log", 'a') as f:
                f.write(extension.extensionId)
                f.write("\n")
            logger.error("{0}({1}) extension unpack error:{2}".format(extension.extensionId, extension.id, err))
            os.rmdir(extSrcPath)  # Remove version folder
            ppath = os.path.dirname(extSrcPath)
            if len(os.listdir(ppath)) == 0:
                # Check whether the extension src dir is empty, if so remove it
                os.rmdir(ppath)
            return False
        extension.extensionStatus = ExtensionStatus.Unpacked
        extension.srcPath = extSrcPath

    if extension.extensionStatus == ExtensionStatus.Unpacked:
        logger.info("Set permissions for Extension({0},DBID:{1})".format(extension.extensionId, eDbId))
        if len(extension.permissions) > 0:
            logger.warning("Set permissions failed since already setted")
            extension.extensionStatus = ExtensionStatus.PermissionSetted
        else:
            logger.info("Start to set permissions for extension:{0}".format(extension.extensionId))
            try:
                permissions = extension.getPermissions()
            except Exception as e:
                logger.error("Extension {0}, set permissions failed. {1}".format(extension.extensionId, e))
                return False
            i1 = 0
            i2 = 0
            for p in permissions:
                p = str(p)
                if p != "":
                    permission = db.ExtensionPermission.get(permission = p)
                    i1 += 1
                    if permission is None:
                        permission= db.ExtensionPermission(permission = p)
                        i2 += 1
                    permission.extensions.add(extension)
                    extension.permissions.add(permission)
            extension.extensionStatus = ExtensionStatus.PermissionSetted
            logger.info("{0} permissions({1} new) setted for extension:{2}".format(i1, 
                i2, extension.extensionId)) 
    return True

@db_session
def analyse(eDbId, db, script_folder, static=True, dynamic=True, tarnish=False, extAnalysis=True, proxyDetection=False):
    """Analyse the JavaScriptInclusions
    :returns: True or False

    """
    extension = select(e for e in db.Extension if e.id == eDbId)
    if len(extension) != 1:
        logger.error("Trying to analysing nonexist extension({0})".format(eDbId))
        return False
    extension = extension.first()

    if extension.extensionStatus != ExtensionStatus.PermissionSetted:
        return True
    
    # if not utils.checkVpn():
    #     logger.error("Vpn connection not working")
    #     return False
    # logger.info("Analyse Extension({0},DBID:{1})".format(extension.extensionId, eDbId))

    try:
        if extension.analysedStatus & AnalysedStatus.Error.value != 0:
            logger.warning("Extension ({0}) contains error not solved".format(extension.extensionId))
            return False
        crxPath = extension.crxPath
        if not os.path.exists(extension.srcPath):
            logger.error("{0} extension src code not exists".format(extension.srcPath))
            return False
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
        logger.info("Extension:{0} analysed".format(extension.extensionId))
    except KeyboardInterrupt as e:
        raise e
    except Exception as err:
        logger.error("{0},{1}".format(extension.extensionId, err))
        dbid = extension.id
        #TODO Get extension aggain if need rollback
        db.rollback()
        # e = db.Extension.get(id=dbid)
        extension.analysedStatus = extension.analysedStatus | AnalysedStatus.Error.value
        return False
    return True

def simple_server():
    """Run a simple http server to server index.html
    :returns: 

    """
    ret = {}
    def run_server():
        PORT = 8000
        while True:
            try:
                Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
                httpd = socketserver.TCPServer(("", PORT), Handler)
                print("serving at port %s" % PORT)
                ret["httpd"] = httpd
                httpd.serve_forever()
                break
            except Exception as e:
                print(e)
                print("sleep 3 seconds and try again")
                import time
                time.sleep(3)
    t = Thread(target=run_server)
    # Make sure the server has been started
    # Then set back current dir
    t.start()
    while "httpd" not in ret.keys():
        pass
    return ret

@db_session
def setLibrary(eDbId, db, httpd):
    """Detect the libraries

    :eDbId: TODO
    :db: TODO
    :returns: TODO

    """
    js_get_version_dict = {"jquery": "return $.fn.jquery"}
    extension = select(e for e in db.Extension if e.id == eDbId)
    if len(extension) != 1:
        logger.error("Src code nonexist extension({0})".format(eDbId))
        return False
    extension = extension.first()

    if extension.extensionStatus != ExtensionStatus.PermissionSetted:
        return False
    if extension.analysedStatus & AnalysedStatus.Error.value != 0:
        return False
    # if extension.analysedStatus != 11:
    #     return False
    try:
        if not os.path.exists(extension.srcPath):
            logger.error("{0} extension src code not exists".format(extension.srcPath))
            return False

        allFiles = extension.scripts
        i = 10
        current_dir = os.path.abspath(inspect.getfile(inspect.currentframe()))
        server_data_dir = os.path.join(os.path.dirname(current_dir),
            "../tests/testdata/jqueryServer")
        real_server_dir = "jqueryServer"
        if os.path.exists(real_server_dir):
            logger.error("jqueryServer dir must not exist, so that serve temp server")
            return False
        shutil.copytree(server_data_dir, real_server_dir)
        driver = SetVersion.prepareSelenium()
        lib_type_array = js_get_version_dict.keys()
        for f in allFiles:
            if len(f.libraries) > 0:
                continue
            exist_libs = f.libraries
            current_libs = {}
            for lib in js_get_version_dict.keys():
                exist_lib = list(filter(lambda x: x.libname==lib, exist_libs))
                assert len(exist_lib) < 2, "multi version for one file?"
                if len(exist_lib) == 1:
                    current_libs[lib] = exist_lib[0].version
                else:
                    current_libs[lib] = None
            if None not in [current_libs[x] for x in lib_type_array]:
                logger.info("Version already been set. Skip this file")
                continue
            lib_type_array_todo = list(filter(lambda x: current_libs[x] is None, lib_type_array))
            try:
                logger.info("id:%s, filename:%s", f.id, f.filename)
                lib_array = SetVersion.selenium_get_version(f.filepath, driver, blockRun=True,
                        lib_type_array=lib_type_array_todo)
                # logger.info("selenium get version done")
                logger.info("libArray:{0}".format(lib_array))
                for lib in lib_array:
                    ver = lib_array[lib]
                    if ver is None:
                        libInfo = None
                        continue
                    logger.info("\x1b[31;21mLib found:{0}\x1b[0m".format(lib))
                    libInfo = db.Library.get(libname=lib, version=ver)
                    if libInfo is None:
                        libInfo = db.Library(libname=lib, version=ver)
                    libId = libInfo.id
                    f.libraries.add(libInfo)
                    libInfo.scripts.add(f)
            except SystemExit as e:
                raise e
            except KeyboardInterrupt as e:
                keyInterrupt = True
                shutil.rmtree(real_server_dir)
                SetVersion.shutdownChrome(driver)
                shutil.rmtree("jqueryServer")
                sys.exit(2)
            except exceptions.UnexpectedAlertPresentException as e:
                SetVersion.shutdownChrome(driver)
                driver = SetVersion.prepareSelenium()
            except Exception as e:
                logger.error(e)
        extension.extensionStatus = ExtensionStatus.LibSet
        shutil.rmtree(real_server_dir)
        SetVersion.shutdownChrome(driver)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        shutil.rmtree("jqueryServer")
        shutdownChrome(driver)
        raise e
    except Exception as e:
        if os.path.exists("jqueryServer"):
            shutil.rmtree("jqueryServer")
        raise e
    shutil.rmtree(extension.srcPath)
    return True

def main():
    choices = ["Analyse", "FixError"]
    parser = argparse.ArgumentParser("The starter for analyser. The extension should be already downloaded.")
    parser.add_argument("cmd",
            choices = choices,
            help="The command to be used")
    parser.add_argument("--db", help="sqlite database")
    parser.add_argument("--scriptDir", default="./data2022/scripts",
            help="Directory to save scripts")

    try:
        args = parser.parse_args()

        dbpath = os.path.abspath(args.db)
        print(dbpath)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)

        startId = -1
        if args.cmd == choices[0]:
            with db_session:
                eDbIds = select(e.id for e in db.Extension if e.id > startId)[:]
            httpd = simple_server()
            for eDbId in eDbIds:
                try:
                    ret = preAnalyse(eDbId, db)
                    if not ret:
                        continue
                    ret = analyse(eDbId, db, args.scriptDir, extAnalysis=False)
                    if not ret:
                        continue
                    ret = setLibrary(eDbId, db, httpd)
                except KeyboardInterrupt as e:
                    # Not an error, user want to stop
                    raise e
                except Exception as e:
                    logger.error(e)
                    continue

            httpd["httpd"].shutdown()

        elif args.cmd == choices[1]:
            pass
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        httpd["httpd"].shutdown()
        sys.exit(2)
    except Exception as e:
        httpd["httpd"].shutdown()
        raise e
        print(e)
        sys.exit()
    
if __name__ == "__main__":
    main()
