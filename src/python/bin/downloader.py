#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import urllib.request
import re
import argparse
import sys
import os
import json
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from mylogging import logger
from ExtensionUtils import downloadExt
from ExtensionUtils import downloadExtList

# def download(id, name="", save_path="../../data/extensionsInCrx"):
#     ext_id = id
#     if name == "":
#         save_name = ext_id
#     else:
#         save_name = name
#     print('__file__:    ', )
#     save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), save_path)
#     # os.makedirs(save_path, exist_ok=True)
#     save_path = save_path + "/" + save_name + ".crx"
#     logger.debug("Downloader says: save_path is " + save_path)
#     # new download URL, issue #13
#     dl_url = "https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=81.0.4044.138&acceptformat=crx2,crx3&x=id%3D" + ext_id + "%26uc"
#     print("Download URL: " + dl_url)

#     try:
#         urllib.request.urlretrieve(dl_url, save_path)
#         logger.debug("Extension downloaded successfully: " + save_path)
#         return save_name
#     except Exception as e:
#         logger.debug("Error in downloader.py")
#         print(e)
#         return False

# def downloadExtList(extList, save_path=""):
#     for ext in extList:
#         download(ext)

def main():
    parser = argparse.ArgumentParser(
            "Download Chrome extension")
    parser.add_argument("--id", help="Extension id")
    parser.add_argument("--extList", help="Extension id list in a jsonfile")

    try:
        args = parser.parse_args()
        if args.id is not None:
            downloadExt(args.id)
        if args.extList is not None:
            with open(args.extList) as f:
                extensionIdList = json.load(f)
            downloadExtList(extensionIdList)
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    main()
# def downloadFirefox(url):
#     if 'addons.mozilla.org' not in url:
#         core.updatelog('Invalid Firefox addon URL')
#         return False
#     else:
#         try:
#             test = urllib.request.Request(url)
#             test.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0')
#             source = urllib.request.urlopen(test)
#             source_code = source.read().decode('utf-8')
#             xpi_file = re.findall('<a class="Button Button--action AMInstallButton-button Button--puffy" href="(.*?).xpi?', source_code)[0]
#             core.updatelog('Found link for xpi file: ' + xpi_file + '.xpi')
#             name = xpi_file.split('/')[-1]
#             xpi_file += '.xpi'
#             save_path = helper.fixpath(core.lab_path + '/' + name + '.xpi')
#             core.updatelog("Downloader says: save_path is " + save_path)
#             try:
#                 urllib.request.urlretrieve(xpi_file, save_path)
#                 core.updatelog("Extension downloaded successfully: " + save_path)
#                 return name
#             except Exception as e:
#                 core.updatelog("Error while downloading xpi file: " + xpi_file)
#                 print(e)
#                 return False
#         except Exception:
#             core.updatelog('Something went wrong while getting download link for xpi file')
