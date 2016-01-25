var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var nodemailer = require('nodemailer');
var secret = require('../secret/secret');
var transporter = secret['transporter'];

// Loads user settings

router.get('/', function(req, res, next) {

	if (req.user) {
		Account.findOne({username: req.user.username}, function (err, profile) {
			var email_on = profile['email_notifications'];
			res.render('settings', {user:req.user, email_on: email_on});
		});
	} else {
		res.render('settings', {user:req.user});
	}
	

 	
});

router.post('/email', function(req, res, next) {

	if (req.body.emailcheck === "true") {

		Account.findOneAndUpdate({username: req.user.username}, {email_notifications: true}, {new: true}, function(err, profile) {
			res.redirect('/settings/');
		});

	} else {

		Account.findOneAndUpdate({username: req.user.username}, {email_notifications: false}, {new: true}, function(err, profile) {
			res.redirect('/settings/');
		});

	}

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

    Account.findOne({username: req.body.username}, function (err, profile) {

    	if (profile) {

	    	profile.setPassword(text, function() {
				profile.save();
			});

			var mailOptions = {
				from: 'noreply.rohis@gmail.com',
				to: profile['email'],
				subject: "MoneyMatters Temporary Password",
				text: "If you are receiving this email, then you have forgotten your MoneyMatters password. Please use the following temporary password of length SIX to log in: '" + text + "'. You may reset your password via your account settings at http://moneymatters.eastus.cloudapp.azure.com/settings."
			}

			transporter.sendMail(mailOptions);

			res.redirect('/');

		} else {
			res.redirect('/#forgotpwnouser');
		}

    });

});

module.exports = router;