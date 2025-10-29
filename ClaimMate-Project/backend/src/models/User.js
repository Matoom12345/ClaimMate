const mongoose = require('mongoose');

// ใช้ discriminatorKey เพื่อให้บอกได้ว่าเอกสารนี้เป็น subclass ไหน
const options = { discriminatorKey: 'role', collection: 'users' };

// Base Schema (Superclass)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    role: { type: String, default: 'Employee' } // เพิ่ม default
}, options);

// สร้าง model หลัก
const User = mongoose.model('User', userSchema);
module.exports = User;