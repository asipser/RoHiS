var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

router.post('/charge', function (req, res, next) {

    var username = req.body.user;
    var amount = req.body.amount;
    var note = req.body.note;
    var access_token = null;
    var user_id = null;
    var url = 'https://api.venmo.com/v1/payments';

    if ($('#borroworlent')) {
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
});

module.exports = router;
