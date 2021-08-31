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

import inspect
import sys
import json

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
extAnalysisDir = os.path.join(current_dir, "ExtAnalysis")
sys.path.insert(0, extAnalysisDir) 

from Analyser import Analyser
from OrmDatabase import *

import core.core as core
import core.analyze as analysis

import mylogging
logger = mylogging.logger

class ExtAnaAnalyser(Analyser):

    """Docstring for ExtAnaAnalyser. """

    def __init__(self, db):
        self.chrome_options = Options()
        self.driver = None
        self.headless = True
        Analyser.__init__(self, db)

    def detect(self, extension):
        self.analyseExtension(extension)
        with db_session:
            for js in self.jsFiles:
                jsInc = self._db.JavaScriptInclusion(filepath=js, 
                        extension=extension, 
                        detectMethod=DetectMethod.ExtAnalysis)
            extension.analysedStatus = extension.analyseExtension | AnalysedStatus.ExtAnalysis.value
            self._db.commit()

    def analyseExtension(self, crxFile, reportsDir="./ExtAnalysis/reports", log=False):
        """Analyse the crxFile extension

        :crxFile: TODO
        :returns: TODO

        """
        logger.info("ExtAnalysis anaysis start for {0}".format(crxFile))
        class NullWriter(object):
            def write(self, arg):
                pass

        oldstdout = sys.stdout
        if not log:
            sys.stdout=NullWriter()
        core.updatelog('File Uploaded.. Filename: ' + crxFile)
        anls = analysis.analyze(crxFile)
        sys.stdout = oldstdout
        r = re.match(".*(EXA\d*)", anls)
        reportName = r.group(1)
        reportFileDir = os.path.abspath(os.path.join(reportsDir, reportName, "extanalysis_report.json"))
        self.jsFiles = self.extractAnalysisResult(reportFileDir)
        return self.jsFiles
    
    def analyseExtensionSelenium(self, extension, extAnalysisUrl="http://127.0.0.1:8080/", headless=True, reportsDir="/Users/guanchong/MyDocuments/research/extensionAnalysis/ExtAnalysis/reports"):
        """TODO: Docstring for analyseExtension.

        :extension: TODO
        :extAnalysisUrl: TODO
        :headless: TODO
        :reportsDir: TODO
        :returns: TODO

        """
        logger.info("ExtAnalysis anaysis start for {0}(DBID:{1})".format(extension.extensionId, extension.id))
        self.headless = headless
        self.invokeBrowser(extAnalysisUrl)
        try:
            self.switchTab()
            self.uploadAndAnalyse(extension.crxPath)
            self.jsFiles = self.getAnalysisResult(reportsDir)
            return self.jsFiles
        except Exception as e:
            raise e

    def invokeBrowser(self, url):
        """TODO: Docstring for invokeBrowser.
        :returns: TODO

        """
        if self.headless:
            self.chrome_options.add_argument('--headless')
        self.driver = webdriver.Chrome(chrome_options=self.chrome_options)
        self.driver.get(url)

    def switchTab(self):
        clickButXpath = '//div/div[@id="container"]/div[@id="scan-container"]/div/div/ul/li[@data-tab="tab-2"]'
        self.driver.find_element(By.XPATH, clickButXpath).click()

    def uploadAndAnalyse(self, localCrxDir):
        """TODO: Docstring for uploadAndAnalyse.
        :returns: TODO

        """
        driver = self.driver
        uploadBut = '//div/div[@id="container"]/div[@id="scan-container"]/div/div/div/div[@id="upload-extension"]/form/input'
        ee = driver.find_element(By.XPATH, uploadBut)
        ee.send_keys(localCrxDir)
        analysisBut = '//div/div[@id="container"]/div[@id="scan-container"]/div/div/div/div[@id="upload-extension"]/button[@class="start_scan"]'
        ee = driver.find_element(By.XPATH, analysisBut)
        ee.click()

    def analyseWithExtensionId(self, extensionId):
        """Download crx file and analyse with an extensionId

        :extensionId: TODO
        :returns: TODO

        """
        # Input extension ID
        extInput = driver.find_element_by_id("extension-id")
        extInput.send_keys(extensionId)

        # Click analyse button
        clickButXpath = '//div/div[@id="container"]/div[@id="scan-container"]/div/div/div[@id="tab-0"]/div/button'
        driver.find_element(By.XPATH, clickButXpath).click()
        
        # Input the dir path where new crx file should be saved to 
        fileInputXpath = '//div/div/div[@class="swal-content"]/input'
        Wait(driver, 100).until(EC.presence_of_all_elements_located(
            (By.XPATH, fileInputXpath)))
        driver.find_element(By.XPATH, fileInputXpath).send_keys(extensionId)
        clickButXpath = '//div/div/div[@class="swal-footer"]/div[@class="swal-button-container"]/button'
        driver.find_element(By.XPATH, clickButXpath).click()

    def getAnalysisResult(self, reportsDir):
        """TODO: Docstring for getAnalysisResult.
        :returns: TODO

        """
        driver = self.driver
        ret = []
        xpath = '//div/div[@id="container"]/div/div/div[@id="modal-content"]/center/h3'
        Wait(driver, 1000).until(EC.presence_of_all_elements_located(
            (By.XPATH, xpath)))
        el = driver.find_element(By.XPATH, xpath)
        logger.info(el.text)
        r = re.match(".*(EXA\d*)", el.text)
        reportName = r.group(1)
        print(reportName)
        Wait(driver, 3)

        reportFileDir = os.path.join(reportsDir, reportName, "extanalysis_report.json")
        return self.extractAnalysisResult(reportFileDir)

    def extractAnalysisResult(self, reportFileDir):
        """Extract analysis result from target report file

        :reportFileDir: TODO
        :returns: TODO

        """
        ret = []
        with open(reportFileDir) as f: 
            jsonData = json.load(f)
            jsFiles = jsonData["files"]["js"]
        for jsFile in jsFiles:
            assert(len(jsFile.keys()) == 1)
            ret.append(jsFile.popitem()[1])
        return ret
