const mongoose = require('mongoose');

// Base Schema (Superclass)
const claimSchema = new mongoose.Schema({
    customerID:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    employeeID:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    carID:          { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    accidentAddress:        { type: String, required: true },
    claimDetail:         { type: String, required: true },
    claimStatus: { type: String, required: true, enum: ['open_case', 'survey', 'approved', 'choose_garage', 'repair','completed'], default: 'open_case'},
    isClosed: { type: Boolean, default: false },
    accidentDate:   { type: Date, default: Date.now },
    estPrice:       { type: Number, required: true },
    approvedPrice:       { type: Number, required: true },
    additionalPrice:       { type: Number, required: true }

});

// ส่งออก
module.exports = mongoose.model('Claim', claimSchema);