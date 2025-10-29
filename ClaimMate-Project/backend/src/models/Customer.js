const mongoose = require('mongoose');
const User = require('./User'); // import User มาเพื่อสืบทอด
const Counter = require('./Counter');

const customerSchema = new mongoose.Schema({
    customerID: { type: String, unique: true },
    citizenID:  { type: String, required: true },

});

customerSchema.pre('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            'CUSTOMER',            // ใช้ key แยก counter
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.customerID = `C${String(counter.seq).padStart(5, '0')}`;
    }
    next();
});

//ใช้ discriminator เพื่อสร้าง subclass จาก User
const Customer = User.discriminator('customer', customerSchema);
module.exports = Customer;