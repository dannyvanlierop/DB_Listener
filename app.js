#!/usr/bin/env node

//The config file
var config = require('./.config.json');

/***************\
| NodeJS Server |##############################################################
\***************/   //Webserver

var http = require('http');

/* Advanced HTTP server - Read and send index.html file */
var url = require('url');
var fs = require('fs');
var path = require('path');
var baseDirectory = __dirname;   // or whatever base directory you want
server = http.createServer(function (request, response) {

    //console.log(request.url)
    try {

        if (request.url == '/') {
            request.url = '/index.html';
        }
        var requestUrl = url.parse(request.url)

        // need to use path.normalize so people can't access directories underneath baseDirectory
        var fsPath = baseDirectory + path.normalize(requestUrl.pathname)

        var fileStream = fs.createReadStream(fsPath)
        fileStream.pipe(response);
        fileStream.on('open', function () {
            //response.writeHead(200)
            response.writeHead(200, { 'Content-type': 'text/html' });
        })
        fileStream.on('error', function (e) {
            response.writeHead(404);     // assume the file doesn't exist
            response.end();
        })
    } catch (e) {
        response.writeHead(500);
        response.end();     // end the response so browsers don't hang
        //console.log(e.stack)
    }
}).listen(config.HTTPport)
console.log("listening on port " + config.HTTPport)

/**********************\
| Sockets and emitters |#######################################################
\**********************/    //Websockets

var io = require('socket.io').listen(server);

//Emit values on page refresh or first load
io.sockets.on('connection', function (socket) {

    console.log("client connected");
    io.sockets.emit('refresh');
    mysqlInit(); // !!!!!!!!!!!!!!!! CHANGE later, instead of a static value
});

/**************\
| MYSQL Client |###############################################################
\**************/    //SQL Query's

var mysql = require('mysql');
var con = mysql.createConnection({
    multipleStatements: true,
    host: config.DBhost,
    user: config.DBuser,
    password: config.DBpass,
    port: config.DBport,
});

//Init MySQL columns on first website visit or refresh and emit there last value to the socket. 
function mysqlInit() {

    //Get all databases
    function mysqlInitDatabases() {
        mysqlGetDatabases(function (callbackResult) {

            console.log(" USE: ");
            var objectLength = callbackResult.length;
            for (var i = 0; i < objectLength; i++) {

                var DBname = callbackResult[i]["Database"];

                switch (DBname) {
                    //Accept this DBnames
                    case "testDB": ;
                    case "testDB2": ;
                    case "actionHere":
                        console.log(DBname);
                        mysqlInitTables(DBname);
                        break;

                    //Skip this DBname
                    default:
                }
            }
        });
    }
    mysqlInitDatabases();

    function mysqlInitTables(DBname) {
        mysqlGetTables(DBname, function (callbackResult) {

            var objectLength = callbackResult.length;

            for (var i = 0; i < objectLength; i++) {

                var DBtable = callbackResult[i]["TABLE_NAME"];
                console.log(DBtable);

                mysqlInitColumns(DBname, DBtable);
            }
        });
    }

    function mysqlInitColumns(DBname, DBtable) {
        mysqlGetColumns(DBname, DBtable, function (callbackResult) {

            var objectLength = callbackResult.length;

            for (var i = 0; i < objectLength; i++) {

                var DBcolumn = callbackResult[i]["COLUMN_NAME"];
                console.log(DBcolumn);

                mysqlGetValue(DBname, DBtable, DBcolumn);
            }
        });
    }
}

//SQL Query - fetch last value by columnName
function mysqlGetValue(DBname, DBtable, sColumn) {

    //Query = get last value by id from column
    var sql = "SELECT `" + sColumn + "` FROM `" + DBname + "`.`" + DBtable + "` WHERE `" + sColumn + "` IS NOT NULL ORDER BY `" + sColumn + "` DESC LIMIT 1;";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        //Return when we have undefined results (empty cells)
        if (results[0] === undefined) return;

        var itemName = DBname + "_" + DBtable + "_" + sColumn;
        var itemValue = results[0][sColumn];

        console.log("mysqlGetValue -> " + itemName + " = " + itemValue);

        //Emit value to socket
        io.sockets.emit(itemName, itemValue);
    })
}

//SQL Query - fetch all columns in table
function mysqlGetColumns(DBname, DBtable, callback) {

    //Query = get all column names from table
    var sql = "SELECT COLUMN_NAME FROM information_schema.columns WHERE TABLE_SCHEMA = '" + DBname + "' AND TABLE_NAME = '" + DBtable + "';";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        //Get the amount of columns in table
        var objectLength = Object.keys(results).length;

        console.log("mysqlGetColumns -> " + DBname + "_" + DBtable + " " + JSON.stringify(results));

        //Init each columnName/itemName as emiter for client
        for (i = 0; i < objectLength; i++) {
            var columnName = DBname + "_" + DBtable + "_" + results[i]["COLUMN_NAME"];
            io.sockets.emit('init', columnName);
        }

        //return this query results
        return callback(results);
    })
}

function mysqlGetTables(DBname, callback) {
    //Query = get all column names from table
    var sql = "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA ='" + DBname + "';";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        //Object with results
        console.log("mysqlGetTables -> " + DBname + " --> " + JSON.stringify(results));

        //return this query results
        return callback(results);
    })
}

//SQL Query - fetch all databasesnames from server
function mysqlGetDatabases(callback) {
    //Query = get all column names from table
    var sql = "SHOW DATABASES";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        //Object with results
        console.log("mysqlGetDatabases -> " + JSON.stringify(results));

        //return this query results
        return callback(results);
    })
}

/**************\
| MySQL events |###############################################################
\**************/    //Will be triggered on MySQL events

const MySQLEvents = require('@rodrigogs/mysql-events');

const program = async () => {

    const instance = new MySQLEvents({
        host: config.DBhost,
        user: config.DBuser,
        password: config.DBpass,
        port: config.DBport,
    }, {
            serverId: 1,
            startAtEnd: true,
            excludedSchemas: {
                mysql: true,
            },
        });

    await instance.start();

    //add a trigger for sql event (database separated)
    instance.addTrigger({
        name: 'Whole database instance',
        expression: '*',//<-- all databases
        statement: MySQLEvents.STATEMENTS.ALL,
        onEvent: (event) => {

            if(config.DBaccepted.indexOf(event.schema) > -1) //if databaseName exist in config.DBaccepted
            {
                if(config.DBsystem.indexOf(event.schema) === -1) //if databaseName not exist in config.DBsystem
                {
                    for (var k = 0; k < Object.keys(event.affectedColumns).length; k++) //for all columns in event.affectedColumns[]
                    {
                        var emitterName = event.schema + "_" + event.table + "_" + event.affectedColumns[k]; //The emitterName

                        if(config.MySQLEventSkip.indexOf(emitterName) === -1) //if emitterName not exist in config.MySQLEventSkip
                        {
                            process.stdout.write("\n" + k.toString() + " " + emitterName);
                            //mysqlGetValue(event.schema, event.table, event.affectedColumns[k]);
                        }
                    }
                }
            }
        },
    });

    //add a trigger for sql event (database separated)
    //instance.addTrigger({
    //    name: 'Whole database instance',
    //    expression: 'testDB',//<-- database
    //    statement: MySQLEvents.STATEMENTS.ALL,
    //    onEvent: (event) => {
    //        console.log("event.timestamp: " + event.timestamp );
    //    },
    //});

    //MySQLEvents class emits some events related to its MySQL connection and ZongJi instance
    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then(() => console.log('Waiting for database events...'))
    .catch(console.error);