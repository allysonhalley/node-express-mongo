const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nem');
mongoose.Promise = global.Promise;

module.exports = mongoose;