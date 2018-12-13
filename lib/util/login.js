'use strict'

module.exports = {

    getAuthUser : function(req, callback){
        let username = req.username;

        //db query.
        
        callback.getUserFailure(err);
        return;

        //callback.getUserSuccess(rows);
    },

    passwordAuthSuccess : function(username){
        //db update to set attempts to 0. 
    },

    passwordAuthFailure : function(username, callback){
        //update table set attempts  = 0 , attempt_timestamp = NULL WHERE username = ?
        callback();
    },

    resetAttemptCount : function(username, callback){
        callback();
    },
}