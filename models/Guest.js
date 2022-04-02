const mongoose = require('mongoose');

const Guest = new mongoose.Schema({
    name: {type: String, trim: true, default:''},
    date: {type: String, trim: true, default:''},
    car_id: {type: String, trim: true, default:''},
    used: {type: Boolean, trim: true, default:''},
    hashed: {type: String, trim: true, default:''},
    owner_id: {type: mongoose.Types.ObjectId, trim: true}

});

module.exports = mongoose.model('Guest', Guest);