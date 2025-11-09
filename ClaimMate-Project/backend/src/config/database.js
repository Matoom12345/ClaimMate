const { Sequelize } = require('sequelize');
const path = require('path');

// ตั้งค่าการเชื่อมต่อ Sequelize สำหรับ SQLite
// ฐานข้อมูลจะถูกเก็บไว้ในไฟล์ 'database.sqlite' ที่โฟลเดอร์ backend
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'), // ที่เก็บไฟล์ฐานข้อมูล
    logging: console.log // เปิด log เพื่อดู SQL (ปิดทีหลังได้)
});

module.exports = sequelize;