const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// วงเงินคุ้มครองคงที่ตามชั้นประกัน
const COVERAGE_AMOUNTS = {
    '1': 1000000,   // ชั้น 1: 1,000,000 บาท
    '2+': 150000,   // ชั้น 2+: 150,000 บาท
    '3+': 100000,   // ชั้น 3+: 100,000 บาท
    '2': 0,    // ชั้น 2: ไม่คุ้มครองค่าซ่อมรถตัวเอง
    '3': 0,    // ชั้น 3: ไม่คุ้มครองค่าซ่อมรถตัวเอง
};

const Policy = sequelize.define('Policy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // carId (FK) จะถูกเพิ่มอัตโนมัติ
    policyNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    level: {
        type: DataTypes.ENUM('1', '2', '3', '2+', '3+'),
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY,
    },
    endDate: {
        type: DataTypes.DATEONLY,
    },
    // วงเงินคงเหลือ (ลดลงตามการเคลม รีเซ็ตเมื่อต่อประกัน)
    remainingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'วงเงินคงเหลือ - รีเซ็ตตามชั้นประกันเมื่อต่ออายุ',
    },
}, {
    tableName: 'policies',
    timestamps: true,
    hooks: {
        // ตั้งค่า remainingBalance อัตโนมัติเมื่อสร้าง Policy ใหม่
        beforeCreate: (policy) => {
            
            // เราจะตั้งค่า default เมื่อมันเป็น null หรือ undefined เท่านั้น
            // เพราะ 0 ถือเป็นค่าที่ถูกต้อง (สำหรับชั้น 2 และ 3)
            if (policy.remainingBalance === undefined || policy.remainingBalance === null) {
                policy.remainingBalance = COVERAGE_AMOUNTS[policy.level];
            }
        }
    }
});

// Export ทั้ง Model และวงเงินคุ้มครอง
Policy.COVERAGE_AMOUNTS = COVERAGE_AMOUNTS;

module.exports = Policy;