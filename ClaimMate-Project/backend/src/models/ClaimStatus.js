const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClaimStatus = sequelize.define('ClaimStatus', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // claimId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติใน 'models/index.js'
    state: {
        type: DataTypes.ENUM(
            'open_case','survey','approved','choose_garage','repair','completed'
        ),
        defaultValue: 'open_case',
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(
            'new','inspecting'
        ),
        defaultValue: 'new',
        allowNull: false,
    },
    currentStep: {
        type: DataTypes.INTEGER,
        default: 1,
        allowNull: false,
    },
    reportedDate: {
        type: DataTypes.DATE,
    },
    inspectionDate: {
        type: DataTypes.DATE,
    },
    garageSelectedDate: {
        type: DataTypes.DATE,
    },
    repairDate: {
        type: DataTypes.DATE,
    },
    completedDate: {
        type: DataTypes.DATE,
    },
    approvalDate: {
        type: DataTypes.DATE,
    },
    urgentRepair: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    // Sequelize จะสร้าง createdAt ให้อัตโนมัติ
}, {
    tableName: 'claim_statuses',
    timestamps: true, // สร้าง createdAt และ updatedAt
    updatedAt: false, // เราสนใจแค่ 'createdAt' (เวลาที่สถานะนี้ถูกสร้าง)
});

module.exports = ClaimStatus;