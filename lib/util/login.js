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
        callback();
    },

    resetAttemptCount : function(username, callback){
        callback();
    }
}