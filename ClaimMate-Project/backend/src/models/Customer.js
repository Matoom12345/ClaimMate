const mongoose = require('mongoose');
const User = require('./User'); // ⬅️ import User มาเพื่อสืบทอด

const customerSchema = new mongoose.Schema({
    citizenID:  { type: String, required: true, unique: true  },
    phoneNumber: { type: String, required: true, unique: true  }
});

//ใช้ discriminator เพื่อสร้าง subclass จาก User
const Customer = User.discriminator('Customer', customerSchema);
module.exports = Customer;