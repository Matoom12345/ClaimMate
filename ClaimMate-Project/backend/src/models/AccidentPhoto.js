const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccidentPhoto = sequelize.define('AccidentPhoto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM(
            'damage','document'
        ),
        allowNull: false,
    },
    // claimId (Foreign Key) จะถูกเพิ่มโดยอัตโนมัติ
    photoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    caption: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'accident_photos',
    timestamps: false,
});

module.exports = AccidentPhoto;