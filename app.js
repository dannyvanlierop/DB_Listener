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
//var emitterCollection = [];

//Emit values on page refresh or first load
io.sockets.on('connection', function (socket)
{
    process.stdout.write("\nclient connected");

    process.stdout.write("\nmysqlInit");
    mysqlInit();
    
    io.sockets.emit('refresh');
});

function emitterUpdate(emitterName, emitterValue)
{
    process.stdout.write("\n Socket Emitter Update -> [ " + emitterName + " ] ");
    io.sockets.emit('init', emitterName);
    io.sockets.emit(emitterName, emitterValue);
}

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
function mysqlInit()
{
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
                            var emitterName = return_Value_DB + "_" + return_Value_Table + "_" + return_Value_Column;
                            if(config.MySQLEventSkip.indexOf(emitterName) === -1)
                            {       
                                mysqlGetValue(   //<--- This function finished, do somthing with results(return_Value_Cell).
                                    return_Value_DB, 
                                    return_Value_Table, 
                                    return_Value_Column, 
                                    function(return_Value_Cell)
                                    {
                                        process.stdout.write(" -> ( " + return_Value_Cell + " ) ");
                                    } 
                                )
                            }
                        }
                    )
                }
            );
        }
    );
}

//SQL Query - fetch all databasesnames from server except the ones that are denied within the config file
function mysqlGetDatabases(return_Value_DB)
{
    //Query execute = get all databases from host
    con.query("SHOW DATABASES", function (err, results)  //Object.keys(results).length
    {
        if (err) throw err;//Throw on error

        for (var i = 0; i < results.length; i++) {//Object.keys(results).length

            if(results[i]["Database"] === undefined)
            {
            }
            else{
                if(config.DBdenied.indexOf(results[i]["Database"]) > -1) //if databaseName exist in config.DBdenied
                {
                    delete results[i]["Database"];
                }
                else if(config.DBaccepted.indexOf(results[i]["Database"]) == -1) //if databaseName not exist in config.DBaccepted
                {
                    delete results[i]["Database"];
                }
                else
                {
                    return_Value_DB(results[i]["Database"]); //Callback query result item

                }
            }
        }
    })
}
//SQL Query - fetch all tables by database
function mysqlGetTables(DBname, return_Value_Table)
{    
    var sql = "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA ='" + DBname + "';";//Query = get all column names from table

    con.query(sql, function (err, results) {//Query execute

        if (err) throw err;//Throw on error

        for (var i = 0; i < results.length; i++)//Object.keys(results).length
        {  
            return_Value_Table(results[i]["TABLE_NAME"]); //Callback query result item
        }
    })
}
//SQL Query - fetch all columns by database and table
function mysqlGetColumns(DBname, DBtable, return_Value_Column)
{
    var sql = "SELECT COLUMN_NAME FROM information_schema.columns WHERE TABLE_SCHEMA = '" + DBname + "' AND TABLE_NAME = '" + DBtable + "';";//Query = get all column names from table

    con.query(sql, function (err, results) {//Query execute

        if (err) throw err;//Throw on error

        for (i = 0; i < results.length; i++)//Object.keys(results).length
        {   
            return_Value_Column(results[i]["COLUMN_NAME"]); //Callback query result item
        }
    })

}
//SQL Query - fetch (last-by-id-column) cellValue by database, table and column
function mysqlGetValue(DBname, DBtable, sColumn, return_Value_Cell)
{
    var sql = "SELECT `" + sColumn + "` FROM `" + DBname + "`.`" + DBtable + "` WHERE `" + sColumn + "` IS NOT NULL ORDER BY `id` DESC LIMIT 1;";//Query = get last value by id from column
    
    con.query(sql, function (err, results) {//Query execute

        if (err) throw err;//Throw on error

        for (i = 0; i < results.length; i++)
        {
            //Emit value to socket
            emitterUpdate(DBname + "_" + DBtable + "_" + sColumn, results[i][sColumn]);
            return_Value_Cell(results[i][sColumn]); //Callback query result item
        }
    })
}

/**************\
| MySQL events |###############################################################
\**************/    //Will be triggered on MySQL events

const MySQLEvents = require('@rodrigogs/mysql-events');

const MySQLEventsInit = async () => {

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

            for (var iPos = 0; iPos < event.affectedColumns.length; iPos++) //for all columns in event.affectedColumns[]
            {
                var emitterName = event.schema + "_" + event.table + "_" + event.affectedColumns[iPos]; //The emitterName
                if (config.MySQLEventSkip.indexOf(emitterName) < 0) //if emitterName not exist in config.MySQLEventSkip
                {
                    mysqlGetValue(   //<--- This function finished, do somthing with results(return_Value_Cell).
                        event.schema, 
                        event.table, 
                        event.affectedColumns[iPos],
                        function (return_Value_Cell) { 
                            delete return_Value_Cell; //Useless :)
                    });
                }
            }
        },
    });
    
    //MySQLEvents class emits some events related to its MySQL connection and ZongJi instance
    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

MySQLEventsInit()
    .then(() => console.log('Waiting for database events...'))
    .catch(console.error);