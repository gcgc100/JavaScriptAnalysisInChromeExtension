-- Change downloadStatus to extensionStatus Enum datatype
-- With DBSqlite
-- https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3
ALTER TABLE Extension ADD COLUMN extensionStatus TEXT;
PDATEPDATE Extension SET extensionStatus = 'Downloaded' WHERE downloadStatus = 1;
UPDATE JavaScriptInclusion SET detectMethod = 'Static' WHERE classtype = "ContentScript";
UPDATE JavaScriptInclusion SET detectMethod = 'Static' WHERE classtype = "BackgroundScript";


SELECT * FROM Extension WHERE ExtensionId in (SELECT extensionId FROM Extension WHERE downloadTime like "2021-09-2%" and extensionStatus = "Unpacked")
-- SELECT * FROM Extension WHERE extensionId = "ajelnjmnjnchimodkgnhalconepoiodf"
-- SELECT * FROM Extension WHERE downloadTime like "2021-09-2%" and extensionStatus = "Downloaded"
