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
                current_lent += parseInt(req.body.amount);
            else
                current_borrowed += parseInt(req.body.amount);
            console.log("currnent lent: " + current_lent);
            Account.findOneAndUpdate({username: req.user.username}, {current_borrowed:current_borrowed, current_lent:current_lent}, function(){});           
        });

        // SENDING EMAIL IF EMAIL_NOTIFICATIONS IS ON FOR THE OTHER USER

        if (users[0] && users[0]['email_notifications']) {
            
            var mailOptions = {
                from: 'noreply.rohis@gmail.com',
                to: users[0]['email'],
                subject: "New charge from " + req.user.first_name + " " + req.user.last_name,
                text: req.user.first_name + " has added a new charge with you: $" + req.body.amount + " for '" + req.body.note + ".' Check it out at rohis.herokuapp.com!"
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

module.exports = router;
