const mongoose = require('mongoose');

const Admin = new mongoose.Schema({
    national_id: {type: String, trim: true, default:''},
    nationality: {type: String, trim: true, default:''},
    gender: {type: String, trim: true, default:''},
    religion: {type: String, trim: true, default:''},
    name: {type: String, trim: true, default:''},
    phone: {type: String, trim: true, default:''},
    address: {type: String, trim: true, default:''},
    email: {type: String, trim: true, default:''},
    password: {type: String, trim: true, default:''},
    job_title: {type: String, trim: true, default:''},
    added: [{type: mongoose.Types.ObjectId, trim: true}],
    added_by_admin: {type: mongoose.Types.ObjectId, trim: true}


});

module.exports = mongoose.model('Admin', Admin);