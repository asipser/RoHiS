var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var Charge = require('../models/charge');
var moment = require('moment');
moment().format();


router.get('/', function (req, res) {
    if(req.user === undefined){
    res.render('index', {user:req.user});
    }
    else{
    var username = req.user.username;
	var user_has_venmo; // boolean to see if the req.user has venmo.

    var userCharges = []; // Array used to store all charges for one person 
    var mergedCharges = []; // Array with a merged userCharges where it compiles the same payer recipients under the same piles.
    var you_owe = []; // people u owe
    var owe_you = []; // charges with people that owe u
    var merged_you_owe = []; // merged charges one way within you_owe
    var merged_owe_you = []; // merged charges one way within array owe_you
    var final_merged_you_owe = []; // merges similarities between merged_you_ owe and merged_owe_you
    var final_merged_owe_you = [];  			// ex asips appears in both of them, moving it to only one of them


    /*// check to see if  venmo has been  linked with account NOT NEEDED SO FAR
    if(req.user['venmo_id'] === undefined)
    	user_has_venmo = false;
    else
    	user_has_venmo = true;

    //console.log(req.user.username + " has venmo value of " + user_has_venmo);
	*/

    var find_condition = {
        $and:[
            {completed:false},
            {cancelled:false}
        ]
    }

    Charge.find(find_condition, function (err,charges){

    	//step 1
    	for(transaction in charges){

            var date_created = moment(charges[transaction]['date_created']).format("dddd, MMMM Do YYYY, h:mm:ss a");
            var creator;
          
            if (charges[transaction]['creator'] === username) {
                creator = "you";
            } else {
                creator = charges[transaction]['creator'];
            }

    		if(charges[transaction]['payer']['username'] === username){           
                                                           // user is  a payer
    			if(charges[transaction]['recipient']['username'] === undefined)                                                  // check if person targetted has an account or no, undefined fs they dont 
					you_owe.unshift({username:charges[transaction]['recipient'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});    				
    			else                                                                                                             // they have an account and it pushes to charges that you owe their name
    				you_owe.unshift({username:charges[transaction]['recipient']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
    		}
    		else if(charges[transaction]['recipient']['username'] === username){                                                 // user is a recipient
    			if(charges[transaction]['payer']['username'] === undefined)                                                      // check if the person targetted has an account
    				owe_you.unshift({username:charges[transaction]['payer'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
    			else                                                                                                             // if they have an account it pushes their account username to the array with debts owed to you
    				owe_you.unshift({username:charges[transaction]['payer']['username'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
	    		
    		}
    	}

    	//step 2

    	for(transaction in you_owe){
    		var user = you_owe[transaction]['username'];
    		var amount = you_owe[transaction]['amount'];
    		var in_database = false;
    		var id = you_owe[transaction]['id'];
    		var note = you_owe[transaction]['note'];
    		var date = you_owe[transaction]['date_created'];


    		for(mergedTransaction in merged_you_owe){
    			if(merged_you_owe[mergedTransaction]['username'] === user){
    				merged_you_owe[mergedTransaction]['amount'] += amount;
    				merged_you_owe[mergedTransaction]['transactions_info'].push({amount:amount,id:id,note:note,date:date});

    				in_database = true;
    			}
    		}
    		if(!in_database)
    			merged_you_owe.push({username:user, amount:amount, transactions_info:[{amount:amount,id:id,note:note,date:date}]});
    	}

    	for(transaction in owe_you){
    		var user = owe_you[transaction]['username']; //username
    		var amount = owe_you[transaction]['amount'];
    		var in_database = false;
    		var id = owe_you[transaction]['id'];
    		var note = owe_you[transaction]['note'];
    		var date = owe_you[transaction]['date_created'];

    		for(mergedTransaction in merged_owe_you){
    			if(merged_owe_you[mergedTransaction]['username'] === user){
    				merged_owe_you[mergedTransaction]['amount'] += amount;
    				merged_owe_you[mergedTransaction]['transactions_info'].push({amount:amount,id:id,note:note,date:date});

    				//console.log(merged_owe_you[mergedTransaction]['transactions_info']);
    				
    				// merged_owe_you[mergedTransaction]['amounts'].push(amount);
    				// merged_owe_you[mergedTransaction]['ids'].push(id);
    				// merged_owe_you[mergedTransaction]['notes'].push(note);
    				// merged_owe_you[mergedTransaction]['dates'].push(date);

    				in_database = true;
    			}
    		}
    		if(!in_database)
    			merged_owe_you.push({username:user, amount:amount, transactions_info:[{amount:amount,id:id,note:note,date:date}]});
    	}

    	// console.log("printing transactions info:");
    	// var x = merged_owe_you[0]['transactions_info']
    	// console.log(x);
    	// x = negateElements(merged_owe_you[0]['transactions_info']);
    	// console.log(x);

    	// console.log('merged_owe_you');
    	// console.log(merged_owe_you);


    	// console.log("merged_you_owe");
    	// console.log(merged_you_owe); // test owe_you and you_owe

    	//step 3

    	merged_owe_you.forEach(function(transaction_owe_you){
    	var merge_username = transaction_owe_you['username'];
   		var owe_you_amount = transaction_owe_you['amount'];
   		var owe_you_transactions_info = transaction_owe_you['transactions_info'];

    		merged_you_owe.forEach(function(transaction_you_owe){
    			var cross_check_username = transaction_you_owe['username']; // cross check  this username with merge username
    			var you_owe_amount = transaction_you_owe['amount'];
    			var you_owe_transactions_info = transaction_you_owe['transactions_info'];
    			if(merge_username === cross_check_username){
    				if(owe_you_amount > you_owe_amount){
    					you_owe_transactions_info = negateElements(transaction_you_owe['transactions_info']); // negates values to show clarity
    					you_owe_transactions_info.forEach(function(individual_transaction){transaction_owe_you['transactions_info'].push(individual_transaction);});
    					console.log(transaction_owe_you['transactions_info']);
    					transaction_owe_you['amount'] = owe_you_amount - you_owe_amount;
    					var arr = merged_you_owe;
						var idx = arr.indexOf(transaction_you_owe); // INDEX OF THE CURRENT TRANSACTION IN MERGED YOU OWE, used to SPLICE out DATA
						// be careful, .indexOf() will return -1 if the item is not found
						if (idx !== -1) 
						    arr.splice(idx, 1);						
						else
							console.log("Error, current you_owe_transaction not found in array, bug happened here");
    				}
    				else{
    					owe_you_transactions_info = negateElements(transaction_owe_you['transactions_info']); // negates values to show clarity
    					owe_you_transactions_info.forEach(function(individual_transaction){transaction_you_owe['transactions_info'].push(individual_transaction);});
    					console.log(transaction_you_owe['transactions_info']);
    					transaction_you_owe['amount'] = you_owe_amount - owe_you_amount;
    					var arr = merged_owe_you;
						var idx = arr.indexOf(transaction_owe_you); // INDEX OF THE CURRENT TRANSACTION IN MERGED YOU OWE, used to SPLICE out DATA
						// be careful, .indexOf() will return -1 if the item is not found
						if (idx !== -1) 
						    arr.splice(idx, 1);						
						else
							console.log("Error, current owe_you_transaction not found in array, bug happened here");
    				}
    			}

    		});
    	});

		console.log('NEW merged_owe_you');
    	console.log(merged_owe_you);

    	console.log("NEW merged_you_owe");
    	console.log(merged_you_owe); // test owe_you and you_owe

    	res.render('index', {user:req.user, owe_you, you_owe });

    });	
    }

});

function negateElements(input_array){
	input_array.forEach(function(charge){
		var negate_amount = -1*charge['amount'];
		charge['amount'] = negate_amount;
    });

    return input_array;
}

// WHEN YOU CLICK THE CHECK BUTTON NEXT TO A CHARGE

router.post('/chargecomplete', function(req, res) {

    Charge.findOneAndUpdate({_id: req.body.charge_id}, {completed: true, date_completed: moment(), who_completed: req.user.username}, {new: true}, function(err, profile) {

        console.log(profile);

        Account.findOne({username: profile['payer']['username']}, function(err, payer_info) {

            if (payer_info) {             // UPDATES AVERAGE PAYMENT TIME FOR THE PAYER IF THE USER EXISTS

                console.log(payer_info);

                var start_time = moment(profile['date_created']);
                var complete_time = moment(profile['date_completed']);

                console.log("AHHHHHHHHHHHH");

                var time_diff = complete_time.diff(start_time);

                console.log(time_diff);

                var previous_num = payer_info['statistics']['num_charges'];
                var previous_avg = payer_info['statistics']['average_time'];
                var previous_total = previous_num * previous_avg;
                var new_avg = (previous_total + time_diff) / (previous_num + 1);

                console.log(new_avg);

                Account.findOneAndUpdate({username: profile['payer']['username']}, {statistics: {num_charges: previous_num + 1, average_time: new_avg}}, function() {
                    res.send('Success!');
                });

            } else {                    // OTHERWISE SKIP UPDATING
                res.send('Success!');
            }

        });

    });

});

// WHEN YOU CLICK THE X NEXT TO A CHARGE
    
router.post('/chargecancel', function(req, res) {

    Charge.findOneAndUpdate({_id: req.body.charge_id}, {cancelled: true, date_cancelled: moment(), who_cancelled: req.user.username}, function(err, profile) {
        res.send('Success!');
    });

});


router.post('/register', function(req, res) {
    Account.count({username:req.body.username},function(error, count){
        //console.log(req.body);

        Account.register(new Account({ username : req.body.username, first_name: req.body.firstName, last_name: req.body.lastName, email: req.body.email}), req.body.password, function(err, account) { // registers account with initial data passed through the register form, uses express session, passport js, and passport local mongoose
        if (err) {                              // if there is an error such as a duplicated account or fields left blank. THESE WILL BE DEALT WITH LATER
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