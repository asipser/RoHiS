var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('settings', {user:req.user});
});

module.exports = router;

router.get('/noemailspls', function(req, res, next) {

	Account.findOneAndUpdate({username: req.user.username}, {email_notifications: false}, {new: true}, function(err, profile) {
		console.log(profile);
		res.redirect('/');
	});

});