const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChooseGarageRequest = sequelize.define('ChooseGarageRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // claimId, garageId (FK) จะถูกเพิ่มอัตโนมัติ
    requestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    garageStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    },
    responseDate: {
        type: DataTypes.DATE,
    },
    rejectReason: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'choose_garage_requests',
    timestamps: true,
});

module.exports = ChooseGarageRequest;