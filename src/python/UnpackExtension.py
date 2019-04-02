#!/usr/bin/env python
# -*- coding: utf-8 -*-

import copy
import os
import sys
import pickle
import shutil
import argparse
import time
import platform
# from urlparse import urlparse
import urllib.parse as urlparse
from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

from mylogging import logger


def unpack_extension(crx_filepath, src_dir):
    """Unpack a crx extension file and save the source code to src dir

    :crx_filepath: TODO
    :src_dir:
    :returns: TODO

    """
    default_src = "/tmp/.org.chromium.Chromium.52KIq3/" # TODO default src
    chrome_options = Options()
    crx_filepath = os.path.abspath(crx_filepath)
    chrome_options.add_extension(crx_filepath)
    # chrome_options.add_argument(
    #     "user-data-dir=../data/ChromeProfile")
    driver = webdriver.Chrome(chrome_options=chrome_options)
    time.sleep(2)
    extension_path = get_extension_src_path()
    target_path = os.path.join(src_dir, os.path.basename(extension_path))
    shutil.copytree(extension_path, target_path)
    driver.close()
    driver.quit()

    clear_user_profile(extension_path)
    return target_path

def get_extension_src_path():
    """Return the path of extension source code
    :returns: TODO

    """
    if platform.system() == "Linux":
        all_temp_user_profile = [x for x in os.listdir("/tmp/") \
                if x.startswith(".org.chromium.Chromium")]
        src = None
        if len(all_temp_user_profile) == 0:
            src = None
        elif len(all_temp_user_profile) == 2:
            for profile in all_temp_user_profile:
                profile_src = os.path.join("/tmp", profile)
                extId = [x for x in os.listdir(profile_src) if x.startswith(
                    "extension_")]
                if len(extId) == 1:
                    src = os.path.join(profile_src, extId[0])
        else:
            assert False, "multiple user profiles found in /tmp/"
    else:
        src = None
    return src

def clear_user_profile(profile_path):
    """Clear the temp user profile so that next time create the 
    temp user profile, it is the only one.
    :returns: TODO

    """
    shutil.rmtree(profile_path, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(
            "Unpack a extension crx file into source code")
    parser.add_argument("--crx", help="crx file path")

    try:
        args = parser.parse_args()
        unpack_extension(args.crx, "../data/extSrc/")
    except KeyboardInterrupt as e:
        # Not an error, user wants to stop unpacking.
        sys.exit(2)
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    main()
