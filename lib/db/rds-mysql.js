'use strict'

// mysql package 
let MySQLConnectionManager = require('mysql');
let clientConnectionManager;

module.exports = {
    getConnectionPool: function(db){
        let config = require('config');
        if(typeof clientConnectionManager === 'undefined'){
            clientConnectionManager = MySQLConnectionManager.createPool({
                host : "",
                user : "",
                password : "",
                port : "",
                database : db,
                connectTimeout : 20000,
                acquireTimeout : 30000,
                waitForConnections : true,
                connectionLimit : 25,
                queueLimit : 0
            });//createPoolCluster();
        }

        return clientConnectionManager;
    }
}