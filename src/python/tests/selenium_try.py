#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os

from selenium import webdriver
from selenium.common import exceptions
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_extension("../../data/crxFiles/accessibility/acdccagfnnkklfpgdiinndjeijdjamfj.crx")

driver = webdriver.Chrome(chrome_options=chrome_options)
driver.get("chrome-extension://acdccagfnnkklfpgdiinndjeijdjamfj/popup.html")
import time
time.sleep(20)
driver.close()
driver.quit()
