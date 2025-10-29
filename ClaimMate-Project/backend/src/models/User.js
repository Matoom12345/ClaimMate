const mongoose = require('mongoose');

// ใช้ discriminatorKey เพื่อให้บอกได้ว่าเอกสารนี้เป็น subclass ไหน
const options = { discriminatorKey: 'role', collection: 'users' };

// Base Schema (Superclass)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    role: { type: String, default: 'insurance' }, // เพิ่ม default

    avatar: { type: String, default: null },

    // login
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
}, options);

// สร้าง model หลัก
const User = mongoose.model('User', userSchema);
module.exports = User;