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
from ExtensionUtils import unpackExtension


def main():
    parser = argparse.ArgumentParser(
            "Download Chrome extension")
    parser.add_argument("--id", help="Extension id")
    parser.add_argument("--extList", help="Extension id list in a jsonfile")
    parser.add_argument("--unpack")

    try:
        args = parser.parse_args()
        if args.id is not None:
            downloadExt(args.id)
        if args.extList is not None:
            with open(args.extList) as f:
                extensionIdList = json.load(f)
            downloadExtList(extensionIdList)
        if args.unpack is not None:
            os.makedirs("./ext", exist_ok=True)
            unpackExtension(args.unpack, "./ext")
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
