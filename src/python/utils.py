#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Basic tools
"""

from html.parser import HTMLParser
import os
import json
import re
import urllib
from urllib.request import urlopen
import socket
import sys
import string
import logging
import subprocess

from datetime import datetime

from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

from pprint import pprint

import mylogging
logger = mylogging.logger
# logger.setLevel(logging.WARNING)

def getExtensionDetail(extensionId):
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
        urlObj = urlopen(exDetailUrl, timeout=30)
        if urlObj.getcode() != 200:
            logger.error("Url error: %d, %s" % (urlObj.getcode(), exDetailUrl))
            return urlObj.getcode()
        detailWebpage = urlObj.read().decode()
    except urllib.error.HTTPError as e:
        logger.error("Get extension detail error:%s" % e)
        return e.getcode()
    except urllib.error.URLError as e:
        logger.error("Get extension detail url error: %s" %e)
        return None
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

    t = re.findall("<span class=\"[^\"]*\" title=\"([0-9]{1,3}(,[0-9]{3})*)(\+)+ users", detailWebpage)
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
        language = t[0]
        ret["language"] = language
    return ret


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

def mitmproxy_start(mitmproxyPath="/home/gc/project/mitmproxy/"):
    """Start the mitmproxy
    :returns: TODO

    """
    curDir = os.getcwd()
    os.chdir(mitmproxyPath)
    p = subprocess.Popen(["./mitmdump"], stdout=subprocess.PIPE)
    os.chdir(curDir)
    return p

def mitmproxy_stop(p):
    """Stop mitmproxy

    :arg1: TODO
    :returns: TODO

    """
    p.send_signal(subprocess.signal.SIGTERM)
