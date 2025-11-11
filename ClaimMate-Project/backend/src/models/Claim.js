const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Claim = sequelize.define('Claim', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Foreign Keys (customerId, carId, insuranceId, garageId)
    // จะถูกเพิ่มโดยอัตโนมัติเมื่อคุณตั้งค่าใน 'models/index.js'
    incidentDate: {
        type: DataTypes.DATE,
    },
    location: {
        type: DataTypes.STRING,
    },
    detail: {
        type: DataTypes.TEXT,
    },
    estimateCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
    },
    additionalCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
    },
    approvedCost: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
    },
}, {
    tableName: 'claims',
    timestamps: true, // สร้าง createdAt และ updatedAt
});

module.exports = Claim;