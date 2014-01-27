var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
	fbId: String,
	name: String,
	emailId: String
});

module.exports = mongoose.model('User', userSchema);