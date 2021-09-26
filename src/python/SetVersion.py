#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import shutil
import subprocess
import os
import functools
import inspect
import random
import datetime
from threading import Thread
from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

from OrmDatabase import *

import mylogging
logger = mylogging.logger

import socketserver
import http.server as SimpleHTTPServer


js_get_version_dict = {"jquery": "return $.fn.jquery"}
# js_get_version_dict = {"jquery": "return $.fn.jquery", 
#         "Modernizr": "return Modernizr._version",
#         "Underscore": "return _.VERSION",
#         "Moment": "return moment.version",
#         "RequireJS": "return requirejs.version",
#         "Backbone": "return Backbone.VERSION",
#         "Handlebars": "return Handlebars.VERSION",
#         "Mootools": "return Mootools.version",
#         "Knockout": "return ko.version",
#         "Mustache": "return Mustache.version" 
#         }

def selectExtension(db):
    """Select the extensions which need to be handle

    :db: TODO
    :returns: TODO

    """
    # orm.sql_debug(True)
    exts = select((e.extensionId, max(e.downloadTime)) for e in db.Extension if e.downloadTime>datetime.datetime.strptime("2021-09-10", "%Y-%m-%d"))
    for e in exts:
        extensions = select(ex for ex in db.Extension if ex.extensionId==e[0])
        extension = list(filter(lambda x: x.downloadTime==e[1], extensions))[0]
        if extension.extensionStatus != ExtensionStatus.PermissionSetted:
            continue
        if extension.extensionStatus == ExtensionStatus.UnPublished:
            continue
        if extension.extensionStatus == ExtensionStatus.ExtensionChecked:
            continue
        if extension.extensionStatus == ExtensionStatus.LibSet:
            continue
        yield extension

def simple_server():
    """Run a simple http server to server index.html
    :returns: TODO

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

def prepareSelenium():
    """Open the headless chrome with selenium"
    :returns: TODO

    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920x1080")
    driver = webdriver.Chrome(chrome_options=chrome_options)
    return driver

def shutdownChrome(driver):
    """Shutdown the headless chrome

    :driver: TODO
    :returns: TODO

    """
    driver.close()
    driver.quit()

def selenium_get_version(filedir, driver, blockRun=False, lib_type_array=None):
    """Get version with selenium
     Need a localhost server to cooperate.
     The server serves a index.html file, this html file include 
     the script.js
     selenium will replace the script.js with target filedir javascript
     file and load index.html.
     Then execute "return $.fn.jquery" to get the version.
     Use simple_server function to start the server.

     ERROR: The server will not be close immediately, the port will 
     be in used for another few seconds, reason unknown


    :filedir: the target javascript file dir
    :blockRun: if False, run httpserver inside the function
               if True, need to run the httpserver independently,
               this function could be invoked multiple times without
               open and shutdown the httpserver every time.
    :lib_type_array: The name array of javascript lib
    :js_get_version: the javascript code used to get version, default jquery code.
    :returns: dict of version, key:lib name, value:version(None if not found)

    """
    global js_get_version_dict
    retDict = {}
    if lib_type_array is None:
        lib_type_array = js_get_version_dict.keys()
    if not os.path.isfile(filedir):
        # if file not exits, set all version to 100
        return dict([(x, None) for x in lib_type_array])
    real_server_dir = "jqueryServer"
    scriptFile = os.path.join(real_server_dir, "script.js")
    if os.path.isfile(scriptFile):
        os.remove(scriptFile)
    shutil.copy(filedir, scriptFile)
    logger.debug("copy file done")
    driver.get("http://localhost:8000/jqueryServer/index.html?ram=%s" % random.randint(0, 10000))
    for lib_type in lib_type_array:
        js_get_version = js_get_version_dict[lib_type]
        try:
            version = driver.execute_script(js_get_version)
            logger.info("%s version:%s" % (lib_type, version))
        except Exception as e:
            # print("%s version not found" % lib_type)
            version = None
        retDict[lib_type] = version
    return retDict

def set_all_version(library_type=None, database="../data/data.db"):
    """Set the jquery version for all javascript files in sqlite db
    :returns: TODO 
    """
    try:
        dbpath = os.path.abspath(database)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
        # db.bind(provider='sqlite', filename=dbpath, create_db=True)
        # db.provider.converter_classes.append((Enum, EnumConverter))
        # db.generate_mapping(create_tables=True)
    except BindingError as e:
        if e.args[0] != "Database object was already bound to SQLite provider":
            raise e

    global js_get_version_dict
    if library_type is None:
        lib_type_array = js_get_version_dict.keys()
    else:
        if library_type not in js_get_version_dict.keys():
            assert False, "Unknown library type"
        lib_type_array = [library_type]
    httpd = None
    with db_session:
        for extension in selectExtension(db):
            allFiles = extension.scripts
            i = 10
            current_dir = os.path.abspath(inspect.getfile(inspect.currentframe()))
            server_data_dir = os.path.join(os.path.dirname(current_dir),
                "tests/testdata/jqueryServer")
            real_server_dir = "jqueryServer"
            if os.path.exists(real_server_dir):
                logger.error("jqueryServer dir must not exist, so that serve temp server")
                return
            shutil.copytree(server_data_dir, real_server_dir)
            if httpd is None:
                httpd = simple_server()
            driver = prepareSelenium()
            # if extension.id == 36429:
            #     __import__('pdb').set_trace()  # XXX BREAKPOINT
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
                    lib_array = selenium_get_version(f.filepath, driver, blockRun=True,
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
                    break
                except exceptions.UnexpectedAlertPresentException as e:
                    shutdownChrome(driver)
                    driver = prepareSelenium()
                except Exception as e:
                    logger.error(e)
            extension.extensionStatus = ExtensionStatus.LibSet
            db.commit()
            shutil.rmtree(real_server_dir)
            shutdownChrome(driver)
    httpd["httpd"].shutdown()
