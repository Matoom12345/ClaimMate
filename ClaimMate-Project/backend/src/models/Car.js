const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // customerId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติ
    // [ลบ] policyNumber ถูกลบออกจากตารางนี้
    brand: {
        type: DataTypes.STRING,
    },
    model: {
        type: DataTypes.STRING,
    },
    year: {
        type: DataTypes.INTEGER,
    },
    color: {
        type: DataTypes.STRING,
    },
    engineID: {
        type: DataTypes.STRING,
    },
    licensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'cars',
    timestamps: true,
});

module.exports = Car;