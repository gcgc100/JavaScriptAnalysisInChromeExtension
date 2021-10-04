#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
import urllib.parse as urlparse
import re
import socket

from pony.orm import *
from Analyser import Analyser
from OrmDatabase import *

import mylogging
logger = mylogging.logger

import utils

class StaticAnalyser(Analyser):

    """Static analyse an extension"""

    def __init__(self, db):
        """TODO: to be defined. """
        Analyser.__init__(self, db)

    def detect(self, extension, script_folder):
        """Detect the JavaScriptInclusions in the extension with static method

        :extension: TODO
        :returns: TODO

        """
        assert extension.analysedStatus & AnalysedStatus.Static.value == 0
        logger.info("Static analysing")
        retScripts = []
        scripts = self.detect_background_scripts(extension)
        retScripts.extend(scripts)
        scripts = self.detect_content_scripts(extension)
        retScripts.extend(scripts)
        scripts = self.detect_javascript_in_html(extension, script_folder)
        retScripts.extend(scripts)
        extension.analysedStatus = extension.analysedStatus | AnalysedStatus.Static.value
        return retScripts
    
    @db_session
    def detect_background_scripts(self, extension):
        """Detect all background scripts in extension and set the scripts property in extension

        :extension: Must be Extension object

        """
        db = self._db
        scripts = []
        for background_script in extension.manifest.get("background", {}).get("scripts", []):
            if background_script.startswith("/"):
                # absolute path to extension
                filepath = os.path.join(extension.srcPath, background_script[1:])
            else:
                filepath = os.path.join(extension.srcPath, background_script)
            filepath = os.path.normpath(filepath)
            script = db.BackgroundScript(extension = extension,
                    filepath = filepath,
                    detectMethod = DetectMethod.Static)
            script.hash = script.setHash()
            scripts.append(script)
        return scripts

    @db_session
    def detect_content_scripts(self, extension):
        """Detect all ContentScripts in extension and set the scripts property in extension

        :extension: Must be Extension object

        """
        db = self._db
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
                filepath = os.path.normpath(filepath)
                script = db.ContentScript(extension = extension,
                        filepath = filepath,
                        detectMethod = DetectMethod.Static,
                        matches = matches,
                        runAt = runAt)
                script.hash = script.setHash()
                scripts.append(script)
        return scripts

    @db_session
    def detect_javascript_in_html(self, extension, script_folder):
        """Detect all JavaScripts in html webpages with static method and set the scripts property in extension

        :extension: Must be Extension object

        """

        db = self._db
        retScripts = []
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
                logger.info("script %s found and to be processed", str(temp_script)[10:50])
                # temp_script format demo: ['script', [('src', '../lib/js/proto.js')], '\n    ', 0]
                #TODO: use filter
                #TODO: Remove the parameters in url when change it to filepath
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
                elif re.match("[a-zA-Z]+://.*", src) is not None:
                    # the src is a url or no protocol url
                    try:
                        script_data = self.script_from_src(src)
                    except socket.error as e:
                        script_data = None
                        err = e
                    script_data_path = script_folder
                    if script_data is None:
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
                                self.format_filename(html_file),
                                self.format_filename(src),
                                filename)
                        filepath = os.path.normpath(filepath)
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
                            filepath = "/inline.js"
                    else:
                        # General relative path javascript
                        filepath = os.path.join(os.path.dirname(html_file), src)
                # use normpath to remove .. component
                # Otherwise, aa/bb/../cc and aa/cc would be treated 
                # as different filepath
                filepath = os.path.normpath(filepath)
                script = db.ExtensionWebpageScript(extension = extension,
                        filepath = filepath,
                        detectMethod = DetectMethod.Static,
                        htmlPath = html_file)
                script.hash = script.setHash()
                script.url = src
                retScripts.append(script)
        return retScripts

