const mongoose = require('mongoose');

var Employee = mongoose.Schema({
    name: {type: String },
    email: { type: String },
    hourlyRate: { type: Number },
    sheet: {
        month: {type: String},
        year: {type: Number},
        hours: {type: Number},
        allowances: { type: Number },
        deduction: { type: Number }
    }
});

module.exports = mongoose.model('Employee', Employee);