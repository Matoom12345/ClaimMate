const mongoose = require('mongoose');
const User = require('./User');
const Counter = require('./Counter');

const employeeSchema = new mongoose.Schema({
    employeeID: { type: String, unique: true, required: true },
    position:   { type: String, default: 'Surveyor' }
}, { _id: false });

employeeSchema.pre('validate', async function (next) {
    if (this.isNew && !this.employeeID) {
        const counter = await Counter.findByIdAndUpdate(
            'EMPLOYEE',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.employeeID = `E${String(counter.seq).padStart(5, '0')}`;
    }
    next();
});

const Employee = User.discriminator('Employee', employeeSchema);
module.exports = Employee;