var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    first_name: String,
    last_name: String,
    full_name: String,
    password: String,
    email: String,
    venmo_id: String,
    access_token: String,
    profile_picture_url: String,
    information: String,
    statistics: { type: Object, default: {num_charges: 0, average_time: 0}},
    total_lent: {type:Number,default:0},
    total_borrowed: {type:Number,default:0}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
