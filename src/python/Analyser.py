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
import TarnishAnalyser as ta
import ExtAnaAnalyser as ea

def detect(extension, script_folder, db):
    """TODO: Docstring for detect.

    :extension: TODO
    :returns: TODO

    """
    e = extension
    if static:
        static_detect_javascript_in_html(e, script_folder, db)
    if dynamic:
        dynamic_detect_javascript_in_html(e, script_folder, db)
    if tarnish:
        detect_with_tarnish(e, db)
    if extAnalysis:
        detect_with_extAnalysis(e, db)

def detect_with_tarnish(extension, db):
    """Detect the vulnerable library with tarnish tool

    :extension: TODO
    :returns: TODO

    """
    ret = ta.analyseExtension(extension)
    for r in ret:
        r["filepath"] = os.path.join(extension.srcPath, r["filepath"])
        loc = r["filepath"]
        js = db.JavaScriptInclusion.select(lambda j: j.filepath==loc and
                j.detectMethod==DetectMethod.Tarnish.value and
                j.extension==extension)[:]
        if len(js) == 0:
            js = db.JavaScriptInclusion(detectMethod=DetectMethod.Tarnish.value,
                    filepath = loc,
                    extension = extension)
        else:
            assert(len(js) == 1)
            js = js[0]

        l = r["library"]
        libversion = l["version"]
        libname = l["libname"]
        lib = db.Library.select(
                lambda x: x.version==libversion and x.libname==libname
                )[:]
        if len(lib) == 0:
            # lib = Library(libname = libname,
            #         version = libversion)
            lib = db.Library(**l)
        else:
            assert(len(lib) == 1)
            lib = lib[0]
        js.libraries.add(lib)
        lib.scripts.add(js)
    extension.analysedStatus = extension.analysedStatus | AnalysedStatus.Tarnish.value

def detect_with_extAnalysis(extension, db):
    """TODO: Docstring for detect_with_extAnalysis.

    :extension: TODO
    :returns: TODO

    """
    ret = ea.ExtAnaAnalyser().analyseExtension(extension, headless=True)
    for r in ret:
        loc = os.path.join(extension.srcPath, r)
        js = db.JavaScriptInclusion.select(lambda j: j.filepath==loc and 
                j.detectMethod==DetectMethod.ExtAnalysis.value and
                j.extension==extension)[:]
        if len(js) == 0:
            js = db.JavaScriptInclusion(detectMethod=DetectMethod.ExtAnalysis.value,
                    filepath = loc,
                    extension = extension)
        else:
            assert(len(js)==1)
            js = js[0]
    extension.analysedStatus = extension.analysedStatus | AnalysedStatus.ExtAnalysis.value

def detect_background_scripts(extension, db):
    """Detect all background scripts in extension and set the scripts property in extension

    :extension: Must be Extension object

    """
    scripts = []
    for background_script in extension.manifest.get("background", {}).get("scripts", []):
        if background_script.startswith("/"):
            # absolute path to extension
            filepath = os.path.join(extension.srcPath, background_script[1:])
        else:
            filepath = os.path.join(extension.srcPath, background_script)
        filepath = os.path.abspath(filepath)
        script = db.BackgroundScript(extension = extension,
                filepath = filepath,
                detectMethod = DetectMethod.Static.value)
        script.hash = script.setHash()
        scripts.append(script)
    return scripts

def detect_content_scripts(extension, db):
    """Detect all ContentScripts in extension and set the scripts property in extension

    :extension: Must be Extension object

    """
    scripts = []
    for content_scripts in extension.manifest.get("content_scripts", []):
        for content_script in content_scripts.get("js", []):
            try:
                matches = json.dumps(content_scripts["matches"])
                runAt = content_scripts.get("run_at", None)
                if content_script.startswith("/"):
                    # absolute path to extension
                    filepath = os.path.join(extension.srcPath, content_script[1:])
                else:
                    filepath = os.path.join(extension.srcPath, content_script)
            except KeyError as e:
                logger.error(e)
                raise e
            filepath = os.path.abspath(filepath)
            script = db.ContentScript(extension = extension,
                    filepath = filepath,
                    detectMethod = DetectMethod.Static.value,
                    matches = matches,
                    runAt = runAt)
            script.hash = script.setHash()
            scripts.append(script)

def detect_javascript_in_html(extension, script_folder, db):
    """Detect all JavaScripts in html webpages and set the scripts property in extension

    :extension: Must be Extension object
    :script_folder: The folder to save inline JavaScript and remote JavaScript codes.
    :method: Detection method

    """
    static_detect_javascript_in_html(extension, script_folder, db)
    dynamic_detect_javascript_in_html(extension, script_folder)

def script_from_src(src):
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
    # if src == "https://funnytabs.mystartcdn.com/new-tab/funnyemojis/newtab/js/index.js":
    #     pass
    #     __import__('pdb').set_trace()  # XXX BREAKPOINT
    if type(script_data) == bytes:
        return script_data.decode("utf-8")
    else:
        return script_data

def format_filename(s):
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

def static_detect_javascript_in_html(extension, script_folder, db):
    """Detect all JavaScripts in html webpages with static method and set the scripts property in extension

    :extension: Must be Extension object

    """
    for html_file in extension.htmlFiles:
        logger.info("Search js in %s", html_file)
        try:
            with open(html_file) as f:
                file_content = f.read()
        except IOError as e:
            logger.error(e)
            raise e
        parser = utils.MyHTMLParser()
        parser.feed(file_content)
        scripts = []
        for tag in parser.tags:
            if tag[0] == "script":
                scripts.append(tag)
        temp_scripts = scripts
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
            # if re.match("[a-zA-Z]+://.*", src) is not None or src.startswith("//"):
            elif re.match("[a-zA-Z]+://.*", src) is not None:
                # the src is a url or no protocol url
                try:
                    script_data = script_from_src(src)
                except socket.error as e:
                    script_data = None
                    err = e
                script_data_path = script_folder
                if script_data is None:
                    # filepath will be changed to abspath in future, 
                    # add '/' so that it will not be extended
                    # filepath = "/{0}".format(os.path.basename(
                            # urlparse.urlparse(src).path))
                    filepath = "/error:{0}".format(err)
                else:
                    script_data = str(script_data)
                    filename = os.path.basename(
                            urlparse.urlparse(src).path)
                    filepath = os.path.join(script_data_path, 
                            extension.extensionId,
                            format_filename(html_file),
                            format_filename(src),
                            filename)
                    filepath = os.path.abspath(filepath)
                    if not os.path.exists(
                            os.path.dirname(filepath)):
                        os.makedirs(os.path.dirname(filepath))
                    # assert not os.path.isfile(filepath), "file not found"
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
                            format_filename(html_file),
                            "{0}".format(temp_script[3]),
                            "inline.js")
                        if not os.path.exists(
                                os.path.dirname(filepath)):
                            os.makedirs(os.path.dirname(filepath))
                        with open(filepath, "w") as f:
                            f.write(temp_script[2])
                        filepath = filepath
                    else:
                        filepath = "/inline.js"
                else:
                    # General relative path javascript
                    filepath = os.path.join(os.path.dirname(html_file), src)
            # use abspath to remove .. component
            # Otherwise, aa/bb/../cc and aa/cc would be treated 
            # as different filepath
            filepath = os.path.abspath(filepath)
            script = db.ExtensionWebpageScript(extension = extension,
                    filepath = filepath,
                    detectMethod = DetectMethod.Static.value,
                    htmlPath = html_file)
            script.hash = script.setHash()
            script.url = src

def dynamic_detect_javascript_in_html(extension, script_folder, db):
    """Detect all JavaScripts in html webpages with dynamic method and set the scripts property in extension

    :extension: Must be Extension object

    """
    extension_id = extension.extensionId
    chrome_options = Options()
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
                    script_data = script_from_src(src)
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
                            format_filename(html_file),
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
                            format_filename(html_file),
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
                    detectMethod = DetectMethod.Dynamic.value,
                    htmlPath = html_file)
            script.url = src
            script.hash = script.setHash()
    extension.analysedStatus = extension.analysedStatus | AnalysedStatus.Dynamic.value
    if driver is not None:
        driver.close()
        driver.quit()

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
