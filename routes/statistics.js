var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {	
	console.log("user:");
	console.log(JSON.stringify(req.user));
	res.render('statistics', {user:req.user});
});

module.exports = router;

router.post('/usergraph', function(req, res, next) {

	Account.findOne({username: req.user.username}, function (err, profile) {
		var data = profile['graph_current_total'];
		console.log(data);
		res.send(data);
	});

});