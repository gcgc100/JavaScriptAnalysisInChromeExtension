#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime
import urllib
import urllib.request
import zipfile

import utils
from OrmDatabase import *
import mylogging
logger = mylogging.logger


def downloadExt(id, name="", save_path=""):
    ext_id = id
    if name == "":
        save_name = ext_id
    else:
        save_name = name
    if save_path == "":
        save_path = "./crxDownloaded"
        # save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/extensionsInCrx")
    # os.makedirs(save_path, exist_ok=True)
    save_path = save_path + "/" + save_name + ".crx"
    logger.debug("Downloader says: save_path is " + save_path)
    # new download URL, issue #13
    dl_url = "https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=81.0.4044.138&acceptformat=crx2,crx3&x=id%3D" + ext_id + "%26uc"
    print("Download URL: " + dl_url)

    try:
        urllib.request.urlretrieve(dl_url, save_path)
        logger.debug("Extension downloaded successfully: " + save_path)
        return save_name
    except urllib.error.HTTPError as e:
        if e.reason == 'error-invalidAppId':
            __import__('pdb').set_trace()  # XXX BREAKPOINT
            with open(os.path.dirname(save_path)+"/unexistExt.md", 'a') as f: 
                f.write(ext_id + "\n")
        else:
            logger.debug("urllib error")
            logger.debug(e)
    except Exception as e:
        logger.debug("Error in downloader.py")
        logger.debug(e)
        return False

def downloadExtList(extList, save_path=""):
    for ext in extList:
        downloadExt(ext)

def unpackExtAndFilldb(eid, crxPath, extSrcPath, db):
    """TODO: Docstring for unpackExtAndFilldb.

    :database: TODO
    :returns: TODO

    """
    with db_session:
        e = db.Extension.get(extensionId = eid, crxPath=crxPath)
        assert(e is not None)
        e.srcPath = extSrcPath
        unpackExtension(crxPath, extSrcPath)

def unpackExtension(crxPath, extSrcPath):
    """TODO: Docstring for unpackExtension.

    :eid: TODO
    :crxPath: TODO
    :returns: TODO

    """
    zip_contents = zipfile.ZipFile(crxPath, 'r')
    zip_contents.extractall(extSrcPath)
    zip_contents.close()

@db_session
def init_database(extensionIdJson, db):
    """init database
    :returns: TODO

    """
    addExtensionId(extensionIdJson, db)

def addExtensionId(extensionIdJson, db):
    """Add the extension id in extensionIdJson file to sqlite database,
    if the extension id is in extensionIdExcluded, it will be ignored

    :dbpath: sqlite database path
    :extensionIdJson: extension id list json file
    :returns: TODO

    """
    with open(extensionIdJson) as f:
        extensionIdList = json.load(f)
    with db_session:
        for extensionId in extensionIdList:
            extension = db.Extension(extensionId=extensionId, 
                    extensionStatus=ExtensionStatus.Init,
                    analysedStatus=0)

@db_session
def setExtensionDetailForOne(extension):
    """Set the detail information for extension

    :eid: TODO
    :returns: TODO

    """
    eid = extension.extensionId
    detail = utils.getExtensionDetail(extension.webstoreUrl)
    if detail is None:
        logger.error("Getting %s detail failed" % eid)
        logger.info("Get extension detail failed")
        ret = 0
    elif type(detail) == int:
        ret = detail
        if ret == 404:
            extension.extensionStatus = ExtensionStatus.UnPublished
    else:
        dateFmtStr = "%Y-%m-%d"
        # __import__('pdb').set_trace()  # XXX BREAKPOINT
        if extension.updateTime is None:
            curUpTime = None
        else:
            curUpTime = extension.updateTime
            # curUpTime = datetime.strptime(extension.updateTime, dateFmtStr)
        if detail["updateTime"] == "404":
            newUpTime = "404"
        else:
            newUpTime = datetime.datetime.strptime(detail["updateTime"], dateFmtStr)
        if  curUpTime is None or newUpTime == "404" or curUpTime < newUpTime:
            detail["updateTime"] = datetime.datetime.strptime(detail["updateTime"], dateFmtStr)
            extension.set(**detail)
            extension.downloadTime = datetime.datetime.now()
            extension.extensionStatus = ExtensionStatus.Detailed
            logger.info("End of getting detail of %s" % eid)
            ret = 1
        elif curUpTime == newUpTime:
            ret = 2
            logger.info("Extension already the newest")
        else:
            logger.warning("The updatetime in database is inconsistence.")
            logger.info("Get extension detail failed")
            ret = 0

    return ret

@db_session
def setPermissionAllPack(extensionCollection, db):
    """TODO: Docstring for setPermissionAllPack.

    :extensionCollection: TODO
    :returns: TODO

    """
    # Unknow error if without this line. 'NoneType' object has no attribute 'cursor'
    if os.path.isdir(extensionCollection):
        for eid in os.listdir(extensionCollection):
            extPath = os.path.join(extensionCollection, eid)
            extension = db.Extension.get(extensionId=eid, srcPath=extPath)
            permissions = extension.getPermissions()
            for p in permissions:
                permission = db.ExtensionPermission.get(permission = p)
                if permission is None:
                    permission= db.ExtensionPermission(permission = p)
                permission.extensions.add(extension)
                extension.permissions.add(permission)
