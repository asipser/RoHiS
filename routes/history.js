var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var Charge = require('../models/charge');

/* GET users listing. */
router.get('/', function(req, res, next) {
    if(req.user === undefined){
    res.render('history', {user:req.user});
    }
    else{
    username = req.user.username;
	var user_has_venmo; // boolean to see if the req.user has venmo.

    var you_owe = []; // people u owe
    var owe_you = []; // charges with people that owe u


    /*// check to see if  venmo has been  linked with account NOT NEEDED SO FAR
    if(req.user['venmo_id'] === undefined)
    	user_has_venmo = false;
    else
    	user_has_venmo = true;

    //console.log(req.user.username + " has venmo value of " + user_has_venmo);
	*/

    Charge.find({completed:true}, function (err,charges){
    	for(transaction in charges){
    		if(charges[transaction]['payer']['username'] === username){                                                          // user is  a payer
    			if(charges[transaction]['recipient']['username'] === undefined)                                                  // check if person targetted has an account or no, undefined fs they dont 
					you_owe.push({username:charges[transaction]['recipient'], amount:charges[transaction]['amount'], id:charges[transaction]['_id']});    				
    			else                                                                                                             // they have an account and it pushes to charges that you owe their name
    				you_owe.push({username:charges[transaction]['recipient']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id']});
    		}
    		else if(charges[transaction]['recipient']['username'] === username){                                                 // user is a recipient
    			if(charges[transaction]['payer']['username'] === undefined)                                                      // check if the person targetted has an account
    				owe_you.push({username:charges[transaction]['payer'], amount:charges[transaction]['amount'], id:charges[transaction]['_id']});
    			else                                                                                                             // if they have an account it pushes their account username to the array with debts owed to you
    				owe_you.push({username:charges[transaction]['payer']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id']});
	    		
    		}
    	}

    	//console.log(you_owe); // test owe_you and you_owe
    	//console.log(owe_you);

    	res.render('history', {user:req.user, owe_you, you_owe});
    });	
    }

});
    
module.exports = router;
