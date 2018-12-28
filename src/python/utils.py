#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Basic tools
"""

from HTMLParser import HTMLParser
import os
import json
import re
import urlparse
import urllib2
import urllib
import socket
import sys
import string
import logging

from datetime import datetime

from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

from pprint import pprint

from gClifford import mylogging
logger = mylogging.logger
# logger.setLevel(logging.WARNING)

def makedirsWithoutError(dirpath):
    try:
        os.makedirs(dirpath)
    except OSError as e:
        if e.errno != os.errno.EEXIST:
            raise e

class Utils(object):

    """Util functions"""

    def __init__(self, script_folder):
        """inti """
        self.script_data_path = script_folder
        if not os.path.exists(self.script_data_path):
            os.mkdir(self.script_data_path)

    def extract_background_scripts(self, extension_root_path):
        """Extract all background scripts for one extension

        :extension_root_path: TODO
        :returns: TODO

        """
        if not extension_root_path.endswith("/"):
            extension_root_path = extension_root_path+"/"

        try:
            with open(os.path.join(extension_root_path, "manifest.json")) \
                    as manifest_file:
                manifest = json.load(manifest_file)
                if type(manifest) == list:
                    raise ValueError()
        except (IOError, ValueError) as e:
            logger.error(e)
            raise e
        scripts = []
        background = manifest.get("background", {})
        for background_script in manifest.get("background", {}).get("scripts", []):
            script = {}
            if background_script.startswith("/"):
                # absolute path to extension
                script["filepath"] = os.path.join(extension_root_path, background_script[1:])
            else:
                script["filepath"] = os.path.join(extension_root_path, background_script)
            script["filetype"] = 2
            script["filename"] = os.path.basename(background_script)
            assert script["filename"].endswith(".js"), "Background script without .js ext"
            script["extensionId"] = self.get_extension_id(
                    extension_root_path)
            script["filepath"] = os.path.abspath(script["filepath"])
            scripts.append(script)
        return scripts

    def extract_content_scripts(self, extension_root_path):
        """Extract all content scripts for one extension

        :extension_root_path: TODO
        :returns: TODO

        """
        if not extension_root_path.endswith("/"):
            extension_root_path = extension_root_path+"/"

        try:
            with open(os.path.join(extension_root_path, "manifest.json")) \
                    as manifest_file:
                manifest = json.load(manifest_file)
                if type(manifest) == list:
                    raise ValueError()
        except (IOError, ValueError) as e:
            logger.error(e)
            raise e
        scripts = []
        for content_scripts in manifest.get("content_scripts", []):
            script = {}
            for content_script in content_scripts.get("js", []):
                script = {}
                try:
                    script["matches"] = json.dumps(content_scripts["matches"])
                    script["runAt"] = content_scripts.get("run_at", None)
                    if content_script.startswith("/"):
                        # absolute path to extension
                        script["filepath"] = os.path.join(extension_root_path, content_script[1:])
                    else:
                        script["filepath"] = os.path.join(extension_root_path, content_script)
                except KeyError as e:
                    logger.error(e)
                    raise e
                script["filename"] = os.path.basename(content_script)
                assert script["filename"].endswith(".js")
                script["extensionId"] = self.get_extension_id(
                        extension_root_path)
                script["filetype"] = 0
                # use abspath to remove .. component
                # Otherwise, aa/bb/../cc and aa/cc would be treated 
                # as different filepath
                script["filepath"] = os.path.abspath(script["filepath"])
                scripts.append(script)
        return scripts

    def extract_inc_javascript_in_html(self, extension_root_path):
        """Extract the javascript files included in extension html files

        :extension_root_path: TODO
        :returns: TODO

        """
        if not extension_root_path.endswith("/"):
            extension_root_path = extension_root_path+"/"
        extension_id = self.get_extension_id(extension_root_path)
        scripts = []
        for html_file in self.find_html_files(extension_root_path):
            logger.info("Search js in %s", html_file)
            temp_scripts = self.find_scripts_from_one_file(html_file)
            for temp_script in temp_scripts:
                logger.info("script %s found and to be processed", temp_script)
                script = {}
                src = [x for x in temp_script[1] if x[0] == "src"]
                if len(src) == 1:
                    src = src[0][1]
                else:
                    assert len(src) == 0, "script with more than one src"
                    src = ""
                if re.match("[a-zA-Z]+://.*", src) is not None or src.startswith("//"):
                    # the src is a url or no protocol url
                    script_data = self.script_from_src(src)
                    script_data_path = self.script_data_path
                    if script_data is None:
                        # filepath will be changed to abspath in future, 
                        # add '/' so that it will not be extended
                        script["filepath"] = "/error"
                        script["filename"] = os.path.basename(
                                urlparse.urlparse(src).path)
                    else:
                        filepath = os.path.join(script_data_path, 
                                extension_id,
                                self.format_filename(html_file),
                                self.format_filename(src))
                        filepath = os.path.abspath(filepath)
                        if not os.path.exists(
                                os.path.dirname(filepath)):
                            os.makedirs(os.path.dirname(filepath))
                        # assert not os.path.isfile(filepath), "file not found"
                        if not os.path.isfile(filepath):
                            with open(filepath, 'w') as script_file:
                                script_file.write(script_data)
                        script["filepath"] = filepath
                        script["filename"] = os.path.basename(
                                urlparse.urlparse(src).path)
                else:
                    script["filename"] = os.path.basename(src)
                    if src.startswith("/"):
                        # absolute path to extension
                        script["filepath"] = os.path.join(extension_root_path, src[1:])
                    elif src == "":
                        # inline script
                        if len(temp_script) >= 4:
                            script["filename"] = "inline.js"
                            filepath = os.path.join(self.script_data_path, 
                                extension_id,
                                self.format_filename(html_file),
                                "{0}{1}".format(temp_script[3], ".js"))
                            if not os.path.exists(
                                    os.path.dirname(filepath)):
                                os.makedirs(os.path.dirname(filepath))
                            with open(filepath, "w") as f:
                                f.write(temp_script[2])
                            script["filepath"] = filepath
                        else:
                            script["filename"] = os.path.basename(filepath)
                    else:
                        # General relative path javascript
                        script["filepath"] = os.path.join(os.path.dirname(html_file), src)
                script["src"] = src
                script["extensionId"] = extension_id
                script["htmlPath"] = html_file
                script["filetype"] = 1
                # use abspath to remove .. component
                # Otherwise, aa/bb/../cc and aa/cc would be treated 
                # as different filepath
                script["filepath"] = os.path.abspath(script["filepath"])
                scripts.append(script)
        return scripts

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

    def script_from_src(self, src):
        """Prepare a script from src

        :src: TODO
        :returns: TODO

        """
        script_data = None
        try:
            script_url_file = urllib2.urlopen(src, timeout=10)
            script_data = script_url_file.read()
        except (IOError, socket.error) as e:
            pprint(e)
        return script_data

    @classmethod
    def get_extension_id(cls, extension_path):
        """Get extension id from extension path

        :extension_path: TODO
        :returns: TODO

        """
        if not extension_path.endswith("/"):
            extension_path= extension_root_path + "/"
        path = extension_path
        for i in range(2):
            path = os.path.split(path)[0]
        extension_id = os.path.split(path)[1]
        assert re.match("[a-z]{32}", extension_id), "illegal extensionId"
        return extension_id

    @classmethod
    def find_scripts_from_one_file(cls, filepath):
        """Find all the scripts in a html file

        :filepath: Html file path
        :returns: TODO

        """
        # load file
        # html parse
        # extract all scripts
        # generate output
        scripts = []
        try:
            with open(filepath) as html_file:
                file_content = html_file.read()
        except IOError as e:
            logger.error(e)
            raise e
        parser = MyHTMLParser()
        parser.feed(file_content)
        for tag in parser.tags:
            if tag[0] == "script":
                scripts.append(tag)
        return scripts

    @classmethod
    def find_files_with_ext(cls, root_path, file_ext):
        """Find all the files with certain ext under
        ignore files with a name started with "."
        root_path(include child dir)

        :root_path: root path
        :returns: html path list

        """
        html_file_array = []
        for (root, dirs, files) in os.walk(root_path):
            for one_file in files:
                if not one_file.startswith(".") and one_file.endswith(file_ext):
                    html_file_array.append(os.path.join(root, one_file))

        return html_file_array

    def find_html_files(self, root_path):
        """Find all html files under root_path

        :root_path: TODO
        :returns: TODO

        """
        return self.find_files_with_ext(root_path, ".html")

    def find_javascript_files(self, root_path):
        """Find all JavaScript files under root_path

        :root_path: TODO
        :returns: TODO

        """
        return self.find_files_with_ext(root_path, ".js")

    @classmethod
    def getExtensionDetail(cls, extensionId):
        """TODO: Docstring for getExtensionDetail.

        :extensionId: TODO
        :returns: TODO

        """
        # with open(os.path.join(extensionPath, "manifest.json")) as f:
        #     manifest = json.load(f)
        # exName = manifest["name"]
        # exNameInUlr = "-".join(map(lambda s: s.lower(), exName.split(" ")))
        # exDetailUrl = "https://chrome.google.com/webstore/detail/%s/%s" % (exNameInUlr, extensionId)
        exDetailUrl = "https://chrome.google.com/webstore/detail/%s" % extensionId
        logger.info(exDetailUrl)
        ret = {}
        try:
            urlObj = urllib.urlopen(exDetailUrl)
            if urlObj.getcode() != 200:
                logger.error("Url error: %d, %s" % (urlObj.getcode(), exDetailUrl))
                return {"updateTime": "404"}
            detailWebpage = urlObj.read()
        except IOError as e:
            return None
        if len(re.findall("No user rated this item", detailWebpage)) > 0:
            ratedScore = "0"
            numUserRated = 0
        else:
            regStr = "aria-label=\"Average rating (\d(\.\d)*) out of 5.  [^ ]+ users? rated this item\.\">\(([0-9]+)\)"
            # t = re.findall("aria-label=\"Average rating (\d(\.\d)*) out of 5.  ([0-9]{1,3}(,[0-9]{3})*) users rated this item", detailWebpage)
            t = re.findall(regStr, detailWebpage)
            if len(t) == 0:
                return None
            ratedScore = t[0][0]
            numUserRated = int(t[0][2].replace(",",""))
        ret["ratedScore"] = ratedScore
        ret["numUserRated"] = numUserRated

        t = re.findall("<span class=\"[^\"]*\" title=\"([0-9]{1,3}(,[0-9]{3})*) users", detailWebpage)
        if len(t) != 0:
            userNum = int(t[0][0].replace(",", ""))
            ret["userNum"] = userNum
        t = re.findall("Version:</span>&nbsp;<span class=\"[^\"]*\">[^0-9]*(\d+(\.\d+)*)", detailWebpage)
        if len(t) == 0:
            return None
        version = t[0][0]
        ret["version"] = version
        t = re.findall("Updated:</span>&nbsp;<span class=\"[^\"]*\">([^<]*)", detailWebpage)
        if len(t) == 0:
            return None
        updateTime = t[0]
        tmpDate = datetime.strptime(updateTime, "%B %d, %Y")
        updateTime = tmpDate.strftime("%Y-%m-%d")
        ret["updateTime"] = updateTime
        t = re.findall("Size:</span>&nbsp;<span class=\"[^\"]*\">([^<]*)", detailWebpage)
        if len(t) == 0:
            return None
        size = t[0]
        ret["size"] = size
        t = re.findall("Languages?:</span>&nbsp;<span class=\"[^\"]*\">([^<]*)", detailWebpage)
        if len(t) != 0:
            language = t[0].decode("utf8")
            ret["language"] = language
        return ret

        # return {"ratedScore": ratedScore,
        #         "numUserRated": numUserRated,
        #         "userNum": userNum,
        #         "version": version,
        #         "updateTime": updateTime,
        #         "size": size,
        #         "language": language}

class DynamicUtils(Utils):

    """Dynamic extract javascript inclusion in html webpage"""

    def __init__(self, script_folder):
        """init """
        Utils.__init__(self, script_folder)

    def extract_inc_javascript_in_html(self, extension_root_path, crx_path):
        """Extract all the javascript inclusion in html webpages
        :extension_root_path: The source code of extension
        :crx_path: The crx file of the extension, should match extension_root_path.
            After install crx with selenium, an extension_root_path could be found in tmp directory,
            but difficult to get and not used here. 
            TODO: generate extension_root_path with crx_path
        :returns: TODO

        """
        if not extension_root_path.endswith("/"):
            extension_root_path = extension_root_path+"/"
        extension_id = self.get_extension_id(extension_root_path)
        scripts = []
        chrome_options = Options()
        chrome_options.add_extension(crx_path)
        driver = None
        # driver = webdriver.Chrome(chrome_options=chrome_options)
        for html_file in self.find_html_files(extension_root_path):
            if driver is None:
                driver = webdriver.Chrome(chrome_options=chrome_options)
            html_url = html_file.replace(extension_root_path, 
                    "chrome-extension://{eid}/".format(eid=extension_id))
            logger.info("Search js in %s", html_file)
            temp_scripts = self.find_scripts_from_one_file(html_url, driver)
            for temp_script in temp_scripts:
                logger.info("script %s found and to be processed", temp_script)
                script = {}
                src = [x for x in temp_script[1] if x[0] == "src"]
                if len(src) == 1:
                    src = src[0][1]
                else:
                    assert len(src) == 0, "script with more than one src"
                    src = ""
                if re.match("[a-zA-Z]+://.*", src) is not None or src.startswith("//"):
                    # the src is a url or no protocol url
                    script_data = self.script_from_src(src)
                    script_data_path = self.script_data_path
                    if script_data is None:
                        # filepath will be changed to abspath in future, 
                        # add '/' so that it will not be extended
                        script["filepath"] = "/error"
                        script["filename"] = os.path.basename(
                                urlparse.urlparse(src).path)
                    else:
                        filepath = os.path.join(script_data_path, 
                                extension_id,
                                self.format_filename(html_file),
                                self.format_filename(src))
                        filepath = os.path.abspath(filepath)
                        if not os.path.exists(
                                os.path.dirname(filepath)):
                            os.makedirs(os.path.dirname(filepath))
                        if not os.path.isfile(filepath):
                            with open(filepath, 'w') as script_file:
                                script_file.write(script_data)
                        script["filepath"] = filepath
                        script["filename"] = os.path.basename(
                                urlparse.urlparse(src).path)
                else:
                    script["filename"] = os.path.basename(src)
                    if src.startswith("/"):
                        # absolute path to extension
                        script["filepath"] = os.path.join(extension_root_path, src[1:])
                    elif src == "":
                        # inline script
                        if len(temp_script) >= 4:
                            script["filename"] = "inline.js"
                            filepath = os.path.join(self.script_data_path, 
                                extension_id,
                                self.format_filename(html_file),
                                "{0}{1}".format(temp_script[3], ".js"))
                            if not os.path.exists(
                                    os.path.dirname(filepath)):
                                os.makedirs(os.path.dirname(filepath))
                            with open(filepath, "w") as f:
                                f.write(temp_script[2])
                            script["filepath"] = filepath
                        else:
                            script["filename"] = os.path.basename(filepath)
                    else:
                        # General relative path javascript
                        script["filepath"] = os.path.join(os.path.dirname(html_file), src)
                script["src"] = src
                script["extensionId"] = extension_id
                script["htmlPath"] = html_file
                script["filetype"] = 1
                # use abspath to remove .. component
                # Otherwise, aa/bb/../cc and aa/cc would be treated 
                # as different filepath
                script["filepath"] = os.path.abspath(script["filepath"])
                scripts.append(script)
        if driver is not None:
            driver.close()
            driver.quit()
        return scripts

    @classmethod
    def find_scripts_from_one_file(cls, html_url, driver):
        """Find all script from one file

        [['script', [('src', 'options.js')], '\n    ', 0], ['script', [('charset', 'utf-8')], '\n        console.log("logggggg");\n    ', 1, '\n  ', 2, '\n  ', 3]]


        :html_url: TODO
        :driver: chrome driver
        :returns: TODO

        """
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
        seq = 0
        for script in scripts:
            src = script.get_attribute("src")
            if src.startswith("chrome-extension://"):
                # remove the extension root path from src
                # e.g. chrome-extension://abcdabcdabcdabcdabcdabcdabcdabcd/a.js -> a.js
                src = src[len("chrome-extension://") + 32:]
            code = script.get_attribute("innerText")
            retScript = ['script']
            retScript.append([('src', src)])
            retScript.append(code)
            retScript.append(seq)
            seq += 1
            retScripts.append(retScript)
        return retScripts
        


class MyHTMLParser(HTMLParser):

    """Parse HTML file"""

    def __init__(self):
        """init """
        HTMLParser.__init__(self)
        self.tags = []
        self.cur_tag = None
        self.seq = 0

    def handle_starttag(self, tag, attrs):
        self.tags.append([tag, attrs])
        self.cur_tag = tag

    def handle_data(self, data):
        if self.cur_tag == "script":
            self.tags[-1].append(data)
            self.tags[-1].append(self.seq)
            self.seq += 1
