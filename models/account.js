var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    full_name: String,
    password: String,
    venmo_email: String,
    access_token: String,
    profile_picture_url: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
