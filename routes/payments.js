var express = require('express');
var router = express.Router();
var Charge = require('../models/charge');
var Account = require('../models/account');
var request = require("request");
var moment = require('moment');
moment().format();
var nodemailer = require('nodemailer');
var secret = require('../secret/secret');
var transporter = secret['transporter'];


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


router.post('/addcharge', function (req, res, next) {

    // search accounts database for the username person entered.

    Account.find({username: req.body.user.toLowerCase()}, function (err, users) {
        console.log("This is in / addcharge, entered username is " + req.body.user)
        var recipient;
        var payer;

        var target_user = users[0]; // user that has been requested
                                    //if no accounts have been found then the entered username shall be set target_user

        if(users[0] === undefined)
            target_user = req.body.user.toLowerCase();

        var host_user = (req.user); // user issuing the command
                                    // configures reciept/payer correctly
         if (req.body.borroworlent === "true") {
            recipient = host_user;
            payer = target_user;
        }
        else {
            payer = host_user;
            recipient = target_user;
        }

        var date_created = moment();
        var completed = false;

        if (req.body.venmousage) {
            if (req.body.borroworlent === "false") {
                completed = true;
            } 
        }

        var charge = new Charge({ // creates new charge schema
            payer: payer,
            recipient: recipient,
            amount: req.body.amount,
            completed: completed,
            description: req.body.note,
            used_venmo: req.body.venmousage,
            date_created: date_created,
            creator: req.user.username
        });

        charge.save(function(err, charge) { // saves data in collection
          if (err) return console.error(err);
          console.log("Saved Charge");
        });

        // STATISTICS

        Account.findOne({username: req.user.username}, function (err,profile){
            console.log(profile);
            var current_borrowed = profile['current_borrowed'];
            var current_lent = profile['current_lent'];
            if (req.body.borroworlent === "true")
                current_lent += parseFloat(req.body.amount);
            else
                current_borrowed += parseFloat(req.body.amount);

            var current_total = current_lent - current_borrowed;
            var number_changes = profile['number_changes'] + 1;
            var graph_current_total = profile['graph_current_total'];
            var new_data = {"changes": number_changes, "current_total": current_total};
            graph_current_total.push(new_data);

            Account.findOneAndUpdate({username: req.user.username}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed: current_borrowed, current_lent: current_lent}, {new: true}, function(err, test){
                console.log(test)
            });           
        });

        if (!(users[0] === undefined)) {
            Account.findOne({username: req.body.user.toLowerCase()}, function (err,profile){
                console.log(profile);
                var current_borrowed = profile['current_borrowed'];
                var current_lent = profile['current_lent'];

                if (req.body.borroworlent === "true")
                    current_borrowed += parseFloat(req.body.amount);
                else
                    current_lent += parseFloat(req.body.amount);

                var current_total = current_lent - current_borrowed;
                var number_changes = profile['number_changes'] + 1;
                var graph_current_total = profile['graph_current_total'];
                var new_data = {"changes": number_changes, "current_total": current_total};
                graph_current_total.push(new_data);

                Account.findOneAndUpdate({username: req.body.user.toLowerCase()}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed: current_borrowed, current_lent: current_lent}, function(){});           
            });
        }

        // SENDING EMAIL IF EMAIL_NOTIFICATIONS IS ON FOR THE OTHER USER

        if (users[0] && users[0]['email_notifications']) {
            
            var mailOptions = {
                from: 'noreply.rohis@gmail.com',
                to: users[0]['email'],
                subject: "New charge from " + req.user.first_name + " " + req.user.last_name,
                text: req.user.first_name + " has added a new charge with you: $" + req.body.amount + " for '" + req.body.note + ".' Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
            };

            transporter.sendMail(mailOptions);

        }

        // IF VENMO OPTION IS CHECKED (SO FAR ONLY WORKS IF BOTH USERS HAVE VENMO), THEN EITHER CHARGES OR REQUESTS THE OTHER PERSON.



        if (req.body.venmousage) {
            console.log(req.body);

            var username = req.body.user; // OTHER PERSON'S USERNAME. IF YOU WANT YOUR OWN USERNAME IT'S REQ.USER.USERNAME, AS ALWAYS
            var amount = req.body.amount; // AMOUNT BEING PAID/REQUESTED
            var note = req.body.note;     // NOTE ASSOCIATED WITH THING
            var access_token;      
            var user_id;
            var email; 
            var url = 'https://api.venmo.com/v1/payments';

            if (req.body.borroworlent === "true") {
               amount = amount * -1;
            }


            Account.findOne({username: req.user.username}, function (err, profile) {
                access_token = profile['access_token'];
            
                Account.findOne({username: username}, function (err, profile) {
                    if (profile) {
                        if (profile['venmo_id']) {
                            user_id = profile['venmo_id'];
                            var parameters = {access_token: access_token, user_id: user_id, note: note, amount: amount};
                            request.post({url: url, formData: parameters}, function(err, response, body) {
                                res.redirect('/');
                            });
                        } else {
                            email = profile['email'];
                            var parameters = {access_token: access_token, email: email, note: note, amount: amount};
                            request.post({url: url, formData: parameters}, function(err, response, body) {
                                res.redirect('/');
                            });
                        }
                    } else {
                        email = "FILL IN LATER";
                        var parameters = {access_token: access_token, email: email, note: note, amount: amount};
                        request.post({url: url, formData: parameters}, function(err, response, body) {
                            res.redirect('/');
                        });
                    }

                });

            });
        } else {
            console.log("No venmo addition!");
            res.redirect('/');
        }




    });

   
});




router.post('/addsplitcharge', function (req, res, next) {

    // search accounts database for the username person entered.

    Account.find({username: req.body.payer.toLowerCase()}, function (err, users) {

        Account.findOne({username: req.body.recipient.toLowerCase()}, function (err, recipientjson) {

            console.log("This is in /addsplitcharge, entered username is");
            var recipient = recipientjson;
            var payer;
            var amount = req.body.amount;
            var description = req.body.note;
            var date_created = moment();

            if(users[0] === undefined) {
                payer = req.body.payer.toLowerCase();
            } else {
                payer = users[0];
            }
         
            var charge = new Charge({ // creates new charge schema
                payer: payer,
                recipient: recipient,
                amount: amount,
                completed: false,
                description: description,
                used_venmo: false,
                date_created: date_created,
                creator: req.user.username
            });

            charge.save(function(err, charge) { // saves data in collection
              if (err) return console.error(err);
              console.log("Saved Charge");
            });

            // STATISTICS

            Account.findOne({username: req.body.recipient.toLowerCase()}, function (err,profile){
                var current_borrowed = profile['current_borrowed'];
                var current_lent = profile['current_lent'];
                current_lent += parseFloat(req.body.amount);

                var current_total = current_lent - current_borrowed;

                var number_changes = profile['number_changes'] + 1;
                var graph_current_total = profile['graph_current_total'];
                var new_data = {"changes": number_changes, "current_total": current_total};
                graph_current_total.push(new_data);

                if (req.body.counter == 1 && profile['email_notifications']) {
                    var mailOptions = {
                        from: 'noreply.rohis@gmail.com',
                        to: profile['email'],
                        subject: "Hey " + profile.first_name + ", you've split a charge!",
                        text: "Find out what others owe you at http://moneymatters.eastus.cloudapp.azure.com/!"
                    }
                    transporter.sendMail(mailOptions);
                }

                

                Account.findOneAndUpdate({username: req.body.recipient.toLowerCase()}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed: current_borrowed, current_lent: current_lent}, {new: true}, function(err, test){
                });           
            });

            if (!(users[0] === undefined)) {
                Account.findOne({username: req.body.payer.toLowerCase()}, function (err,profile){
                    var current_borrowed = profile['current_borrowed'];
                    var current_lent = profile['current_lent'];
                    current_borrowed += parseFloat(req.body.amount);

                    var current_total = current_lent - current_borrowed;
                    var number_changes = profile['number_changes'] + 1;
                    var graph_current_total = profile['graph_current_total'];
                    var new_data = {"changes": number_changes, "current_total": current_total};
                    graph_current_total.push(new_data);

                    Account.findOneAndUpdate({username: req.body.payer.toLowerCase()}, {graph_current_total: graph_current_total, number_changes: number_changes, current_borrowed: current_borrowed, current_lent: current_lent}, function(){});           
                });
            }

            // SENDING EMAIL IF EMAIL_NOTIFICATIONS IS ON FOR THE OTHER USER

            if (users[0] && users[0]['email_notifications']) {
                
                Account.findOne({username: req.body.recipient.toLowerCase()}, function (err, profile) {

                    var mailOptions = {
                        from: 'noreply.rohis@gmail.com',
                        to: users[0]['email'],
                        subject: "You've split a charge with " + profile.first_name + " " + profile.last_name + "!",
                        text: "You owe " + profile.first_name + " $" + req.body.amount + " for '" + req.body.note + ".' Check it out at http://moneymatters.eastus.cloudapp.azure.com/!"
                    }

                    transporter.sendMail(mailOptions);
               
                });

            };

        });

        
    });

    res.send("Success!");
   
});

module.exports = router;
