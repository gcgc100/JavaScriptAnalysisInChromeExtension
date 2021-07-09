#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait as Wait
from selenium.common.exceptions import TimeoutException

from OrmDatabase import *
import mylogging
logger = mylogging.logger


def analyseExtension(extension, headless=True):
    logger.info("Tarnish anaysis start for {0}(DBID:{1})".format(extension.extensionId, extension.id))
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    driver = webdriver.Chrome(chrome_options=chrome_options)
    URL = 'https://thehackerblog.com/tarnish/#'
    driver.get(URL)

    try:
        # 定位浏览器扩展地址输入框并输入浏览器扩展地址
        extInput = driver.find_elements_by_tag_name("input")
        assert(len(extInput) == 1)
        extInput[0].send_keys(extension.webstoreUrl)
        #定位分析按钮并点击
        driver.find_element_by_css_selector("body > nav > ul > li > a").click()
    except Exception as e:
        print("非法输入")
        raise e
    try:
        ret = []
        Wait(driver, 100).until(EC.presence_of_all_elements_located((By.XPATH, '//*[@id="main"]/div/main/div/div[1]/div[1]')))

        xpath = '//*[@id="main"]/div/nav/div/ul[3]/li[@class="nav-item known-vulnerable-libraries-nav"]'
        elem = driver.find_element(By.XPATH, xpath)
        r = re.match("Known Vulnerable Libraries( (\d+))?",  elem.text)
        vulCount = r.group(2)
        if vulCount is None:
            logger.info("No vulnerable library found")
            pass
        else:
            vulCount = int(vulCount)
            if vulCount == 0:
                logger.info("No vulnerable library found")
                return
            # if vulCount > 1:
            #     pass
            #     __import__("nose").tools.set_trace()
            logger.info("{0} vulnerable libraries found".format(vulCount))
            elem.click()
            # TODO: Extract multiple vulnerable
            elList = driver.find_elements(By.XPATH, '//*[@id="main"]/div/main/div[@class="known-vulnerable-libraries-dashboard"]/div/div[@class="card border-secondary mb-3"]')
            for el in elList:
                libnameWithVersion = el.find_element_by_class_name("card-title").text
                r = re.match("(\w+) (\d+(\.\d+)*)", libnameWithVersion)
                libname = r.group(1)
                libversion = r.group(2)
                lib = {"libname": libname, "version": libversion}
                loc = el.find_element(By.XPATH, '//div/div/div/p/code').text
                js = {"filepath": loc, "library":lib}
                ret.append(js)
            pass
        return ret
    except TimeoutException as e:
        logger.info("Analysis timeout")
    finally:
        if driver is not None:
            driver.close()
            driver.quit()
