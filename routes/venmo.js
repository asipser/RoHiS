var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var request = require("request");
var secret = require("../secret/secret");

// DO NOT EDIT PLEASE

var client_id = secret['client_id'];
var client_secret = secret['client_secret'];

// REDIRECTS TO VENMO AUTHENTICATION LOGIN AND REDIRECTS TO /getCode.

router.get('/auth', function(req, res, next) {
    res.redirect("https://api.venmo.com/v1/oauth/authorize?client_id=3420&scope=make_payments%20access_profile&response_type=code&redirect_uri=http://moneymatters.eastus.cloudapp.azure.com/venmo/getCode");
});

// EXTRACTS ACCESS TOKEN AND ALL RELEVANT INFORMATION ABOUT THE USER'S VENMO ACCOUNT AND UPDATES THEIR ACCOUNT INFO. REDIRECTS TO '/'

router.get('/getCode', function (req, res, next) {

    var code = req.query.code;

    var url = "https://api.venmo.com/v1/oauth/access_token";

    var parameters = {client_id: client_id, client_secret: client_secret, code: code};

    request.post({url: url, formData: parameters}, function(err, response, body) {

        var information = JSON.parse(body);
        var access_token = information["access_token"];
        var venmo_id = information['user']['id'];
        var profile_picture_url = information['user']['profile_picture_url'];

        Account.findOneAndUpdate({username: req.user.username}, {venmo_id: venmo_id, access_token: access_token, information: body, profile_picture_url: profile_picture_url}, function(err, profile) {
            res.redirect('/');
        });
    });
});

// SHOWS WHAT IS IN THE USER'S ACCOUNT DATABASE

router.get('/checkdata', function (req, res, next) {
    Account.findOne({username: req.user.username}, function (err, profile) {
        res.render('data', {profile: profile});
        });
});

router.post('/completeall', function (req, res, next) {
    console.log(req.body);

    var username = req.body.user; // OTHER PERSON'S USERNAME. IF YOU WANT YOUR OWN USERNAME IT'S REQ.USER.USERNAME, AS ALWAYS
    var amount = req.body.amount; // AMOUNT BEING PAID/REQUESTED
    var note = req.body.note;     // NOTE ASSOCIATED WITH THING
    var access_token;      
    var user_id;
    var email; 
    var url = 'https://api.venmo.com/v1/payments';

    Account.findOne({username: req.user.username}, function (err, profile) {
        access_token = profile['access_token'];
    
        Account.findOne({username: username}, function (err, profile) {
            if (profile) {
                if (profile['venmo_id']) {
                    user_id = profile['venmo_id'];
                    var parameters = {access_token: access_token, user_id: user_id, note: note, amount: amount};
                    request.post({url: url, formData: parameters}, function(err, response, body) {
                        res.send('Success!');
                    });
                } else {
                    email = profile['email'];
                    var parameters = {access_token: access_token, email: email, note: note, amount: amount};
                    request.post({url: url, formData: parameters}, function(err, response, body) {
                        res.send('Success!');
                    });
                }
            }

        });

    });
    
});

router.post('/requestall', function (req, res, next) {
    console.log(req.body);

    var username = req.body.user; // OTHER PERSON'S USERNAME. IF YOU WANT YOUR OWN USERNAME IT'S REQ.USER.USERNAME, AS ALWAYS
    var amount = req.body.amount; // AMOUNT BEING PAID/REQUESTED
    var note = req.body.note;     // NOTE ASSOCIATED WITH THING
    var access_token;      
    var user_id;
    var email; 
    var url = 'https://api.venmo.com/v1/payments';

    amount = amount * -1;    

    Account.findOne({username: req.user.username}, function (err, profile) {
        access_token = profile['access_token'];
    
        Account.findOne({username: username}, function (err, profile) {
            if (profile) {
                if (profile['venmo_id']) {
                    user_id = profile['venmo_id'];
                    var parameters = {access_token: access_token, user_id: user_id, note: note, amount: amount};
                    request.post({url: url, formData: parameters}, function(err, response, body) {
                        res.send('Success!');
                    });
                } else {
                    email = profile['email'];
                    var parameters = {access_token: access_token, email: email, note: note, amount: amount};
                    request.post({url: url, formData: parameters}, function(err, response, body) {
                        res.send('Success!');
                    });
                }
            }

        });

    });
    
});

module.exports = router;