const mongoose = require('mongoose');
const User = require('./User');
const Counter = require('./Counter');

const insuranceSchema = new mongoose.Schema({
    insuranceID: { type: String, unique: true },
    position: { type: String, default: 'Surveyor' }
});

// ✅ Generate insuranceID อัตโนมัติ
insuranceSchema.pre('save', async function (next) {
    if (this.isNew && !this.insuranceID) {

        const counter = await Counter.findByIdAndUpdate(
            'INSURANCE',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.insuranceID = `E${String(counter.seq).padStart(5, '0')}`;
    }
    next();
});

// ✅ Discriminator จาก User
const Insurance = User.discriminator('insurance', insuranceSchema);

module.exports = Insurance;