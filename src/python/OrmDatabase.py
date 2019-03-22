#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
import hashlib
import datetime

from pony.orm import *

from enum import Enum

db = Database()

DetectMethod = Enum("DetectMethod", ("Dynamic", "Static"))

class Extension(db.Entity):

    """Extension object"""

    crxPath      = Optional(str)
    srcPath      = Optional(str)
    extensionId  = Optional(str)
    category     = Optional(str)
    updateTime   = Optional(datetime.date)
    ratedScore   = Optional(str)
    numUserRated = Optional(int)
    userNum      = Optional(int)
    version      = Optional(str)
    size         = Optional(str)
    language     = Optional(str)
    downloadTime = Optional(datetime.datetime)
    downloadStatus= Optional(int)
    scripts      = Set("JavaScriptInclusion")
    permissions  = Set("ExtensionPermission")


    @property
    def manifest(self):
        # __import__('pdb').set_trace()  # XXX BREAKPOINT
        srcPath = self.srcPath
        subDirs = os.listdir(srcPath)
        if "manifest.json" in subDirs:
            manifestPath = os.path.join(srcPath, "manifest.json")
        elif len(subDirs) == 1:
            srcPath = os.path.join(self.srcPath, subDirs[0])
            subDirs = os.listdir(srcPath)
            if "manifest.json" in subDirs:
                manifestPath = os.path.join(srcPath, "manifest.json")
            else:
                return None
        else:
            return None
        with open(manifestPath) \
                as manifest_file:
            manifest = json.load(manifest_file)
            if type(manifest) == list:
                raise ValueError()
        return manifest

    @property
    def htmlFiles(self):
        return self._find_files_with_ext(".html")

    def _find_files_with_ext(self, file_ext):
        """Find all the files with certain ext in this extension source code

        :file_ext: target file's ext
        :returns: html path list

        """
        html_file_array = []
        for (root, dirs, files) in os.walk(self.srcPath):
            for one_file in files:
                if not one_file.startswith(".") and one_file.endswith(file_ext):
                    html_file_array.append(os.path.join(root, one_file))

        return html_file_array

    def getPermissions(self):
        """TODO: Docstring for getPermissions.
        :returns: TODO

        """
        return self.manifest.get("permissions",[])

    def reset(self):
        """Reset to raw
        :returns: TODO

        """
        self.downloadTime = None
        self.language = ""
        self.updateTime = None
        self.ratedScore = ""
        self.size = ""
        self.userNum = -1 
        self.version = "" 
        self.numUserRated =  -1
        self.downloadStatus = 0

class ExtensionPermission(db.Entity):

    """Docstring for ExtensionPermission. """
    extension = Required(Extension)
    permission = Required(str)
        

class JavaScriptInclusion(db.Entity):

    """Docstring for JavaScriptInclusion. """

    size = Optional(int)
    detectMethod = Required(int)
    filepath = Required(str)
    extension = Required(Extension)
    hash = Optional(str)
    libraries = Set("Library")

    @property
    def filename(self):
        return os.path.basename(self.filepath)

    def setHash(self):
        """Generate the hash for current js inclusion
        :returns: TODO

        """
        if os.path.isfile(self.filepath):
            with open(self.filepath) as fp:
                hasher = hashlib.md5()
                hasher.update(fp.read().encode('utf-8'))
                hashStr = hasher.hexdigest()
        else:
            hashStr = ""
        return hashStr

class ContentScript(JavaScriptInclusion):

    """Docstring for ContentScript. """

    matches = Required(str)
    runAt = Optional(str)

class BackgroundScript(JavaScriptInclusion):

    """Background Script"""


class ExtensionWebpageScript(JavaScriptInclusion):

    """The JavaScriptInclusions in Chrome extension webpages"""

    url = Optional(str)
    htmlPath = Required(str)

class Library(db.Entity):

    """Library Object"""
    version = Optional(str)
    libname = Required(str)
    releaseTime = Optional(datetime.datetime)
    vul = Optional(int)
    scripts = Set(JavaScriptInclusion)
