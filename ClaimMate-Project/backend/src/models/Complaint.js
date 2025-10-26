const mongoose = require('mongoose');

// Base Schema (Superclass)
const complaintSchema = new mongoose.Schema({
    complaintID:        { type: String, required: true, unique: true }, // id
    claimID:            { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    complaintType:      { type: String, required: true },
    complaintHead:      { type: String, required: true },
    complaintDetail:    { type: String, required: true },


});

// ส่งออก
module.exports = mongoose.model('Complaint', complaintSchema);