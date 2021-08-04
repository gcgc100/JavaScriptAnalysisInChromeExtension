-- Change downloadStatus to extensionStatus Enum datatype
-- With DBSqlite
-- https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3
ALTER TABLE Extension ADD COLUMN extensionStatus TEXT;
UPDATE Extension SET extensionStatus = 'Downloaded' WHERE downloadStatus = 1;
