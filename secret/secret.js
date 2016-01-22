
// FOR PERSONAL INFORMATION

var nodemailer = require('nodemailer');

var client_id = "3420";
var client_secret = "nfZrqdjpkb3UDKtFmV4Be8gfqKdnrfsn";

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'noreply.rohis@gmail.com',
        pass: 'rupayanmundo'
    }
});

exports.client_id = client_id;

exports.client_secret = client_secret;

exports.transporter = transporter;