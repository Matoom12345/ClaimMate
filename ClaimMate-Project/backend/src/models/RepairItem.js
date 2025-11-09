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
}, {
    tableName: 'repair_items',
    timestamps: false,
});

module.exports = RepairItem;