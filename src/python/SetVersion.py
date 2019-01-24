#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import shutil
import subprocess
import os
import functools
import inspect
import random
from threading import Thread
from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options


from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger

import socketserver
import http.server as SimpleHTTPServer


js_get_version_dict = {"jquery": "return $.fn.jquery", 
        "Modernizr": "return Modernizr._version",
        "Underscore": "return _.VERSION",
        "Moment": "return moment.version",
        "RequireJS": "return requirejs.version",
        "Backbone": "return Backbone.VERSION",
        "Handlebars": "return Handlebars.VERSION",
        "Mootools": "return Mootools.version",
        "Knockout": "return ko.version",
        "Mustache": "return Mustache.version" 
        }

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

def _createEngine(func):
    @functools.wraps(func)
    def _wrapper(*args, **kw):
        if db.engine is None:
            db.create_engine("../data/data.db")
        return func(*args, **kw)
    return _wrapper

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

def selenium_get_version1(filedir, driver, blockRun=False, lib_type_array=None):
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
        return dict([(x, "100") for x in lib_type_array])
    real_server_dir = "jqueryServer"
    scriptFile = os.path.join(real_server_dir, "script.js")
    if os.path.isfile(scriptFile):
        os.remove(scriptFile)
    shutil.copy(filedir, scriptFile)
    driver.get("http://localhost:8000/jqueryServer/index.html?ram=%s" % random.randint(0, 10000))
    for lib_type in lib_type_array:
        js_get_version = js_get_version_dict[lib_type]
        try:
            version = driver.execute_script(js_get_version)
            print("%s version:%s" % (lib_type, version))
        except Exception as e:
            print("%s version not found" % lib_type)
            version = None
        retDict[lib_type] = version
    return retDict

def selenium_get_version(filedir, blockRun=False, lib_type_array=None, js_get_version="return $.fn.jquery"):
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
        return dict([(x, "100") for x in lib_type_array])
    if not blockRun:
        httpd = simple_server()
    real_server_dir = "jqueryServer"
    scriptFile = os.path.join(real_server_dir, "script.js")
    if os.path.isfile(scriptFile):
        os.remove(scriptFile)
    shutil.copy(filedir, scriptFile)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920x1080")
    driver = webdriver.Chrome(chrome_options=chrome_options)
    driver.get("http://localhost:8000/jqueryServer/index.html?ram=1")
    for lib_type in lib_type_array:
        js_get_version = js_get_version_dict[lib_type]
        try:
            version = driver.execute_script(js_get_version)
            print("%s version:%s" % (lib_type, version))
        except Exception as e:
            print("%s version not found" % lib_type)
            version = None
        retDict[lib_type] = version
    driver.close()
    driver.quit()
    if not blockRun:
        httpd = httpd.get("httpd", None)
        if httpd is not None:
            logger.info("shutdown server")
            httpd.shutdown()
            httpd.server_close()
        else:
            logger.error("httpd not set")
    return retDict

def set_all_version(library_type=None, database="../data/data.db"):
    """Set the jquery version for all javascript files in sqlite db
    :returns: TODO 
    """
    db.create_engine(database)
    global js_get_version_dict
    if library_type is None:
        lib_type_array = js_get_version_dict.keys()
    else:
        if library_type not in js_get_version_dict.keys():
            assert False, "Unknown library type"
        lib_type_array = [library_type]
    # skip the files whose version has been set
    allFiles = db.select("Select * from filetable where id not in (select fileid from (Select count(*) as c,fileid from LibraryTable group by fileid) where c=10)")
    # allFiles = db.select("select * from filetable where id in (select fileid from LibraryTable where version = '100')")
    i = 10
    current_dir = os.path.abspath(inspect.getfile(inspect.currentframe()))
    server_data_dir = os.path.join(os.path.dirname(current_dir),
        "tests/testdata/jqueryServer")
    real_server_dir = "jqueryServer"
    if os.path.exists(real_server_dir):
        logger.error("jqueryServer dir must not exist, so that serve temp server")
        return
    shutil.copytree(server_data_dir, real_server_dir)
    httpd = simple_server()
    driver = prepareSelenium()
    for f in allFiles:
        # if f["jquery"] is not None:
        #     continue
        db.update("delete from LibraryTable where fileId = ?", f["id"])
        exist_libs = []
        # exist_libs = db.select("select * from LibraryTable where fileId = ?", f["id"])
        current_libs = {}
        for lib in js_get_version_dict.keys():
            exist_lib = list(filter(lambda x: x["libname"]==lib, exist_libs))
            assert len(exist_lib) < 2, "multi version for one file?"
            if len(exist_lib) == 1:
                current_libs[lib] = exist_lib[0]["version"]
            else:
                current_libs[lib] = None
        if None not in [current_libs[x] for x in lib_type_array]:
            logger.info("Version already been set. Skip this file")
            continue
        lib_type_array_todo = list(filter(lambda x: current_libs[x] is None, lib_type_array))
        try:
            logger.info("id:%s, filename:%s", f["id"], f["filename"])
            lib_array = selenium_get_version1(f["filepath"], driver, blockRun=True,
                    lib_type_array=lib_type_array_todo)
            for lib in lib_array:
                # sql = "update FileTable set {0} = ? where id = ?".format(version)
                libInfo = db.select("select * from LibraryInfoTable where libname=? and version=?", lib, "%s" % lib_array[lib])
                if len(libInfo)==0:
                    libId = db.insert("LibraryInfoTable", commit=False, **{"version": "%s" % lib_array[lib], "libname": lib})[1]
                else:
                    libId = libInfo[0]["id"]
                row_data = {"fileId": f["id"], 
                        "libraryId": libId
                        # "libname": lib,
                        # "version": "%s" % lib_array[lib]
                        }
                db.insert("LibraryTable", commit=False, **row_data)
            db._db_ctx.connection.commit()
        except exceptions.UnexpectedAlertPresentException as e:
            shutdownChrome(driver)
            driver = prepareSelenium()
        except Exception as e:
            logger.error(e)
    shutil.rmtree(real_server_dir)
    shutdownChrome(driver)
    httpd["httpd"].shutdown()
    db._db_ctx.connection.cleanup()
    db.engine = None
