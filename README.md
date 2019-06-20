# DB_Listener

_in progress....._

### Environment :
- node v8.16.0
- npm 6.4.1

### Setup :

- Create configuration file ( **.config.json** ) with the following content:

```JSON
{
   "DBhost" : "10.0.0.1",
   "DBport" : 3306,
   "DBname" : "testDB",
   "DBtable": "testTable",
   "DBuser" : "testDB",
   "DBpass" : "TestPass",
   "HTTPport" : 3000
}
```
### Run :

- node ./app.js
- browse to http://127.0.0.1:3000


### Goal :
- Get all Databases.
- Get all Tables from found Databases.
- Get all Columns from found Tables.
- Get the last Value from each Column found.
- Emit this record value to websockets with ColumnName as triggerName.
