var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//simple charge between two people, use different or updated schema for split!

var Charge = new Schema({
    payer: Object, // JSON Object of User in Accounts DB
    recipient: Object, //JSON Object of User in Accounts DB if no workuse stringify
    amount: Number, // amount charged / loaned. Calcualted in dollars.
    completed: Boolean, // has charge been completed
    cancelled: { type: Boolean, default: false},
    date_created: { type: Date, default: Date.now},
    date_completed: Date,
    used_venmo: Boolean
});

module.exports = mongoose.model('Charge', Charge);
