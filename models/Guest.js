const { links } = require('express/lib/response');
const mongoose = require('mongoose');

const Guest = new mongoose.Schema({
    name: {type: String, trim: true, default:''},
    date: {type: String, trim: true, default:''},
    car_id: {type: String, trim: true, default:''},
    used: {type: Boolean, trim: true, default:''},
    hashed: {type: String, trim: true, default:''},
    owner_id: {type: mongoose.Types.ObjectId, trim: true, default: ''},
    entrance_img: {
        url: {type: String, trim: true, default: ''},
        filename: {type: String, trim: true, default: ''},
        dateUploaded: {type: String, trim: true, default: ''}
    }

});

module.exports = mongoose.model('Guest', Guest);