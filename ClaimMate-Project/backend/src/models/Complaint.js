const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaintID:        { type: String, required: true }, // id
    claimNumber:            { type: String, required: true },
    complaintType:      { type: String, required: true },
    complaintHead:      { type: String, required: true },
    complaintDetail:    { type: String, required: true },


});

// ส่งออก
module.exports = mongoose.model('Complaint', complaintSchema);