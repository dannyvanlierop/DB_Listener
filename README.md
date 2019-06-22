# DB_Listener


### Todo :

- _in progress....._ 
  - Auto generate <`html`></`html`> content  with tags
  - Cleanup files and Finish this Readme

### Environment :
- node v8.16.0
- npm 6.4.1

### Setup :

- Create configuration file ( **`.config.json`** ) with the following content:

```JSON
{
    "System": {
        "ServerOnlineSeconds": true,
        "ServerOnlineSecondsMilli": true
    },
    "WebServer": {
        "HTTPport": 3000
    },
    "Sockets": {
        "Queue": {
            "TimeLimit": 15000
        }
    },
    "MySQL": {
        "Server": {
            "DBhost": "10.0.0.1",
            "DBport": 3306,
            "DBname": "testDB",
            "DBuser": "testDB",
            "DBpass": "TestPassword",
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
    }
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

- Create a socket event listener
    - > On MySQLevent when it satisfies by settings in [**`.config.json`**]

- Collect HTTP socket items and there values to `SocketMessageQueue`
    - > Send the collected items in one request after some `timelimit` or `on add existing key`