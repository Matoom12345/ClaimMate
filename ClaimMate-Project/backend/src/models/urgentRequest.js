const mongoose = require('mongoose');

const urgentRequestSchema = new mongoose.Schema({
    claimNumber: { type: String, unique: true ,required: true }, //เพราะ 1 รายการสเคลม ส่ง request ได้ครั้งเดียว
    type: { type: String, required: true },
    detail: { type: String, required: true},
    fileURL: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('UrgentRequest', urgentRequestSchema);