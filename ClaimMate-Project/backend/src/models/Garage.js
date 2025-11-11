const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Garage = sequelize.define('Garage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // userId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติ
    garageName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
    },
    googleMapsUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ลิงก์ Google Maps ของอู่',
    },
    photoURL: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'garages',
    timestamps: false,
});

module.exports = Garage;