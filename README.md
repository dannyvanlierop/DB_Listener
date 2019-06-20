# DB_Listener

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
- Get all columns from table
- Get the last value from each of this columns
- Emit this column value to websockets
