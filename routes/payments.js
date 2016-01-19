var express = require('express');
var router = express.Router();
var Charge = require('../models/charge');
var Account = require('../models/account');
var request = require("request");

router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

router.post('/addcharge', function (req, res, next) {

    // search accounts database for the username person entered.

    Account.find({username: req.body.user}, function (err, users) {
        console.log("This is in /addcharge, entered username is " + req.body.user)
        var recipient;
        var payer;

        var target_user = users[0]; // user that has been requested
        //if no accounts have been found then the entered username shall be set target_user
        if(users[0] === undefined)
            target_user = req.body.user;

        var host_user = (req.user); // user issuing the command
        // configures reciept/payer correctly
         if (req.body.borroworlent === "true")
        {
            recipient = host_user;
            payer = target_user;
        }
        else
        {
            payer = host_user;
            recipient = target_user;
        }

        var d = new Date();     // gets current date
        var time = d.getTime(); // gets current time 

        var charge = new Charge({ // creates new charge scehma
            payer: payer,
            recipient: recipient,
            amount: req.body.amount,
            completed: false,
            used_venmo: req.body.venmousage
        });

        charge.save(function(err, charge) { // saves data in collection
          if (err) return console.error(err);
          console.log("Saved Charge");
        });





        if (req.body.venmousage) {
            console.log(req.body);

            var username = req.body.user; // OTHER PERSON'S USERNAME. IF YOU WANT YOUR OWN USERNAME IT'S REQ.USER.USERNAME, AS ALWAYS
            var amount = req.body.amount; // AMOUNT BEING PAID/REQUESTED
            var note = req.body.note;     // NOTE ASSOCIATED WITH THING
            var access_token = null;      
            var user_id = null;
            var url = 'https://api.venmo.com/v1/payments';

            if (req.body.borroworlent === "true") {
               amount = amount * -1;
            }
     

            Account.findOne({username: req.user.username}, function (err, profile) {
                access_token = profile['access_token'];
            
                Account.findOne({username: username}, function (err, profile) {
                    user_id = profile['venmo_id'];

                    var parameters = {access_token: access_token, user_id: user_id, note: note, amount: amount};

                    request.post({url: url, formData: parameters}, function(err, response, body) {

                    res.redirect('/');
                    });
                });
            });
        } else {
            console.log("No venmo addition!");
            res.redirect('/');
        }    
    });

   
});

module.exports = router;
