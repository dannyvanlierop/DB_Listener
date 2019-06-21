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

mysqlGetDatabases(   //<--- This function finished, do somthing with results(return_Value_DB).
    function(return_Value_DB)
    {
        
        mysqlGetTables(   //<--- This function finished, do somthing with results(return_Value_Table).
            return_Value_DB,
            function(return_Value_Table)
            {
                
                mysqlGetColumns(   //<--- This function finished, do somthing with results(return_Value_Column).
                    return_Value_DB,
                    return_Value_Table,
                    function(return_Value_Column)
                    {
                        //Init each columnName/itemName as emiter for client
                        //io.sockets.emit('init', columnName);//TODO <- Check if this already exist, move the cache variable to server
                        
                        mysqlGetValue(   //<--- This function finished, do somthing with results(return_Value_Cell).
                            return_Value_DB, 
                            return_Value_Table, 
                            return_Value_Column, 
                            function(return_Value_Cell)
                            {

                                process.stdout.write("\n" + return_Value_DB + " -> ");
                                process.stdout.write(return_Value_Table + " -> ");
                                process.stdout.write(return_Value_Column + " -> ");
                                process.stdout.write(return_Value_Cell + " ");
                                //Emit value to socket
                                //io.sockets.emit(itemName, itemValue);//Maybe only emit new values

                            } 
                        )
                    }
                )
            }
        );
    }
);

//SQL Query - fetch all databasesnames from server except the ones that are denied within the config file
function mysqlGetDatabases(return_Value_DB)
{
    //Query = get all databases from host
    var sql = "SHOW DATABASES";

    //Query execute
    con.query(sql, function (err, results) {  //Object.keys(results).length

        //Throw on error
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {

            if(results[i]["Database"] === undefined)
            {
            }
            else{
                if(config.DBdenied.indexOf(results[i]["Database"]) > -1) //if databaseName exist in config.DBdenied
                {
                    //process.stdout.write("\nDatabase " + results[i]["Database"] + " found in config.DBdenied \tSkip item...")
                    delete results[i]["Database"];
                }
                else if(config.DBaccepted.indexOf(results[i]["Database"]) == -1) //if databaseName not exist in config.DBaccepted
                {

                    //process.stdout.write("\nDatabase " + results[i]["Database"] + " not found in config.DBaccepted \tSkip item...")
                    delete results[i]["Database"];
                }
                else {
                    //process.stdout.write("\nFound: " + results[i]["Database"]);
                    return_Value_DB(results[i]["Database"]);

                }
            }
        }
    })
}

function mysqlGetTables(DBname, return_Value_Table) {
    //Query = get all column names from table
    var sql = "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA ='" + DBname + "';";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {  //Object.keys(results).length

            //return this query results
            return_Value_Table(results[i]["TABLE_NAME"]);

        }
    })
}

//SQL Query - fetch all columns in table
function mysqlGetColumns(DBname, DBtable, return_Value_Column) {

    //Query = get all column names from table
    var sql = "SELECT COLUMN_NAME FROM information_schema.columns WHERE TABLE_SCHEMA = '" + DBname + "' AND TABLE_NAME = '" + DBtable + "';";

    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        //if (results[0] === undefined) continue;

        for (i = 0; i < results.length; i++) {  //Object.keys(results).length
            
            return_Value_Column(results[i]["COLUMN_NAME"]);
        }
    })

}

//SQL Query - fetch last value by columnName
function mysqlGetValue(DBname, DBtable, sColumn, return_Value_Cell) {

    //Query = get last value by id from column
    //var sql = "SELECT `" + sColumn + "` FROM `" + DBname + "`.`" + DBtable + "` WHERE `" + sColumn + "` IS NOT NULL ORDER BY `" + sColumn + "` DESC LIMIT 1;";
    var sql = "SELECT `" + sColumn + "` FROM `" + DBname + "`.`" + DBtable + "` WHERE `" + sColumn + "` IS NOT NULL ORDER BY `id` DESC LIMIT 1;";
    console.log(sql);
    //Query execute
    con.query(sql, function (err, results) {

        //Throw on error
        if (err) throw err;

        for (i = 0; i < results.length; i++) {  //Object.keys(results).length

            return_Value_Cell(results[i][sColumn]);    

        }
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

            if(config.DBdenied.indexOf(event.schema) > -1)return;
            else if(config.DBaccepted.indexOf(event.schema) === -1)return;

            for (var k = 0; k < Object.keys(event.affectedColumns).length; k++) //for all columns in event.affectedColumns[]
            {
                var emitterName = event.schema + "_" + event.table + "_" + event.affectedColumns[k]; //The emitterName

                if (config.MySQLEventSkip.indexOf(emitterName) === -1) //if emitterName not exist in config.MySQLEventSkip
                {
                    process.stdout.write("\n" + k.toString() + " " + emitterName + " " + event.timestamp);
                    mysqlGetValue(event.schema, event.table, event.affectedColumns[k],function (callbackResult) { console.log(callbackResult); });
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