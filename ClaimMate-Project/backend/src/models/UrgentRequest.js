const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UrgentRequest = sequelize.define('UrgentRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // claimId (FK) จะถูกเพิ่มอัตโนมัติ
    requestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    approvalStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    },
    approvalDate: {
        type: DataTypes.DATE,
    },
    detail: {
        type: DataTypes.TEXT,
    },
    fileUrl: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'urgent_requests',
    timestamps: true,
});

module.exports = UrgentRequest;