const mongoose = require('mongoose');

const Hardware = new mongoose.Schema({
    Device_id: {type: String, trim: true, default:''},
    Gate_location: {type: String, trim: true, default:''},
    no_of_guests_opened: {type: Number, trim: true, default: 0},
    password: {type: String, trim: true, default:''}

});

module.exports = mongoose.model('Hardware', Hardware);