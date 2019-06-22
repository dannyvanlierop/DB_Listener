# DB_Listener

_in progress....._

### Environment :
- node v8.16.0
- npm 6.4.1

### Setup :

- Create configuration file ( **`.config.json`** ) with the following content:

```JSON
{
   "DBhost" : "10.0.0.1",
   "DBport" : 3306,
   "DBname" : "testDB",
   "DBtable": "testTable",
   "DBuser" : "testDB",
   "DBpass" : "TestPass",
   "HTTPport" : 3000,
   "DBaccepted": [
    "testDB",
    "testDB2",
    ],
    "DBdenied": [
        "mysql",
        "information_schema",
        "performance_schema"
    ],
    "MySQLEventSkip": [
        "testDB1_testTable1_testColumn1"
        "testDB1_testTable1_testColumn2"
        "testDB1_testTable2_testColumn5"
        "testDB1_testTable2_testColumn6"
        "testDB1_testTable3_testColumn9"
        "testDB2_testTable3_testColumn4"
        "testDB2_testTable3_testColumn5"
        "testDB2_testTable3_testColumn6"
        "testDB2_testTable3_testColumn7"
        "testDB3_testTable1_testColumn1"
        "testDB3_testTable1_testColumn2"
        "testDB3_testTable1_testColumn3"
    ]
}
```
### Run :

- node ./app.js`
- browse to http://127.0.0.1:3000 or http://localhost:3000


### Goal :
- Create HTTP socket event listeners ( for all columns in database ) by query the MySQL server :
    - > Get all `Databases`
    - > Get all `Tables` from found `Databases`.
    - > Get all `Columns` from found `Tables`.
    - > Create `emitter` from found information with patern [ `databaseName_tableName_columnName` ]
    - > Init `emitter` value by getting last value from current column(`columnName`), where column(`id`) is `not null` (`desc sorted`).

- Trigger HTTP socket event listener
    - > On MySQLevent when it satisfies by settings in [**`.config.json`**]