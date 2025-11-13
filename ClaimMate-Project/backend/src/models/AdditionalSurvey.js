const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdditionalSurvey = sequelize.define('AdditionalSurvey', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // claimId (FK) จะถูกเพิ่มอัตโนมัติ
    requestedAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    approvalStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    },
    approvedAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    requestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    responseDate: {
        type: DataTypes.DATE,
    },
    rejectedDetail: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'additional_surveys',
    timestamps: true,
});

module.exports = AdditionalSurvey;