var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var Charge = require('../models/charge');
var moment = require('moment');
moment().format();

/* GET users listing. */
router.get('/', function(req, res, next) {
    if(req.user === undefined){
    res.render('history', {user:req.user});
    }
    else {
    username = req.user.username;
	var user_has_venmo; // boolean to see if the req.user has venmo.

    var history_you_owe = []; // people u owe
    var history_owe_you = []; // charges with people that owe u
    var cancelled_you_owe = [];
    var cancelled_owe_you = [];


    /*// check to see if  venmo has been  linked with account NOT NEEDED SO FAR
    if(req.user['venmo_id'] === undefined)
    	user_has_venmo = false;
    else
    	user_has_venmo = true;

    //console.log(req.user.username + " has venmo value of " + user_has_venmo);
	*/

    Charge.find({completed:true}, function (err,charges){
    	for (transaction in charges){

            var who_completed;
            var creator;

            if (charges[transaction]['who_completed'] === username) {
                who_completed = "you";
            } else {
                who_completed = charges[transaction]['who_completed'];
            }

            if (charges[transaction]['creator'] === username) {
                creator = "you";
            } else {
                creator = charges[transaction]['creator'];
            }

            var date_created = moment(charges[transaction]['date_created']).format("M/D/YY, h:mm a");
            var date_completed = moment(charges[transaction]['date_completed']).format("M/D/YY, h:mm a");

    		if(charges[transaction]['payer']['username'] === username){                                                          // user is  a payer
    			if(charges[transaction]['recipient']['username'] === undefined)                                                  // check if person targetted has an account or no, undefined fs they dont 
					history_you_owe.unshift({username:charges[transaction]['recipient'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_completed: who_completed, creator: creator, date_created: date_created, date_completed: date_completed});    				
    			else                                                                                                             // they have an account and it pushes to charges that you owe their name
    				history_you_owe.unshift({username:charges[transaction]['recipient']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_completed: who_completed, creator: creator, date_created: date_created, date_completed: date_completed});
    		}
    		else if (charges[transaction]['recipient']['username'] === username){                                                 // user is a recipient
    			if(charges[transaction]['payer']['username'] === undefined)                                                      // check if the person targetted has an account
    				history_owe_you.unshift({username:charges[transaction]['payer'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_completed: who_completed, creator: creator, date_created: date_created, date_completed: date_completed});
    			else                                                                                                             // if they have an account it pushes their account username to the array with debts owed to you
    				history_owe_you.unshift({username:charges[transaction]['payer']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_completed: who_completed, creator: creator, date_created: date_created, date_completed: date_completed});
	    		
    		}
    	}

        Charge.find({cancelled:true}, function (err,charges){
        for(transaction in charges) {

            var who_cancelled;
            var creator;

            if (charges[transaction]['who_cancelled'] === username) {
                who_cancelled = "you";
            } else {
                who_cancelled = charges[transaction]['who_cancelled'];
            }

            if (charges[transaction]['creator'] === username) {
                creator = "you";
            } else {
                creator = charges[transaction]['creator'];
            }

            var date_created = moment(charges[transaction]['date_created']).format("M/D/YY, h:mm a");
            var date_cancelled = moment(charges[transaction]['date_cancelled']).format("M/D/YY, h:mm a");

            if (charges[transaction]['payer']['username'] === username) {                                                          // user is  a payer
                if(charges[transaction]['recipient']['username'] === undefined) {                                                // check if person targetted has an account or no, undefined fs they dont 
                    cancelled_you_owe.unshift({amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_cancelled: who_cancelled, creator: creator, date_created: date_created, date_cancelled: date_cancelled}); 
                }                  
                else {                                                                                                            // they have an account and it pushes to charges that you owe their name
                    cancelled_you_owe.unshift({amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_cancelled: who_cancelled, creator: creator, date_created: date_created, date_cancelled: date_cancelled});
                }
            }

            else if (charges[transaction]['recipient']['username'] === username) {                                                 // user is a recipient
                if(charges[transaction]['payer']['username'] === undefined)                                                      // check if the person targetted has an account
                    cancelled_owe_you.unshift({amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_cancelled: who_cancelled, creator: creator, date_created: date_created, date_cancelled: date_cancelled});
                else                                                                                                             // if they have an account it pushes their account username to the array with debts owed to you
                    cancelled_owe_you.unshift({amount:charges[transaction]['amount'], id:charges[transaction]['_id'], who_cancelled: who_cancelled, creator: creator, date_created: date_created, date_cancelled: date_cancelled});
                
            }
        }

    	res.render('history', {user:req.user, history_owe_you, history_you_owe, cancelled_owe_you, cancelled_you_owe});

        });	
    });
    }
});
    
module.exports = router;
