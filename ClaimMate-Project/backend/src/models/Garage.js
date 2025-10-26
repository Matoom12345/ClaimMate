const mongoose = require('mongoose');
const User = require('./User'); // ⬅️ เหมือนกัน

const garageSchema = new mongoose.Schema({
    garageName:  { type: String, required: true },
    location:    { type: String },
    phoneNumber: { type: String },
});

const Garage = User.discriminator('Garage', garageSchema);
module.exports = Garage;