var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

var request = require("request");

var client_id = "3420";
var client_secret = "nfZrqdjpkb3UDKtFmV4Be8gfqKdnrfsn";

router.get('/auth', function(req, res, next) {
    res.redirect("https://api.venmo.com/v1/oauth/authorize?client_id=3420&scope=make_payments%20access_profile&response_type=code&redirect_uri=http://localhost:3000/venmo/getCode");
});

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

router.get('/checkdata', function (req, res, next) {
    Account.findOne({username: req.user.username}, function (err, profile) {
        res.render('data', {profile: profile});
        });
});






module.exports = router;