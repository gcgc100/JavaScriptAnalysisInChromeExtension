#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
A tool sets to manipulate the sqlite database.
"""


import sys
import os
import inspect
import re
import argparse
import socket
import string
import urllib.parse as urlparse
from urllib.request import urlopen

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

@db_session
def checkErrorScipts(db, scriptWarehouse):
    """Check and fix the errors in JavaScriptInclusion table
    (Download the scripts with 404 and 403 under vpn connectiong)
    :returns: 

    """
    scripts = select(s for s in db.JavaScriptInclusion)
    for s in scripts:
        if not s.filepath.startswith("/error"):
            continue
        src = s.url
        if re.match("[a-zA-Z]+://.*", src) is not None or src.startswith("//"):
            script_data = None
            if src.startswith("//"):
                src = "https:{0}".format(src)
            try:
                logger.info(src)
                script_url_file = urlopen(src, timeout=10)
                script_data = script_url_file.read()
            except (IOError, socket.error) as e:
                logger.error(e)
                continue
            if type(script_data) == bytes:
                script_data = script_data.decode("utf-8")

            filename = os.path.basename(
                    urlparse.urlparse(src).path)[:20]

            valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
            formatedFilename = ''.join(c for c in s.htmlPath if c in valid_chars)
            formatedFilename = formatedFilename.replace(' ','_') # I don't like spaces in filenames.
            filepath = os.path.join(scriptWarehouse, 
                    s.extension.extensionId,
                    formatedFilename,
                    filename)
            if not os.path.exists(
                    os.path.dirname(filepath)):
                os.makedirs(os.path.dirname(filepath))
            if not os.path.isfile(filepath):
                with open(filepath, 'w') as script_file:
                    script_file.write(script_data)
            s.filepath = filepath
            logger.info("Get new scripts")


@db_session
def setEXA(db):
    """Set

    :db: database
    :returns: 

    """
    stack = 0
    eList = select(e for e in db.Extension)
    for e in eList:
        print(e.id)
        EXASrc = ""
        for j in e.scripts:
            if j.hash.startswith("EXA"):
                if EXASrc == "":
                    EXASrc = j.hash
                    j.hash = ""
                elif EXASrc == j.hash:
                    j.hash = ""
                    pass
                else:
                    assert(False)
        e.EXALogSrc = EXASrc
        stack = stack + 1
        if stack > 50:
            db.commit()
            print("Commit")
            stack = 0

@db_session
def checkFilepath(db, prefix = "/Volumes/research"):
    """Check filepath

    :db: database
    :returns: 

    """
    stack = 0

    dt = datetime.datetime.strptime("2021-1-1", "%Y-%m-%d")
    jsList = select(j for j in db.JavaScriptInclusion if j.hash != "" and j.extension.downloadTime < dt and j.extension.userNum > 1000 and j.extension.id==12928)

    def getHash(path):
        with open(path) as fp:
            hasher = hashlib.md5()
            hasher.update(fp.read().encode('utf-8'))
            hashStr = hasher.hexdigest()
        return hashStr

    for js in jsList:
        __import__('pdb').set_trace()  # XXX BREAKPOINT
        print(datetime.datetime.now())
        print(js.id)
        print(js.filepath)
        if js.extension.downloadTime > dt:
            if not os.path.isfile(os.path.join(prefix, js.filepath)):
                __import__('pdb').set_trace()  # XXX BREAKPOINT
                pass
        else:
            if js.filepath.startswith("data/extSrc/"):
                filepath = js.filepath[len("data/extSrc/"):]
            if not os.path.isfile(os.path.join(prefix, "extSrc2018", filepath)):
                __import__('pdb').set_trace()  # XXX BREAKPOINT
                pass

@db_session
def checkExtPath(db, prefix = "/Volumes/research"):
    """Check extension path
    :returns: 

    """
    dt = datetime.datetime.strptime("2021-11-1", "%Y-%m-%d")

    eList = select(e for e in db.Extension if e.downloadTime > dt and
            orm.raw_sql("e.extensionStatus=='{0}'".format(ExtensionStatus.Downloaded.name)))[:]
    print(len(eList))
    for e in eList:
        # print(e)
        print(e.crxPath)
        if not os.path.isfile(e.crxPath):
            __import__('pdb').set_trace()  # XXX BREAKPOINT
            e.delete()

    # for js in jsList:
    #     __import__('pdb').set_trace()  # XXX BREAKPOINT
    #     print(datetime.datetime.now())
    #     print(js.id)
    #     print(js.filepath)
    #     if js.extension.downloadTime > dt:
    #         if not os.path.isfile(os.path.join(prefix, js.filepath)):
    #             __import__('pdb').set_trace()  # XXX BREAKPOINT
    #             pass
    #     else:
    #         if js.filepath.startswith("data/extSrc/"):
    #             filepath = js.filepath[len("data/extSrc/"):]
    #         if not os.path.isfile(os.path.join(prefix, "extSrc2018", filepath)):
    #             __import__('pdb').set_trace()  # XXX BREAKPOINT
    #             pass


def main():
    parser = argparse.ArgumentParser("A tool sets to manipulate the sqlite database.")
    cmdChoices = ["checkErrorScripts", "setEXA", "checkFilePath", "checkExtPath"]
    parser.add_argument("cmd",
            choices = cmdChoices,
            help="The command to be used")
    parser.add_argument("--db", default="./data2022/dataV1-2.db", help="sqlite database")
    parser.add_argument("--scriptWH", default="./Volumes/ExtremeSSD/data/scripts", help="Where to save scripts")
    # parser.add_argument("--scriptWH", default="./data2022/scripts", help="Where to save scripts")

    try:
        args = parser.parse_args()
        dbpath = os.path.abspath(args.db)
        db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
        if args.cmd == cmdChoices[0]:
            checkErrorScipts(db, args.scriptWH)
        elif args.cmd == cmdChoices[1]:
            setEXA(db)
        elif args.cmd == cmdChoices[2]:
            checkFilePath(db)
        elif args.cmd == cmdChoices[3]:
            checkExtPath(db)
    except Exception as e:
        print(e)
        sys.exit()

if __name__ == "__main__":
    main()
