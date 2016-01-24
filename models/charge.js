var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
moment().format();
//simple charge between two people, use different or updated schema for split!

var Charge = new Schema({
    payer: Object, // JSON Object of User in Accounts DB
    recipient: Object, //JSON Object of User in Accounts DB if no workuse stringify
    amount: Number, // amount charged / loaned. Calcualted in dollars.
    completed: Boolean, // has charge been completed
    description: String,
    cancelled: { type: Boolean, default: false},
    date_created: Date,
    date_completed: Date,
    date_cancelled: Date,
    used_venmo: Boolean,
    who_cancelled: String,
    who_completed: String,
    creator: String,
});

module.exports = mongoose.model('Charge', Charge);
