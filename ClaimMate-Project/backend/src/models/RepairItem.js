const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RepairItem = sequelize.define('RepairItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // claimId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติ
    itemName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('in_progress', 'completed'),
        defaultValue: 'in_progress',
        allowNull: false,
        comment: 'สถานะการซ่อมล่าสุดของรายการนี้ (เขียนทับได้)'
    }
}, {
    tableName: 'repair_items',
    timestamps: false,
});

module.exports = RepairItem;