var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var Charge = require('../models/charge');


router.get('/', function (req, res) {
    if(req.user === undefined){
    res.render('index', {user:req.user});
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

    Charge.find({completed:false}, function (err,charges){
    	for(transaction in charges){
    		if(charges[transaction]['payer']['username'] === username){ // user is  a payer
    			if(charges[transaction]['recipient']['username'] === undefined) // check if person targetted has an account or no, undefined fs they dont 
					you_owe.push({username:charges[transaction]['recipient'], amount:charges[transaction]['amount']});    				
    			else // they have an account and it pushes to charges that you owe their name
    				you_owe.push({username:charges[transaction]['recipient']['username'], amount:charges[transaction]['amount']});
    		}
    		else if(charges[transaction]['recipient']['username'] === username){ // user is a recipient
    			if(charges[transaction]['payer']['username'] === undefined) // check if the person targetted has an account
    				owe_you.push({username:charges[transaction]['payer'], amount:charges[transaction]['amount']});
    			else // if they have an account it pushes their account username to the array with debts owed to you
    				owe_you.push({username:charges[transaction]['payer']['username'], amount:charges[transaction]['amount']});
	    		
    		}
    	}

    	//console.log(you_owe); // test owe_you and you_owe
    	//console.log(owe_you);

    	res.render('index', {user:req.user, owe_you, you_owe });
    });	
    }
    

    
    
});

router.post('/register', function(req, res) {
    Account.count({username:req.body.username},function(error, count){
        //console.log(req.body);

        Account.register(new Account({ username : req.body.username, first_name: req.body.firstName, last_name: req.body.lastName, email: req.body.email}), req.body.password, function(err, account) { // registers account with initial data passed through the register form, uses express session, passport js, and passport local mongoose
        if (err) { // if there is an error such as a duplicated account or fields left blank. THESE WILL BE DEALT WITH LATER
            console.log("err");
            console.log(err);
            res.render('register', { account : account });
        } else { console.log("successfully added account");
        console.log(account);
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
        }
    });
    })
});

router.get('/login', function(req, res) { 
    res.render('login', { user : req.user });

});

router.post('/login', passport.authenticate('local'), function(req, res) { // logins with passport js
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){ // test function to see if tutorial worked. Link to tutorial here: http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VpqQOhUrKhe
    res.status(200).send("pong!");
});

//search 

router.get('/usersearch',function(req,res){ // this is a function unused for now, but will be used for the dropdown menu when you enter a username into the charge form. Supplies a list of users that begin with the letters entered in by user
    name = req.query.name;
    console.log(name);
    var response_data = [];
    Account.find({}, function (err, docs) {
        for(user in docs){
            console.log("User: " + docs[user]['full_name']);
            if(stringStartsWith(docs[user]['full_name'], name)){
                response_data.push({full_name: docs[user]['full_name'],
                                    username: docs[user]['username']});
            }
        }
        res.send(response_data);
    });


});

function stringStartsWith (string, prefix) { // used by usersearch route, boolean function. Inputs are string (complete string you are testing the prefix against, and prefix is the string you are checking if the input string begins with)
    if(string === undefined)
        return false;
    return string.slice(0, prefix.length) == prefix;
}
module.exports = router;