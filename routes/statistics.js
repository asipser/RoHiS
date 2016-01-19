var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('statistics', {user:req.user});
});

module.exports = router;
