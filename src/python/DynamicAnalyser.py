#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import re
import socket
import urllib.parse as urlparse

from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

from pony.orm import *
from Analyser import Analyser
from OrmDatabase import *

import mylogging
logger = mylogging.logger

class DynamicAnalyser(Analyser):

    """Dynamic analyse an extension"""

    def __init__(self, db):
        """TODO: to be defined.

        :db: TODO

        """
        Analyser.__init__(self, db)
    
    def detect(self, extension, script_folder, headless=True):
        """Detect all JavaScripts in html webpages with dynamic method and set the scripts property in extension

        :extension: Must be Extension object

        """
        assert extension.analysedStatus & AnalysedStatus.Dynamic.value == 0
        db = self._db
        rScripts = []
        extension_id = extension.extensionId
        chrome_options = Options()
        # if headless:
        #     chrome_options.add_argument('--headless')
        chrome_options.add_extension(extension.crxPath)
        driver = None
        for html_file in extension.htmlFiles:
            if driver is None:
                driver = webdriver.Chrome(chrome_options=chrome_options)
            html_url = html_file.replace(extension.srcPath, 
                    "chrome-extension://{eid}/".format(eid=extension_id))
            logger.info("Search js in %s", html_file)
            js_code = "return document.getElementsByTagName('script');"
            retScripts = []
            # The chrome extension may open pages automaticallly. Close them just keep one.
            if len(driver.window_handles) > 1:
                for handle in driver.window_handles[1:]:
                    driver.switch_to.window(handle)
                    driver.close()
                driver.switch_to.window(driver.window_handles[0])
            driver.get(html_url)
            scripts = driver.execute_script(js_code)
            logger.debug(scripts)
            seq = 0
            for script in scripts:
                src = script.get_attribute("src")
                logger.debug(src)
                if src.startswith("chrome-extension://"):
                    # remove the extension root path from src
                    # e.g. chrome-extension://abcdabcdabcdabcdabcdabcdabcdabcd/a.js -> a.js
                    # 32: the len of extensionId
                    src = src[len("chrome-extension://") + 32:]
                code = script.get_attribute("innerText")
                retScript = ['script']
                retScript.append([('src', src)])
                retScript.append(code)
                retScript.append(seq)
                seq += 1
                retScripts.append(retScript)
            temp_scripts = retScripts
            for temp_script in temp_scripts:
                logger.info("script %s found and to be processed", temp_script)
                src = [x for x in temp_script[1] if x[0] == "src"]
                if len(src) == 1:
                    src = src[0][1]
                else:
                    assert len(src) == 0, "script with more than one src"
                    src = ""
                if src.startswith("//"):
                    # [2:] remove // 
                    filepath = os.path.join(extension.srcPath, src[2:])
                    if not os.path.exists(filepath):
                        logger.info("Local script not found")
                        filepath = "/error"
                    else:
                        pass
                    pass
                elif re.match("[a-zA-Z]+://.*", src) is not None or src.startswith("//"):
                    # the src is a url or no protocol url
                    script_data = None
                    try:
                        script_data = self.script_from_src(src)
                    except socket.error as e:
                        err = e
                    script_data_path = script_folder
                    if script_data is None:
                        # filepath will be changed to abspath in future, 
                        # add '/' so that it will not be extended
                        # filename = os.path.basename(
                        #         urlparse.urlparse(src).path)
                        filepath = "/error:{0}".format(err)
                    else:
                        filename = os.path.basename(
                                urlparse.urlparse(src).path)[:20]
                        filepath = os.path.join(script_data_path, 
                                extension.extensionId,
                                self.format_filename(html_file),
                                # format_filename(src),
                                filename)
                        filepath = os.path.abspath(filepath)
                        if not os.path.exists(
                                os.path.dirname(filepath)):
                            os.makedirs(os.path.dirname(filepath))
                        if not os.path.isfile(filepath):
                            with open(filepath, 'w') as script_file:
                                script_file.write(script_data)
                else:
                    filename = os.path.basename(src)
                    if src.startswith("/"):
                        # absolute path to extension
                        filepath = os.path.join(extension.srcPath, src[1:])
                    elif src == "":
                        # inline script
                        if len(temp_script) >= 4:
                            filename = "inline.js"
                            filepath = os.path.join(script_folder, 
                                extension.extensionId,
                                self.format_filename(html_file),
                                "{0}".format(temp_script[3]),
                                "inline.js")
                            if not os.path.exists(
                                    os.path.dirname(filepath)):
                                os.makedirs(os.path.dirname(filepath))
                            with open(filepath, "w") as f:
                                f.write(temp_script[2])
                            filepath = filepath
                        else:
                            filepath = "/{0}".format(os.path.basename(filepath))
                    else:
                        # General relative path javascript
                        filepath = os.path.join(os.path.dirname(html_file), src)
                # use abspath to remove .. component
                # Otherwise, aa/bb/../cc and aa/cc would be treated 
                # as different filepath
                filepath = os.path.abspath(filepath)
                script = db.ExtensionWebpageScript(extension = extension,
                        filepath = filepath,
                        detectMethod = DetectMethod.Dynamic,
                        htmlPath = html_file)
                script.url = src
                script.hash = script.setHash()
                rScripts.append(script)
        extension.analysedStatus = extension.analysedStatus | AnalysedStatus.Dynamic.value
        if driver is not None:
            driver.close()
            driver.quit()
        return rScripts
