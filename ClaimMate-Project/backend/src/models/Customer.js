const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // userId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติใน 'models/index.js'
    address: {
        type: DataTypes.TEXT,
    },
    citizenId: {
        type: DataTypes.STRING,
        unique: true,
    },
}, {
    tableName: 'customers',
    timestamps: false, // ไม่มี createdAt/updatedAt ตาม ERD
});

module.exports = Customer;