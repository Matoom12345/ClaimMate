const mongoose = require('mongoose');
const User = require('./User');

// Employee ไม่มี field
const Employee = User.discriminator('Employee', new mongoose.Schema({}, { _id: false }));

module.exports = Employee;