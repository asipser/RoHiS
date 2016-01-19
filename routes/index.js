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
    		if(charges[transaction]['payer']['username'] === username){ // user has venmo and is payer, other does not 
    			if(charges[transaction]['recipient']['username'] === undefined)
					you_owe.push({username:charges[transaction]['recipient'], amount:charges[transaction]['amount']});    				
    			else
    				you_owe.push({username:charges[transaction]['recipient']['username'], amount:charges[transaction]['amount']});
    		}
    		else if(charges[transaction]['recipient']['username'] === username){ // user has venmo and is recipient, other does  not
    			if(charges[transaction]['payer']['username'] === undefined)
    				owe_you.push({username:charges[transaction]['payer'], amount:charges[transaction]['amount']});
    			else
    				owe_you.push({username:charges[transaction]['payer']['username'], amount:charges[transaction]['amount']});
	    		
    		}
    	}

    	console.log(you_owe);
    	console.log(owe_you);

    	res.render('index', {user:req.user, owe_you, you_owe });
    });	
    }
    

    
    
});

router.post('/register', function(req, res) {
    Account.count({username:req.body.username},function(error, count){
        //console.log(req.body);

        Account.register(new Account({ username : req.body.username, first_name: req.body.firstName, last_name: req.body.lastName, email: req.body.email}), req.body.password, function(err, account) {
        if (err) {
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

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

//search 

router.get('/usersearch',function(req,res){
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

function stringStartsWith (string, prefix) {
    if(string === undefined)
        return false;
    return string.slice(0, prefix.length) == prefix;
}
module.exports = router;