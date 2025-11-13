const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Satisfaction = sequelize.define('Satisfaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.FLOAT, // (ใช้ FLOAT หรือ INTEGER แทน NUMBER)
        defaultValue: 0,
        allowNull: false,
    },

}, {
    tableName: 'satisfaction',
    timestamps: false,
});

module.exports = Satisfaction;