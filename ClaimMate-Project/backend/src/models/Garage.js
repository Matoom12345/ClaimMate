const mongoose = require('mongoose');
const User = require('./User');
const Counter = require('./Counter');

const garageSchema = new mongoose.Schema({
    garageID:   { type: String, unique: true, required: true },
    garageName: { type: String, required: true },
    location:   { type: String },
    phoneNumber:{ type: String },
}, { _id: false }); // ใช้ _id เดียวกับ User (discriminator)

garageSchema.pre('validate', async function (next) {
    if (this.isNew && !this.garageID) {
        const counter = await Counter.findByIdAndUpdate(
            'GARAGE',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.garageID = `G${String(counter.seq).padStart(5, '0')}`;
    }
    next();
});

const Garage = User.discriminator('Garage', garageSchema);
module.exports = Garage;