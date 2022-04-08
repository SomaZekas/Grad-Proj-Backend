const mongoose = require('mongoose')

const Owner = new mongoose.Schema({
    name: {type: String, trim: true, default:''},
    password: {type: String, trim: true, default:''},
    nationality: {type: String, trim: true, default:''},
    national_id: {type: String, trim: true, default:''},
    gender: {type: String, trim: true, default:''},
    religion: {type: String, trim: true, default:''},
    phone: {type: String, trim: true, default:''},
    address: {type: String, trim: true, default:''},
    email: {type: String, trim: true, default: ''},
    active_qr: [{type: mongoose.Types.ObjectId, trim: true}],
    added_by_employee: {type: mongoose.Types.ObjectId, trim: true}


});

module.exports = mongoose.model('Owner', Owner)