var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var Charge = require('../models/charge');
var moment = require('moment');
moment().format();
var nodemailer = require('nodemailer');
var secret = require('../secret/secret');
var transporter = secret['transporter'];
var humanizeDuration = require("humanize-duration")


// CHECKS FOR SPLIT BILL IF RECIPIENT IS A USER
router.get('/throwError', function(req,res){
	setTimeout(function () {  
	  util.puts('Throwing error now.');
	  throw new Error('User generated fault.');
	}, 5000);
});

router.get('/isUser', function(req, res) {
	var name = req.query.username;
	var accountExists = false;
	Account.findOne({username:name}, function(err,profile){
		if(profile)
			accountExists = true;
		res.send(accountExists);
	});
});

// LOADS ALL CURRENT CHARGES

router.get('/', function (req, res) {
	if(req.user === undefined){
		res.render('index', {user:req.user});
	}
	else{
		var username = req.user.username;
		var user_has_venmo; 					// boolean to see if the req.user has venmo.

	    var userCharges = []; 					// Array used to store all charges for one person 
	    var mergedCharges = []; 				// Array with a merged userCharges where it compiles the same payer recipients under the same piles.
	    var you_owe = []; 						// people u owe
	    var owe_you = []; 						// charges with people that owe u
	    var merged_you_owe = []; 				// merged charges one way within you_owe
	    var merged_owe_you = []; 				// merged charges one way within array owe_you

	    if (req.user['venmo_id'])
	    	user_has_venmo = true;
	    else
	    	user_has_venmo = false;

	    var find_condition = {
	    	$and:[
	    	{completed:false},
	    	{cancelled:false}
	    	]
	    }

	    Charge.find(find_condition, function (err,charges){

	    	//step 1 find charges
		    	for(transaction in charges){

		    		var date_created = moment(charges[transaction]['date_created']).format("M/D/YY, h:mm a");
		    		var creator;

		    		if (charges[transaction]['creator'] === username) {
		    			creator = "you";
		    		} else {
		    			creator = charges[transaction]['creator'];
		    		}

		    		if(charges[transaction]['payer']['username'] === username){   														 // user is borrowing money

		    			if(charges[transaction]['recipient']['username'] === undefined)                                                  // check if person targetted has an account or no, undefined fs they dont 
		    				you_owe.unshift({username:charges[transaction]['recipient'], name:charges[transaction]['recipient'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});    				
		    			else{
		    				var displayName = getDisplayName(charges[transaction]['recipient']);                                         // they have an account and it pushes to charges that you owe their name
		    				you_owe.unshift({username:charges[transaction]['recipient']['username'], name: displayName, amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
		    			}
		    		}
		    		else if(charges[transaction]['recipient']['username'] === username){                
		    			                                 																					// user is a recipient
		    			if(charges[transaction]['payer']['username'] === undefined)                                                      // check if the person targetted has an account
		    				owe_you.unshift({username:charges[transaction]['payer'], name:charges[transaction]['payer'], amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
		    			else{                                                                                                            // if they have an account it pushes their account username to the array with debts owed to you
		    				var displayName = getDisplayName(charges[transaction]['payer']);  
		    				owe_you.unshift({username:charges[transaction]['payer']['username'], name:displayName, amount:charges[transaction]['amount'], id:charges[transaction]['_id'], note:charges[transaction]['description'], date_created: date_created, creator: creator});
		    			}
		    		}
		    	}

	    	//step 2 collects all charges a user has

		    	for(transaction in you_owe){
		    		var user = you_owe[transaction]['username'];
		    		var displayName = you_owe[transaction]['name'];
		    		var amount = you_owe[transaction]['amount'];
		    		var in_database = false;
		    		var id = you_owe[transaction]['id'];
		    		var note = you_owe[transaction]['note'];
		    		var date = you_owe[transaction]['date_created'];
		    		var creator = you_owe[transaction]['creator'];


		    		for(mergedTransaction in merged_you_owe){
		    			if(merged_you_owe[mergedTransaction]['username'] === user){
		    				merged_you_owe[mergedTransaction]['amount'] += amount;
		    				merged_you_owe[mergedTransaction]['transactions_info'].push({amount: amount, id: id, note: note, date_created: date, creator: creator});

		    				in_database = true;
		    			}
		    		}
		    		if(!in_database)
		    			merged_you_owe.push({username:user, name:displayName, amount:amount, transactions_info:[{amount: amount, id: id, note: note, date_created: date, creator: creator}]});
		    	}

		    	for(transaction in owe_you){
		    		var user = owe_you[transaction]['username']; //username
		    		var displayName = owe_you[transaction]['name'];
		    		var amount = owe_you[transaction]['amount'];
		    		var in_database = false;
		    		var id = owe_you[transaction]['id'];
		    		var note = owe_you[transaction]['note'];
		    		var date = owe_you[transaction]['date_created'];
		    		var creator = owe_you[transaction]['creator'];

		    		for(mergedTransaction in merged_owe_you){
		    			if(merged_owe_you[mergedTransaction]['username'] === user){
		    				merged_owe_you[mergedTransaction]['amount'] += amount;
		    				merged_owe_you[mergedTransaction]['transactions_info'].push({amount: amount, id: id, note: note, date_created: date, creator: creator});
		    				in_database = true;
		    			}
		    		}
		    		if(!in_database)
		    			merged_owe_you.push({username:user, name:displayName, amount:amount, transactions_info:[{amount: amount, id: id, note: note, date_created: date, creator: creator}]});
	    		}

	    	//step 3 combines loans and debts

	    	merged_owe_you.forEach(function(transaction_owe_you){
	    		var merge_username = transaction_owe_you['username'];
	    		var owe_you_amount = transaction_owe_you['amount'];
	    		var owe_you_transactions_info = transaction_owe_you['transactions_info'];

	    		merged_you_owe.forEach(function(transaction_you_owe){
	    			var cross_check_username = transaction_you_owe['username'];										 // cross check  this username with merge username
	    			var you_owe_amount = transaction_you_owe['amount'];
	    			var you_owe_transactions_info = transaction_you_owe['transactions_info'];
	    			if(merge_username === cross_check_username){
	    				if(owe_you_amount > you_owe_amount){
	    					you_owe_transactions_info = negateElements(transaction_you_owe['transactions_info']); 	 // negates values to show clarity
	    					you_owe_transactions_info.forEach(function(individual_transaction){transaction_owe_you['transactions_info'].push(individual_transaction);});
	    					transaction_owe_you['amount'] = owe_you_amount - you_owe_amount;
	    					var arr = merged_you_owe;
							var idx = arr.indexOf(transaction_you_owe);												 // INDEX OF THE CURRENT TRANSACTION IN MERGED YOU OWE, used to SPLICE out DATA
							if (idx !== -1) 
								arr.splice(idx, 1);						
							else
								console.log("Error, current you_owe_transaction not found in array, bug happened here");
						}
						else{
	    					owe_you_transactions_info = negateElements(transaction_owe_you['transactions_info']); 	 // negates values to show clarity
	    					owe_you_transactions_info.forEach(function(individual_transaction){transaction_you_owe['transactions_info'].push(individual_transaction);});
	    					transaction_you_owe['amount'] = you_owe_amount - owe_you_amount;
	    					var arr = merged_owe_you;
							var idx = arr.indexOf(transaction_owe_you); 											 // INDEX OF THE CURRENT TRANSACTION IN MERGED YOU OWE, used to SPLICE out DATA
							if (idx !== -1) 
								arr.splice(idx, 1);						
							else
								console.log("Error, current owe_you_transaction not found in array, bug happened here");
						}
					}

				});
			});

	    	res.render('index', {venmo: user_has_venmo, user:req.user, merged_owe_you:merged_owe_you, merged_you_owe:merged_you_owe });

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



function getDisplayName(target_user){

	return target_user['first_name'] + " " + target_user['last_name'].charAt(0).toUpperCase() + ".";
}

// WHEN YOU CLICK THE CHECK BUTTON NEXT TO A CHARGE

router.post('/chargecomplete', function(req, res) {
	Charge.findOne({_id: req.body.charge_id},function(err,charge){
		if(charge['completed'] || charge['cancelled']){
			res.send("Already Done");
		}
		else{
			var charge_amount = charge['amount'];
		    if(charge['payer']['username'] === req.user.username){    								// user is borrowing money 
	        	Account.findOne({username: req.user.username}, function (err,profile){
					var current_borrowed = profile['current_borrowed'];
			        var current_lent = profile['current_lent'];
			        var greatest_loan = profile['greatest_loan']; 
			        var smallest_loan = profile['smallest_loan'];
			        var highest_debt = profile['highest_debt']; 
			        var smallest_debt = profile['smallest_debt'];
		            current_borrowed -= charge_amount; 												// CHANGING CURRENT BORROWED HERE
		            if(highest_debt === null){
		                highest_debt = charge_amount;
		                smallest_debt = charge_amount;
		           }
		            else if (highest_debt < charge_amount)
		                highest_debt = charge_amount;
		            else if(charge_amount < smallest_debt)
		                smallest_debt = charge_amount;
		            
                    var number_changes = profile['number_changes'];
                    var graph_current_total = profile['graph_current_total'];
                    var current_total;
                   
                    number_changes += 1;
                    current_total = current_lent - current_borrowed;
                    var new_data = {"changes": number_changes, "current_total": current_total};
                    graph_current_total.push(new_data);
                 

		            Account.findOneAndUpdate({username: req.user.username}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:current_borrowed, current_lent:current_lent, greatest_loan:greatest_loan,smallest_loan:smallest_loan,highest_debt:highest_debt,smallest_debt:smallest_debt}, function(){});           
				});      
				if(charge['recipient']['username'] !== undefined){	  								// other user is lending money
					Account.findOne({username: charge['recipient']['username']}, function (err,recipient){
						var r_current_borrowed = recipient['current_borrowed']; 					// R stands for Recipient 
				        var r_current_lent = recipient['current_lent'];
				        var r_greatest_loan = recipient['greatest_loan']; 
				        var r_smallest_loan = recipient['smallest_loan'];
				        var r_highest_debt = recipient['highest_debt']; 
				        var r_smallest_debt = recipient['smallest_debt'];
			            r_current_lent -= charge_amount; 											// CHANGING CURRENT LENT OF OTHER PERSON HERE
			            if(r_greatest_loan === null){
			                r_greatest_loan = charge_amount;
			                r_smallest_loan = charge_amount;
			                r_average_loan = charge_amount;
			            }
			            if (r_greatest_loan < charge_amount)
			                r_greatest_loan = charge_amount;
			            if(charge_amount < r_smallest_loan)
			                r_smallest_loan = charge_amount;

                        var number_changes = recipient['number_changes'];
                        var graph_current_total = recipient['graph_current_total'];
                        var current_total;
                     
                        number_changes += 1;
                        current_total = r_current_lent - r_current_borrowed;
                        var new_data = {"changes": number_changes, "current_total": current_total};
                        graph_current_total.push(new_data);
                        

			            Account.findOneAndUpdate({username: charge['recipient']['username']}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:r_current_borrowed, current_lent:r_current_lent, greatest_loan:r_greatest_loan, smallest_loan:r_smallest_loan,highest_debt:r_highest_debt,smallest_debt:r_smallest_debt}, function(){});           
					}); 
				}                                                 								   // check if person targetted has an account or no, undefined fs they dont 					                                                                                                          // they have an account and it pushes to charges that you owe their name	    				
			}
			else if(charge['recipient']['username'] === req.user.username){                        // user is a recipient
				Account.findOne({username: req.user.username}, function (err,profile){
					var current_borrowed = profile['current_borrowed'];
			        var current_lent = profile['current_lent'];
			        var greatest_loan = profile['greatest_loan']; 
			        var smallest_loan = profile['smallest_loan'];
			        var highest_debt = profile['highest_debt']; 
			        var smallest_debt = profile['smallest_debt'];
		            current_lent -= charge_amount; 												  // CHANGING CURRENT LENT HERE
		            if(greatest_loan === null){
		                greatest_loan = charge_amount;
		                smallest_loan = charge_amount;
		            }
		            if (greatest_loan < charge_amount)
		                greatest_loan = charge_amount;
		            if(charge_amount < smallest_loan)
		                smallest_loan = charge_amount;

                    var number_changes = profile['number_changes'];
                    var graph_current_total = profile['graph_current_total'];
                    var current_total;
                
                    number_changes += 1;
                    current_total = current_lent - current_borrowed;
                    var new_data = {"changes": number_changes, "current_total": current_total};
                    graph_current_total.push(new_data);

		            Account.findOneAndUpdate({username: req.user.username}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:current_borrowed, current_lent:current_lent, greatest_loan:greatest_loan,smallest_loan:smallest_loan,highest_debt:highest_debt,smallest_debt:smallest_debt}, function(){});           
				}); 
				if(charge['payer']['username'] !== undefined){
					Account.findOne({username: charge['payer']['username']}, function (err,payer){
						var p_current_borrowed = payer['current_borrowed'];
				        var p_current_lent = payer['current_lent'];
				        var p_greatest_loan = payer['greatest_loan']; 
				        var p_smallest_loan = payer['smallest_loan'];
				        var p_highest_debt = payer['highest_debt']; 
				        var p_smallest_debt = payer['smallest_debt'];
			            p_current_borrowed -= charge_amount; 									// CHANGING OTHER PERSON'S CURRENT BORROWED HERE
			            if(p_highest_debt === null){
			                p_highest_debt = charge_amount;
			                p_smallest_debt = charge_amount;
			                p_average_debt = charge_amount;
			            }
			            if (p_highest_debt < charge_amount)
			                p_highest_debt = charge_amount;
			            if(charge_amount < p_smallest_debt)
			                p_smallest_debt = charge_amount;

                        var number_changes = payer['number_changes'];
                        var graph_current_total = payer['graph_current_total'];
                        var current_total;
                 
                        number_changes += 1;
                        current_total = p_current_lent - p_current_borrowed;
                        var new_data = {"changes": number_changes, "current_total": current_total};
                        graph_current_total.push(new_data);
                        

			            Account.findOneAndUpdate({username: charge['payer']['username']}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:p_current_borrowed, current_lent:p_current_lent, greatest_loan:p_greatest_loan,smallest_loan:p_smallest_loan,highest_debt:p_highest_debt,smallest_debt:p_smallest_debt}, function(){});           
					});  
				}
			}
			Charge.findOneAndUpdate({_id: req.body.charge_id}, {completed: true, date_completed: moment(), who_completed: req.user.username}, {new: true}, function(err, profile) {
				
		        // SEND EMAIL IF PERSON WHO COMPLETED IS NOT THE CREATOR

		        if (req.body.total === "false") {

		        	if (!(profile['creator'] === profile['who_completed'])) {

		        		Account.findOne({username: profile['creator']}, function(err, creator) {

		        			var mailOptions = {
		        				from: 'noreply.rohis@gmail.com',
		        				to: creator['email'],
		        				subject: "Charge updated by " + req.user.first_name + " " + req.user.last_name,
		        				text: req.user.first_name + " has marked your charge of $" + profile['amount'] + " for '" + profile['description'] + "' as completed. Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
		        			};

		        			if (creator['email_notifications']) {
		        				transporter.sendMail(mailOptions);
		        			}

		        		});      
		        	}

		        } else if (req.body.total === "true") {

		        	if (!(profile['creator'] === profile['who_completed'])) {

		        		Account.findOne({username: profile['creator']}, function(err, creator) {

		        			var mailOptions = {
		        				from: 'noreply.rohis@gmail.com',
		        				to: creator['email'],
		        				subject: "Charge updated by " + req.user.first_name + " " + req.user.last_name,
		        				text: req.user.first_name + " has marked your cumulative charge of $" + req.body.totalAmount + " as completed. Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
		        			};

		        			if (creator['email_notifications']) {
		        				transporter.sendMail(mailOptions);
		        			}

		        		});      
		        	}

		        }

		        Account.findOne({username: profile['payer']['username']}, function(err, payer_info) {

		            // UPDATES AVERAGE PAYMENT TIME FOR THE PAYER IF THE USER EXISTS

		            if (payer_info) {
		            	
		            	var start_time = moment(profile['date_created']);
		            	var complete_time = moment(profile['date_completed']);	    
		            	var time_diff = complete_time.diff(start_time);

		            	var previous_num = payer_info['statistics']['num_charges'];
		            	var previous_avg = payer_info['statistics']['average_time'];
		            	var previous_total = previous_num * previous_avg;
		            	var new_avg = (previous_total + time_diff) / (previous_num + 1);

		            	var average_display = humanizeDuration(new_avg, {round: true, largest: 2});

		            	var highest_time_num = payer_info['highest_time_num'];
		            	var lowest_time_num = payer_info['lowest_time_num'];
		            	var highest_time_display = payer_info['highest_time_display'];
		            	var lowest_time_display = payer_info['lowest_time_display'];

		            	if (time_diff > highest_time_num) {
		            		highest_time_num = time_diff;
		            		highest_time_display = humanizeDuration(time_diff, {round: true, largest: 2});
		            	}

		            	if (lowest_time_num === 0 || time_diff < lowest_time_num) {
		            		lowest_time_num = time_diff;
		            		lowest_time_display = humanizeDuration(time_diff, {round: true, largest: 2});
		            	}

		            	console.log("lowest time!: " + lowest_time_display);
		            	console.log("highest time!: " + highest_time_display);
		            
		            	Account.findOneAndUpdate({username: profile['payer']['username']}, {lowest_time_display: lowest_time_display, lowest_time_num: lowest_time_num, highest_time_display: highest_time_display, highest_time_num: highest_time_num, statistics: {num_charges: previous_num + 1, average_time: new_avg, average_display: average_display}}, function() {
		            		res.send('Success!');
		            	});

		            } else {                    // OTHERWISE SKIP UPDATING
		            	res.send('Success!');
		            }

		        });
			});
    	}
    });
});

// WHEN YOU CLICK THE X NEXT TO A CHARGE

router.post('/chargecancel', function(req, res) {

	//STATISTICS FOR CURRENT LENT / BORROWED

	Charge.findOne({_id: req.body.charge_id},function(err,charge){
		if(charge['completed'] || charge['cancelled']){
			res.send("Already Done");
		}
		else{
			var charge_amount = charge['amount'];
		    if(charge['payer']['username'] === req.user.username){    							// user is borrowing money 
	        	Account.findOne({username: req.user.username}, function (err,profile){
					var current_borrowed = profile['current_borrowed'];
			        var current_lent = profile['current_lent'];
		            current_borrowed -= charge_amount; 										    // CHANGING CURRENT BORROWED HERE

                    var number_changes = profile['number_changes'];
                    var graph_current_total = profile['graph_current_total'];
                    var current_total;

                    number_changes += 1;
                    current_total = current_lent - current_borrowed;
                    var new_data = {"changes": number_changes, "current_total": current_total};
                    graph_current_total.push(new_data);
                  

		            Account.findOneAndUpdate({username: req.user.username}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:current_borrowed, current_lent:current_lent}, function(){});           
				});      
				if(charge['recipient']['username'] !== undefined){	 						   // other user is lending money
					Account.findOne({username: charge['recipient']['username']}, function (err,recipient){
						var r_current_borrowed = recipient['current_borrowed']; 			   // r stands for Recipient 
				        var r_current_lent = recipient['current_lent'];
			            r_current_lent -= charge_amount; 									   // CHANGING CURRENT LENT OF OTHER PERSON HERE

                        var number_changes = recipient['number_changes'];
                        var graph_current_total = recipient['graph_current_total'];
                        var current_total;
                       
                        number_changes += 1;
                        current_total = r_current_lent - r_current_borrowed;
                        var new_data = {"changes": number_changes, "current_total": current_total};
                        graph_current_total.push(new_data);
                        

			            Account.findOneAndUpdate({username: charge['recipient']['username']}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:r_current_borrowed, current_lent:r_current_lent}, function(){});           
					}); 
				}                                                  								// check if person targetted has an account or no, undefined fs they dont 					                                                                                                          // they have an account and it pushes to charges that you owe their name	    				
			}
			else if(charge['recipient']['username'] === req.user.username){                     // user is a recipient
				Account.findOne({username: req.user.username}, function (err,profile){
					var current_borrowed = profile['current_borrowed'];
			        var current_lent = profile['current_lent'];
		            current_lent -= charge_amount; 												// CHANGING CURRENT LENT HERE

                    var number_changes = profile['number_changes'];
                    var graph_current_total = profile['graph_current_total'];
                    var current_total;
                 
                    number_changes += 1;
                    current_total = current_lent - current_borrowed;
                    var new_data = {"changes": number_changes, "current_total": current_total};
                    graph_current_total.push(new_data);
                   

		            Account.findOneAndUpdate({username: req.user.username}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:current_borrowed, current_lent:current_lent}, function(){});           
				}); 
				if(charge['payer']['username'] !== undefined){
					Account.findOne({username: charge['payer']['username']}, function (err,payer){
						var p_current_borrowed = payer['current_borrowed'];
				        var p_current_lent = payer['current_lent'];
			            p_current_borrowed -= charge_amount; 									// CHANGING OTHER PERSON'S CURRENT BORROWED HERE

                        var number_changes = payer['number_changes'];
                        var graph_current_total = payer['graph_current_total'];
                        var current_total;

                        number_changes += 1;
                        current_total = p_current_lent - p_current_borrowed;
                        var new_data = {"changes": number_changes, "current_total": current_total};
                        graph_current_total.push(new_data);
                        

			            Account.findOneAndUpdate({username: charge['payer']['username']}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed:p_current_borrowed, current_lent:p_current_lent}, function(){});           
					});  
				}
			}
			Charge.findOneAndUpdate({_id: req.body.charge_id}, {cancelled: true, date_cancelled: moment(), who_cancelled: req.user.username}, {new: true}, function(err, profile) {


		        // SEND EMAIL IF PERSON WHO CANCELLED IS NOT THE CREATOR

		        if (req.body.total === "false") {

		        	if (!(profile['creator'] === profile['who_cancelled'])) {

		        		Account.findOne({username: profile['creator']}, function(err, creator) {

		        			var mailOptions = {
		        				from: 'noreply.rohis@gmail.com',
		        				to: creator['email'],
		        				subject: "Charge updated by " + req.user.first_name + " " + req.user.last_name,
		        				text: req.user.first_name + " has cancelled your charge of $" + profile['amount'] + " for '" + profile['description'] + ".' Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
		        			};

		        			if (creator['email_notifications']) {
		        				transporter.sendMail(mailOptions);
		        			}

		        		});      
		        	}

		        } else if (req.body.total === "true") {

		        	if (!(profile['creator'] === profile['who_cancelled'])) {

		        		Account.findOne({username: profile['creator']}, function(err, creator) {

		        			var mailOptions = {
		        				from: 'noreply.rohis@gmail.com',
		        				to: creator['email'],
		        				subject: "Charge updated by " + req.user.first_name + " " + req.user.last_name,
		        				text: req.user.first_name + " has cancelled your cumulative charge of $" + req.body.totalAmount + ". Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
		        			};

		        			if (creator['email_notifications']) {
		        				transporter.sendMail(mailOptions);
		        			}

		        		});      
		        	}

		        }


		        res.send('Success!');

		    });
    	}
    });



});


router.post('/register', function(req, res) {
	Account.count({username:req.body.username},function(error, count){

        var full_name = req.body.firstName + " " + req.body.lastName;

        Account.register(new Account({ username : req.body.username, first_name: req.body.firstName, last_name: req.body.lastName, full_name:full_name, email: req.body.email, date_created: moment()}), req.body.password, function(err, account) { // registers account with initial data passed through the register form, uses express session, passport js, and passport local mongoose
        if (err) {                              
        	if (err['message'].slice(0,19) == "User already exists") {
        		res.redirect ('/#registererror');
        	}        	
        } else { console.log("successfully added account");
        passport.authenticate('local')(req, res, function () {
        	res.redirect('/');
        });
    }
});
    })
});

router.get('/login', function(req, res) { 
	res.render('index', {user : req.user});

});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
  failureRedirect: '/#loginerror'}), function(req, res) { // logins with passport js
	res.redirect('/');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/ping', function(req, res){ 				 // test function to see if tutorial worked. Link to tutorial here: http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.VpqQOhUrKhe
	res.status(200).send("pong!");
});

//search 

router.get('/usersearch',function(req,res){ 			 
	if(req.user === undefined){
		res.redirect('/');
	}
	else{	
		name = req.query.name;
		var response_data = {items:[]};
		Account.find({}, function (err, docs) {
			for(user in docs){
				if(docs[user]['username'] === req.user.username){
				}
				else{
					if(stringStartsWith(docs[user]['username'], name)){
						response_data['items'].push({full_name: docs[user]['full_name'],
							username: docs[user]['username']});
					}
				}
			}
			for(user in docs){
				var inArray = false; 											// used so no duplicate things happen
				if(docs[user]['username'] === req.user.username){
				}
				else{
					if(stringStartsWith(docs[user]['full_name'], name)){
						response_data['items'].forEach(function(entry){
							if(entry['username'] === docs[user]['username']){
								inArray = true;
							}
						});
					}
					else if(stringStartsWith(docs[user]['last_name'], name)){
						response_data['items'].forEach(function(entry){
							if(entry['username'] === docs[user]['username']){
								inArray = true;
							}
						});
					}
				}
				if((!inArray) && stringStartsWith(docs[user]['last_name'], name)){
					response_data['items'].push({full_name: docs[user]['full_name'],
															username: docs[user]['username']});
				}
				if((!inArray) && stringStartsWith(docs[user]['full_name'], name)){
					response_data['items'].push({full_name: docs[user]['full_name'],
															username: docs[user]['username']});
				}

			}
			response_data['items'].unshift({full_name:'Charge Custom User', username:req.query.name});
			res.send(response_data);
		});
	}
});

function stringStartsWith (string, prefix) {									 // used by usersearch route, boolean function. Inputs are string (complete string you are testing the prefix against, and prefix is the string you are checking if the input string begins with)
	if(string === undefined)
		return false;
	return string.slice(0, prefix.length).toLowerCase() == prefix.toLowerCase();
}


module.exports = router;