#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
import hashlib
import datetime

from pony import orm
from pony.orm import *
from pony.orm.dbapiprovider import StrConverter

from enum import Enum


DetectMethod = Enum("DetectMethod", ("Dynamic", "Static", "Tarnish", "ExtAnalysis"))

class ExtensionStatus(Enum):
    Init = 1 
    Detailed = 2
    Downloaded = 3
    Unpacked = 4
    UnPublished = 5
    PermissionSetted = 6

    # For temp check when the extension list is very big
    ExtensionChecked = 100

class AnalysedStatus(Enum):
    Static = 1 << 0
    Dynamic = 1 << 1
    Tarnish = 1 << 2
    ExtAnalysis = 1 << 3
        

class EnumConverter(StrConverter):

    def validate(self, val, obj=None):
        if not isinstance(val, Enum):
            raise ValueError('Must be an Enum.  Got {}'.format(type(val)))
        return val

    def py2sql(self, val):
        return val.name

    def sql2py(self, value):
        # Any enum type can be used, so py_type ensures the correct one is used to create the enum instance
        return self.py_type[value]


def define_database_and_entities(**db_params):
    db = Database(**db_params)

    db.provider.converter_classes.append((Enum, EnumConverter))

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
        extensionStatus = Optional(ExtensionStatus)
        analysedStatus = Optional(int)
        scripts      = Set("JavaScriptInclusion")
        permissions  = Set("ExtensionPermission")

        def __str__(self):
            return "id:{0}, version:{1}, dtime:{2}".format(self.extensionId,
                    self.version,
                    self.downloadTime)
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
        def webstoreUrl(self):
            return "https://chrome.google.com/webstore/detail/%s" % self.extensionId

        @property
        def htmlFiles(self):
            return self._find_files_with_ext(".html")

        def generateCrxPath(self, crxRootDir):
            return os.path.join(crxRootDir, self.extensionId, self.version.replace(".", "-"))

        def generateExtSrcPath(self, extSrcRootDir):
            return os.path.join(extSrcRootDir, self.extensionId, self.version.replace(".", "-"))

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

        def standardCrxPath(self, prefix=""):
            """Return a standard crxpath like 
            '{prefix}/{extensionId}/{version in (\d-\d-\d) format}

            :withPrefix: TODO
            :returns: TODO

            """
            return os.path.join(prefix, self.extensionId, 
                    "{0}.crx".format(self.version.replace(".", "-")))

        def standardExtSrcPath(self, prefix=""):
            """Return a standard crxpath like 
            '{prefix}/{extensionId}/{version in (\d-\d-\d) format}

            :withPrefix: TODO
            :returns: TODO

            """
            return os.path.join(prefix, self.extensionId, self.version.replace(".", "-"))

        def getPermissions(self):
            """Output all permissions based on the manifest.json in source code
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
            self.extensionStatus = ExtensionStatus.Init
            self.analysedStatus = 0

    class ExtensionPermission(db.Entity):

        """Docstring for ExtensionPermission. """
        extensions = Set("Extension")
        permission = Required(str)
            

    class JavaScriptInclusion(db.Entity):

        """Docstring for JavaScriptInclusion. """

        size = Optional(int)
        detectMethod = Optional(DetectMethod)
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

    db.generate_mapping(create_tables=True)
    return db
