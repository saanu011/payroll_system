const mongoose = require('mongoose');

var Admin = mongoose.Schema({
    name: {type: String},
    email: { type: String},
    password: { type: String}
})

module.exports = mongoose.model('Admin', Admin);