const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Insurance = sequelize.define('Insurance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // userId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติ
}, {
    tableName: 'insurances',
    timestamps: false,
});

module.exports = Insurance;