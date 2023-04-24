#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime
import socket
import urllib
import urllib.request
import zipfile

import utils
from OrmDatabase import *
import mylogging
logger = mylogging.logger

socket.setdefaulttimeout(30)

# Without database operation

def downloadExt(eid, name="", save_path=""):
    """Download extension with eid

    :eid: extensionId
    :name: crx filename. Exclude the crx suffix
    :save_path: The directory used to save extension crx file
    :returns: True ro False, whether succeed

    """
    ext_id = eid
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
    if os.path.isfile(save_path):
        logger.warning("Crx file already exists. Skip the download")
        return True
    # new download URL, issue #13
    dl_url = "https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=81.0.4044.138&acceptformat=crx2,crx3&x=id%3D" + ext_id + "%26uc"
    print("Download URL: " + dl_url)

    try:
        urllib.request.urlretrieve(dl_url, save_path)
        logger.debug("Extension downloaded successfully: " + save_path)
        return save_name
    except urllib.error.HTTPError as e:
        if e.reason == 'error-invalidAppId':
            with open(os.path.dirname(save_path)+"/unexistExt.md", 'a') as f: 
                f.write(ext_id + "\n")
        else:
            logger.warning("urllib error")
            logger.debug(e)
        return False
    except socket.timeout as e:
        #TODO: Make sure the file is removed, otherwise the file left may be not intact.
        logger.warning("Download timeout")
        logger.debug(e)
        return False
    except Exception as e:
        logger.warning("Error in downloader.py")
        logger.debug(e)
        return False

def downloadExtList(extList, save_path=""):
    """Download a list of extensions

    """
    for ext in extList:
        downloadExt(ext)

def unpackExtension(crxPath, extSrcPath):
    """Unpack extension from crx to source codes

    :crxPath: Crx file path
    :extSrcPath: Source code path
    :returns: 

    """
    try:
        zip_contents = zipfile.ZipFile(crxPath, 'r')
        zip_contents.extractall(extSrcPath)
        zip_contents.close()
    except Exception as e:
        logger.error("{0} unzip failed. Error:{1}".format(crxPath, e))


# Including database operation
@db_session
def init_database(db, extensionIdJson):
    """init database
    :returns: 

    """
    addExtensionId(db, extensionIdJson)

def addExtensionId(db, extensionIdJson):
    """Add the extension id in extensionIdJson file to sqlite database,
    if the extension id is in extensionIdExcluded, it will be ignored

    :dbpath: sqlite database path
    :extensionIdJson: extension id list json file
    :returns: 

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

    :extension
    :returns: 

    """
    assert extension.extensionStatus == ExtensionStatus.Init
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
            extension.downloadTime = datetime.datetime.now()
    else:
        dateFmtStr = "%Y-%m-%d"
        detail["updateTime"] = datetime.datetime.strptime(detail["updateTime"], dateFmtStr)
        extension.set(**detail)
        extension.extensionStatus = ExtensionStatus.Detailed
        logger.info("End of getting detail of %s" % eid)
        ret = 1
    return ret

@db_session
def setPermissionAllPack(db):
    """Set the permissions for all extensions in database

    :db: database 
    :returns: 

    """
    exts = select(e for e in db.Extension if 
            orm.raw_sql("e.extensionStatus=='{0}'".format(ExtensionStatus.Unpacked.name)))
    counter = 0
    for extension in exts:
        if len(extension.permissions) > 0:
            logger.warning("Set permissions failed since already setted")
            continue
        logger.info("Start to set permissions for extension:{0}".format(extension.extensionId))
        try:
            permissions = extension.getPermissions()
        except Exception as e:
            logger.error("Extension {0}, set permissions failed. {1}".format(extension.extensionId, e))
            continue
        i1 = 0
        i2 = 0
        for p in permissions:
            # if extension.extensionId.startswith("dajojohmji"):
            #     __import__('pdb').set_trace()  # XXX BREAKPOINT
            p = str(p)
            if p == "":
                continue
            permission = db.ExtensionPermission.get(permission = p)
            i1 += 1
            if permission is None:
                permission= db.ExtensionPermission(permission = p)
                i2 += 1
            permission.extensions.add(extension)
            extension.permissions.add(permission)
        extension.extensionStatus = ExtensionStatus.PermissionSetted
        counter += 1
        if counter > 100:
            # Commit every time is too slow. Just one commit may be rolled back since an error.
            db.commit()
            counter = 0
        logger.info("{0} permissions({1} new) setted for extension:{2}".format(i1, 
            i2, extension.extensionId)) 

def selectExtension(db):
    """Select the extensions which need to be handle

    :db: database
    :returns: 

    """
    eList = []
    exts = select((e.extensionId, max(e.downloadTime)) for e in db.Extension)
    for e in exts:
        # extensions = select(ex for ex in db.Extension if ex.extensionId==e[0])
        # extension = list(filter(lambda x: x.downloadTime==e[1], extensions))[0]
        # orm.sql_debug(True)
        if e[1] is None:
            extensions = select(ex for ex in db.Extension if ex.extensionId==e[0])
        else:
            extensions = select(ex for ex in db.Extension if ex.extensionId==e[0] and
                    orm.raw_sql("ex.downloadTime ='{0}'".format(e[1])))
        extension = extensions.get()
        if extension is None:
            return
        if extension.extensionStatus not in [ExtensionStatus.Init, ExtensionStatus.LibSet]:
            continue
        if extension.extensionStatus == ExtensionStatus.UnPublished:
            continue
        if extension.extensionStatus == ExtensionStatus.ExtensionChecked:
            continue
        if extension.extensionStatus == ExtensionStatus.NetworkTimeout:
            continue
        yield extension
    # eList = select(extension for extension in db.Extension 
    #         if (extension.extensionId, extension.downloadTime) in ((
    #             e.extensionId, max(e.downloadTime)) for e in db.Extension
    #         if orm.raw_sql("e.extensionStatus!='{0}'".format(
    #             ExtensionStatus.UnPublished.name))) or
    #         orm.raw_sql("extension.extensionStatus='{0}'".format(
    #                 ExtensionStatus.Init.name)))

@db_session
def setDetailAndDownloadInDB(db, crxDir, checkNewVersion=False, setChecked=False):
    """Set detail and download the extension crx file

    :db: database
    :crxDir: The directory used to save crxFiles
    :checkNewVersion: Ignore the downloaded extensions? False: ignore
    :setChecked: Tag the extensions already the newest and do not check next time.
                 Used when we can not go through the database in one time. 
    :returns: 

    """
    eList = selectExtension(db)
    commitCache = 0
    commitCacheSize = 1
    for extension in eList:
        eid = extension.extensionId
        logger.info("Start to check Extension({0},status:{1}".format(
            eid,
            extension.extensionStatus.name))
        with db_session:
            try:
                if extension.extensionStatus in [ExtensionStatus.Detailed, ExtensionStatus.Downloaded, ExtensionStatus.Unpacked, ExtensionStatus.PermissionSetted, ExtensionStatus.ExtensionChecked, ExtensionStatus.UnPublished]:
                    pass
                elif extension.extensionStatus == ExtensionStatus.Init:
                    retCode = setExtensionDetailForOne(extension)
                    if retCode == 1:
                        standardCrxPath = extension.standardCrxPath(crxDir)
                        crxDirTmp = os.path.dirname(standardCrxPath)
                        os.makedirs(crxDirTmp, exist_ok=True)
                        # Remove .crx by [:-4]
                        fileName = os.path.basename(standardCrxPath)[:-4]
                        ret = downloadExt(eid, name=fileName, save_path=crxDirTmp)
                        if not ret:
                            continue
                        extension.downloadTime = datetime.datetime.now()
                        extension.crxPath = standardCrxPath
                        extension.extensionStatus = ExtensionStatus.Downloaded
                    elif retCode == 404:
                        # When 404, set extensionStatus to unpublished
                        logger.info("\x1b[33;21mExtension get detail failed,"
                                "set unpublished\x1b[0m")
                        commitCache = commitCache + 1
                        if commitCache >= commitCacheSize:
                            db.commit()
                            commitCache = 0
                elif extension.extensionStatus == ExtensionStatus.LibSet and checkNewVersion:
                    newExt = db.Extension(extensionId = extension.extensionId)
                    newExt.analysedStatus = 0
                    newExt.extensionStatus = ExtensionStatus.Init
                    newExt.downloadTime = datetime.datetime.now()
                    retCode = setExtensionDetailForOne(newExt)
                    if retCode == 1:
                        if newExt.version == extension.version:
                            if setChecked:
                                logger.info("\x1b[33;21mExtension already the "
                                        "newest version, setChecked\x1b[0m")
                                newExt.extensionStatus = ExtensionStatus.ExtensionChecked
                                newExt.downloadTime = datetime.datetime.now()
                                commitCache = commitCache + 1
                                if commitCache >= commitCacheSize:
                                    db.commit()
                                    commitCache = 0
                            else:
                                newExt.delete()
                        else:
                            standardCrxPath = newExt.standardCrxPath(crxDir)
                            crxDirTmp = os.path.dirname(standardCrxPath)
                            os.makedirs(crxDirTmp, exist_ok=True)
                            # Remove .crx by [:-4]
                            fileName = os.path.basename(standardCrxPath)[:-4]
                            ret = downloadExt(eid, name=fileName, save_path=crxDirTmp)
                            if not ret:
                                newExt.delete()
                            else:
                                newExt.downloadTime = datetime.datetime.now()
                                newExt.crxPath = standardCrxPath
                                newExt.extensionStatus = ExtensionStatus.Downloaded
                                logger.info("\x1b[33;21mNew version founded "
                                        "for Extension({0} \x1b[0m".format(
                                    newExt.extensionId))
                                commitCache = commitCache + 1
                            if commitCache >= commitCacheSize:
                                db.commit()
                                commitCache = 0
                    elif retCode == 404:
                        # When 404, set extensionStatus to unpublished
                        logger.info("\x1b[33;21mExtension get detail failed,"
                                "set unpublished\x1b[0m")
                        commitCache = commitCache + 1
                        if commitCache >= commitCacheSize:
                            db.commit()
                            commitCache = 0
                    else:
                        if setChecked:
                            logger.info("\x1b[33;21mExtension get detail failed,"
                                    "setNetworkTimeout\x1b[0m")
                            newExt.extensionStatus = ExtensionStatus.NetworkTimeout
                            newExt.downloadTime = datetime.datetime.now()
                            commitCache = commitCache + 1
                            if commitCache >= commitCacheSize:
                                db.commit()
                                commitCache = 0
                        else:
                            newExt.delete()
                elif extension.extensionStatus == ExtensionStatus.UnPublished:
                    pass
                elif extension.extensionStatus == ExtensionStatus.ExtensionChecked:
                    pass
                elif extension.extensionStatus == ExtensionStatus.LibSet:
                    pass
                else:
                    assert False, "Unknown extension status with solution"
            except Exception as e:
                logger.error(e)
                db.rollback()
                continue
