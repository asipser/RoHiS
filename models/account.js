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
    email_notifications: { type : Boolean, default : true },
    statistics: { type: Object, default: {num_charges: 0, average_time: 0}},
    current_lent: {type:Number,default:0},
    current_borrowed: {type:Number,default:0},
    greatest_loan: {type:Number, default:null},
    smallest_loan: {type:Number, default:null},
    highest_debt: {type:Number, default:null},
    smallest_debt: {type:Number, default:null},
    date_created: Date,
    number_changes: { type: Number, default: 0},
    graph_current_total: { type: Array, default : [{"changes": 0, "current_total": 0}]}

});

Account.plugin(passportLocalMongoose, {usernameLowerCase:true});

module.exports = mongoose.model('Account', Account);
