This project is used to download Chrome extensions and extract the JavaScript Inclusions in Chrome extension.
The project is developed with python on ubuntu 16.04 LTS 64bit.
The shell script is tested with bash.

##Usage:
* Install dependency softwares:
    * Chrome
    * git
    * python
    * pip
* Install python modules:
```
pip install selenium
pip install wget
```
```
git clone https://github.com/gcgc100/mypythonlib.git
cd mypythonlib
pip install -e .
```
This is my python utils. Use log and sqliteDB in this project.
* Prepare extension id list. All the extension lists should be saved in json files in data/extensionIdList. The file name will be used as the category of the category.
The default json files are used in my experiment.
Some extension may be updated or unpublished from Chrome web store and my cause error during data collection.
It is better to generate new json files.
* Run the toot-set:
```
make
```
* check the data. All the data will be saved to data directory.
    * crxFiles: the crx files of the Chrome extension
    * extSrc: the source code of the Chrome extesnion
    * archive: All the crx files will be compressed into .zip file and saved in archive.
    * scripts: If a JavaScript inclusion is from remote server, its source code will be downloaded and saved in scripts directory. Some of the files or sub dir names will start with '.', so don't forget to check the hidden files.
    * data.db: the sqlite database file.


###Data
data.db:
* Tables:
    * ExtensionTable: The basic information of the Chrome extensions.
    * FileTable: Basic information of the JavaScript inclusions.
    * ContentScriptTable: ContentScript specific information.
    * JavaScriptInHtmlTable: Specific infomation of JavaScritp inclusions in Chrome extension webpages.
    * PermissionTable: Chrome extension permissions.
    * LibraryInfoTable: The information of different libraries.
    * LibraryTable: The map relation between library and JavaScript includions.


##Test
```
make test
```
Run the project with test data. The collected data will be saved into tests directory.

The python tests code can be used with nosetests.

##Other Things
The library information will not be set automatically.
setTimeForjqueryVersion.sh is used to get the release time of different version of jquery.
getVul.sh is used to tag the vulnerable version of a library.
