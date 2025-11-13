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
const UrgentRequest = require('./UrgentRequest');
const AdditionalApprove = require('./AdditionalApprove');
const ChooseGarageRequest = require('./ChooseGarageRequest');
const Policy = require('./Policy');
const ClaimStatus = require('./ClaimStatus');

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
    UrgentRequest,
    AdditionalApprove,
    ChooseGarageRequest,
    Policy,
    ClaimStatus
};

// 3. กำหนดความสัมพันธ์ (Associations) ตาม ERD

// User Subclasses (One-to-One)
User.hasOne(Customer, { foreignKey: 'userId', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Insurance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Insurance.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Garage, { foreignKey: 'userId', onDelete: 'CASCADE' });
Garage.belongsTo(User, { foreignKey: 'userId' });

// Car <-> Policy (One-to-One)
//Car.hasOne(Policy, { foreignKey: 'carId', onDelete: 'CASCADE' });
//Policy.belongsTo(Car, { foreignKey: 'carId' });

// Claim <-> ClaimStatus (One-to-One)
Claim.hasOne(ClaimStatus, { foreignKey: 'claimId', onDelete: 'CASCADE' });
ClaimStatus.belongsTo(Claim, { foreignKey: 'claimId' });

// Customer <-> Car (One-to-Many)
Customer.hasMany(Car, { foreignKey: 'customerId', onDelete: 'SET NULL' });
Car.belongsTo(Customer, { foreignKey: 'customerId' });

// Customer <-> Claim (One-to-Many)
Customer.hasMany(Claim, { foreignKey: 'customerId', onDelete: 'SET NULL' });
Claim.belongsTo(Customer, { foreignKey: 'customerId' });

// Car <-> Claim (One-to-Many)
Car.hasMany(Claim, { foreignKey: 'carId', onDelete: 'SET NULL' });
Claim.belongsTo(Car, { foreignKey: 'carId' });

// Insurance <-> Claim (One-to-Many)
Insurance.hasMany(Claim, { foreignKey: 'insuranceId', onDelete: 'SET NULL' });
Claim.belongsTo(Insurance, { foreignKey: 'insuranceId' });

// Garage <-> Claim (One-to-Many)
Garage.hasMany(Claim, { foreignKey: 'garageId', onDelete: 'SET NULL' });
Claim.belongsTo(Garage, { foreignKey: 'garageId' });

// Claim <-> AccidentPhoto (One-to-Many)
Claim.hasMany(AccidentPhoto, { foreignKey: 'claimId', onDelete: 'CASCADE' });
AccidentPhoto.belongsTo(Claim, { foreignKey: 'claimId' });

// Claim <-> RepairItem (One-to-Many)
Claim.hasMany(RepairItem, { foreignKey: 'claimId', onDelete: 'CASCADE' });
RepairItem.belongsTo(Claim, { foreignKey: 'claimId' });

// Claim <-> UrgentRequest (One-to-One)
Claim.hasOne(UrgentRequest, { foreignKey: 'claimId', onDelete: 'CASCADE' });
UrgentRequest.belongsTo(Claim, { foreignKey: 'claimId' });

// Claim <-> AdditionalApprove (One-to-Many)
Claim.hasMany(AdditionalApprove, { foreignKey: 'claimId', onDelete: 'CASCADE' });
AdditionalApprove.belongsTo(Claim, { foreignKey: 'claimId' });

// Claim + Garage <-> ChooseGarageRequest (Many-to-One)
Claim.hasMany(ChooseGarageRequest, { foreignKey: 'claimId', onDelete: 'CASCADE' });
ChooseGarageRequest.belongsTo(Claim, { foreignKey: 'claimId' });

Garage.hasMany(ChooseGarageRequest, { foreignKey: 'garageId', onDelete: 'CASCADE' });
ChooseGarageRequest.belongsTo(Garage, { foreignKey: 'garageId' });

Claim.hasMany(ClaimStatus, { foreignKey: 'claimId' });
ClaimStatus.belongsTo(Claim, { foreignKey: 'claimId' });

module.exports = db;