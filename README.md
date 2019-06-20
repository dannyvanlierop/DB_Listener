# DB_Listener

### Prepare :

- Create .config.json in root with the following content:

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


### Target :
- Get all columns from table
- Get the last value from each of this columns
- Emit this column value
