#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from urllib.request import urlopen
import urllib.parse as urlparse
import re
import socket
import string
import time
import queue
import threading
import copy

from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

import mylogging
logger = mylogging.logger

from OrmDatabase import *
import utils

class Analyser(object):

    """The analyser class"""

    def __init__(self, db):
        """init """
        self._db = db

    def script_from_src(self, src):
        """Prepare a script from src

        :src: TODO
        :returns: TODO

        """
        script_data = None
        if src.startswith("//"):
            src = "https:{0}".format(src)
        try:
            script_url_file = urlopen(src, timeout=10)
            script_data = script_url_file.read()
        except (IOError, socket.error) as e:
            logger.error(e)
            raise(e)
        if type(script_data) == bytes:
            return script_data.decode("utf-8")
        else:
            return script_data

    def format_filename(self, s):
        """Take a string and return a valid filename constructed from 
        the string.  Uses a whitelist approach: any characters not present 
        in valid_chars are removed. Also spaces are replaced with underscores. 
        Note: this method may produce invalid filenames such as ``, `.` or 
        `..` When I use this method I prepend a date string like '2009_01_15_
        19_46_32_' and append a file extension like '.txt', so I avoid the 
        potential of using an invalid filename.
          
        """
        valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
        filename = ''.join(c for c in s if c in valid_chars)
        filename = filename.replace(' ','_') # I don't like spaces in filenames.
        return filename


def proxy_detect_javascript_in_html(extension, script_folder):
    """Detect all JavaScripts in html webpages with proxy method and set the scripts property in extension

    :extension: Must be Extension object
    :script_folder: TODO
    :returns: TODO

    """
    p = utils.mitmproxy_start()
    logData = queue.Queue()
    def read_proxy_output():
        l = True
        while(l):
            l = p.stdout.readline()
            logData.put(l)
    # thread.start_new_thread(read_proxy_output, ())
    threading.Thread(target=read_proxy_output).start()
    time.sleep(0.5)
    extension_id = extension.extensionId
    chrome_options = Options()
    chrome_options.add_extension(extension.crxPath)
    driver = None
    try:
        for html_file in extension.htmlFiles:
            if driver is None:
                driver = webdriver.Chrome(chrome_options=chrome_options)
            html_url = html_file.replace(extension.srcPath, 
                    "chrome-extension://{eid}/".format(eid=extension_id))
            logger.info("Search js in %s", html_url)
            js_code = "return document.getElementsByTagName('script');"
            retScripts = []
            # The chrome extension may open pages automaticallly. Close them just keep one.
            if len(driver.window_handles) > 1:
                for handle in driver.window_handles[1:]:
                    driver.switch_to.window(handle)
                    driver.close()
                driver.switch_to.window(driver.window_handles[0])
            driver.get(html_url)
            script = Script.WebpageJavaScript(htmlPath=html_file, 
                    method="P", 
                    filetype=Script.SCRIPT_WEBPAGE_SCRIPT,
                    extensionId = extension.extensionId)
            time.sleep(2)
            lines = []
            while not logData.empty():
                lines.append(logData.get())
            extension.scripts.extend(parse_script_from_mitmproxy_log(lines, script))
    except Exception as e:
        utils.mitmproxy_stop(p)
        if driver is not None:
            time.sleep(2)
            # driver.close()
            # driver.quit()
    utils.mitmproxy_stop(p)
    if driver is not None:
        time.sleep(2)
        driver.close()
        driver.quit()

def parse_script_from_mitmproxy_log(logLines, baseScript, scriptFolder=None):
    """Parse the mitmproxy log, get the JavaScript request and create Script object

    :log: mitmproxy log
    :script: base Script object
    :script_folder: the folder to save script files
    :returns: Script object list

    """
    lines = logLines
    scripts = []
    for l in lines:
        # pattern = r"\d+\.\d+\.\d+\.\d+\.:\d+: GET (http.*)"
        pattern = r"\d+\.\d+\.\d+\.\d+:\d+: GET (http[^ ]+)( HTTP/2\.\d)?.*"
        l = l.replace("\n", "")
        r = re.match(pattern, l)
        if r is not None:
            src = r.group(1)
            if src.endswith(".js"):
                script = copy.copy(baseScript)
                script.src = src
                script_data = script_from_src(src)
                script_data_path = scriptFolder
                if script_data is None:
                    # filepath will be changed to abspath in future, 
                    # add '/' so that it will not be extended
                    script.filepath = "/error"
                    script.filename = os.path.basename(
                            urlparse.urlparse(src).path)
                else:
                    if script_data_path is not None:
                        filepath = os.path.join(script_data_path, 
                                baseScript.extensionId,
                                format_filename(baseScript.htmlPath),
                                format_filename(src))
                        filepath = os.path.abspath(filepath)
                        if not os.path.exists(
                                os.path.dirname(filepath)):
                            os.makedirs(os.path.dirname(filepath))
                        # assert not os.path.isfile(filepath), "file not found"
                        if not os.path.isfile(filepath):
                            with open(filepath, 'w') as script_file:
                                script_file.write(script_data)
                        script.filepath = filepath
                        script.filename = os.path.basename(
                                urlparse.urlparse(src).path)
                scripts.append(script)
    return scripts
