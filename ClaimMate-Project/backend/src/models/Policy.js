const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Policy = sequelize.define('Policy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // carId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติใน 'models/index.js'
    policyNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    level: {
        type: DataTypes.ENUM(
            '1','2','3','2+','3+'
        ),
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY, // เก็บเฉพาะวันที่ (YYYY-MM-DD)
    },
    endDate: {
        type: DataTypes.DATEONLY,
    },
    balance: {
        type: DataTypes.DECIMAL,
    },
}, {
    tableName: 'policies',
    timestamps: true, // สร้าง createdAt และ updatedAt

});

module.exports = Policy;