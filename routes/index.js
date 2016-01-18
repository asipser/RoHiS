var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/', function (req, res) {
    console.log(req.user);
    res.render('index', {user:req.user});
    
});

router.post('/register', function(req, res) {
    Account.count({username:req.body.username},function(error, count){
        console.log(req.body);

        Account.register(new Account({ username : req.body.username, first_name: req.body.firstName, last_name: req.body.lastName, email: req.body.email}), req.body.password, function(err, account) {
        if (err) {
            console.log("err");
            console.log(err);
            res.render('register', { account : account });
        } else { console.log("successfully added account");
        console.log(account);
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
        }
    });
    })
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });

});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

//search 

router.get('/usersearch',function(req,res){
    name = req.query.name;
    console.log(name);
    var response_data = [];
    Account.find({}, function (err, docs) {
        for(user in docs){
            console.log("User: " + docs[user]['full_name']);
            if(stringStartsWith(docs[user]['full_name'], name)){
                response_data.push({full_name: docs[user]['full_name'],
                                    username: docs[user]['username']});
            }
        }
        res.send(response_data);
    });


});

function stringStartsWith (string, prefix) {
    if(string === undefined)
        return false;
    return string.slice(0, prefix.length) == prefix;
}
module.exports = router;