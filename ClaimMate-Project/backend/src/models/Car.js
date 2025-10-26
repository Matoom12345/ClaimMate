const mongoose = require('mongoose');
const {version} = require("mongoose");

const carSchema = new mongoose.Schema({
    customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true },
    color: { type: String, required: true },
    engineID: { type: String, required: true, unique: true },
    policyNumber: { type: String, required: true, unique: true },
    insuranceLevel: { type: Number, enum: [1, 2, 3], required: true },
    insuranceBalance: { type: Number,required: true }
}, {versionKey: false},{ collection: 'cars' }); // <— ให้แน่ใจว่าชื่อ collection ถูกต้อง

module.exports = mongoose.model('Car', carSchema);