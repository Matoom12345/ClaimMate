const sequelize = require('../config/database');

// 1. Import Models ทั้งหมด
const User = require('./User');
const Customer = require('./Customer');
const Insurance = require('./Insurance');
const Garage = require('./Garage');
const Car = require('./Car');
const Claim = require('./Claim');
const AccidentPhoto = require('./AccidentPhoto');
const RepairItem = require('./RepairItem');
// const UrgentRequest = require('./UrgentRequest');
const Policy = require('./Policy'); // <-- [เพิ่ม] Import Policy
const ClaimStatus = require('./ClaimStatus'); // <-- [เพิ่ม] Import ClaimStatus

// 2. สร้าง Object db
const db = {
    sequelize,
    Sequelize: sequelize.Sequelize,
    User,
    Customer,
    Insurance,
    Garage,
    Car,
    Claim,
    AccidentPhoto,
    RepairItem,
    // UrgentRequest,
    Policy, // <-- [เพิ่ม]
    ClaimStatus // <-- [เพิ่ม]
};

// 3. กำหนดความสัมพันธ์ (Associations) ตาม ERD

// User Subclasses (One-to-One)
User.hasOne(Customer, { foreignKey: 'userId', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Insurance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Insurance.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Garage, { foreignKey: 'userId', onDelete: 'CASCADE' });
Garage.belongsTo(User, { foreignKey: 'userId' });

// --- [ความสัมพันธ์ใหม่ ตาม ERD ล่าสุด] ---

// Car <-> Policy (One-to-One)
Car.hasOne(Policy, { foreignKey: 'carId', onDelete: 'CASCADE' });
Policy.belongsTo(Car, { foreignKey: 'carId' });

// Claim <-> ClaimStatus (One-to-Many)
// Claim หนึ่งใบ สามารถมี Status ได้หลายอัน (เป็นประวัติ)
Claim.hasOne(ClaimStatus, { foreignKey: 'claimId', onDelete: 'CASCADE' });
ClaimStatus.belongsTo(Claim, { foreignKey: 'claimId' });

// --- [ความสัมพันธ์อื่นๆ (เหมือนเดิม)] ---

Customer.hasMany(Car, { foreignKey: 'customerId', onDelete: 'SET NULL' });
Car.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(Claim, { foreignKey: 'customerId', onDelete: 'SET NULL' });
Claim.belongsTo(Customer, { foreignKey: 'customerId' });

// UrgentRequest.hasOne(Claim, { foreignKey: 'claimId', onDelete: 'CASCADE' });
// Claim.belongsTo(UrgentRequest, { foreignKey: 'claimId' });

Car.hasMany(Claim, { foreignKey: 'carId', onDelete: 'SET NULL' });
Claim.belongsTo(Car, { foreignKey: 'carId' });

Insurance.hasMany(Claim, { foreignKey: 'insuranceId', onDelete: 'SET NULL' });
Claim.belongsTo(Insurance, { foreignKey: 'insuranceId' });

Garage.hasMany(Claim, { foreignKey: 'garageId', onDelete: 'SET NULL' });
Claim.belongsTo(Garage, { foreignKey: 'garageId' });

Claim.hasMany(AccidentPhoto, { foreignKey: 'claimId', onDelete: 'CASCADE' });
AccidentPhoto.belongsTo(Claim, { foreignKey: 'claimId' });

Claim.hasMany(RepairItem, { foreignKey: 'claimId', onDelete: 'CASCADE' });
RepairItem.belongsTo(Claim, { foreignKey: 'claimId' });


module.exports = db;