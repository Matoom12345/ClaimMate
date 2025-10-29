// backend/src/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // ใช้ปี เช่น "2025"
    seq: { type: Number, default: 0 } // ตัวเลขเคสล่าสุดของปีนั้น
});

module.exports = mongoose.model('Counter', counterSchema);