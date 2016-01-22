var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var nodemailer = require('nodemailer');
var secret = require('../secret/secret');
var transporter = secret['transporter'];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('settings', {user:req.user});
});

router.get('/noemailspls', function(req, res, next) {
	Account.findOneAndUpdate({username: req.user.username}, {email_notifications: false}, {new: true}, function(err, profile) {
		console.log(profile);
		res.redirect('/');
	});
});

router.post('/changePassword', function(req, res) {
	req.user.setPassword(req.body.newpassword, function(){
		req.user.save();
	});
	res.redirect('/');
});

router.post('/forgotPassword', function(req, res) {

	var text = "";

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

	req.user.setPassword(text, function() {
		req.user.save();
	});

	

});

module.exports = router;