var express = require('express');
var router = express.Router();
var Account = require('../models/account');
var router = express.Router();

var request = require("request");

router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

router.post('/addcharge', function (req, res, next) {

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

                res.send(body);
                });
            });
        });
    } else {
        res.send("nothing");
    }    
});

module.exports = router;
