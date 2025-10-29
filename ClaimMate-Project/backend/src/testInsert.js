const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Car = require('./models/Car');
const Customer = require('./models/Customer');
const User = require('./models/User');     // base ของ discriminator
const Garage = require('./models/Garage');
const Employee = require('./models/Employee');
const Claim = require('./models/Claim');
const Counter = require('./models/Counter');
const ClaimHistory = require('./models/ClaimHistory');

dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // ล้างข้อมูลเก่า (users ครอบ Customer/Employee/Garage)
        await Promise.all([
            Claim.deleteMany({}),
            Car.deleteMany({}),
            User.deleteMany({}),
            Counter.deleteMany({}),
            ClaimHistory.deleteMany({})
        ]);
        console.log('Cleared old data');

        // seed counters
        await Counter.insertMany([
            { _id: 'CUSTOMER', seq: 0 },
            { _id: 'EMPLOYEE', seq: 0 },
            { _id: 'GARAGE',   seq: 0 },
            { _id: 'CLAIM',    seq: 0 },
            { _id: 'CAR',      seq: 0 },
            { _id: 'CLAIMHISTORY', seq: 0 }
        ]);

        // --- raw data ---
        const customersData = [
            { firstName: 'Harit',     lastName: 'Manoonnimit',   email: 'harit.man@ku.th',    citizenID: '1869900789127', phoneNumber: '0804484873' },
            { firstName: 'Dheerawat', lastName: 'Wongkhunmuang', email: 'dhee.won@ku.th',     citizenID: '1869903781946', phoneNumber: '0964403868' },
            { firstName: 'Jinnaphat', lastName: 'Theparat',      email: 'jin.the@ku.th',      citizenID: '1869976496127', phoneNumber: '0996184224' },
        ];
        const garagesData = [
            { firstName: 'Here', lastName: 'HongThong', email: 'hong.man@ku.th', phoneNumber: '0804484873', garageName: 'Here Hong', location: '1234 - las vegas' },
            { firstName: 'Jae',  lastName: 'Pingpong',  email: 'ping.won@ku.th', phoneNumber: '0964403868', garageName: 'Jae Ping',  location: '1234 - los Angeles' },
        ];
        const employeesData = [
            { firstName: 'GG', lastName: 'EZ', email: 'GGEZ@gmail.com' }
        ];

        // ❗ ห้ามใช้ insertMany กับโมเดลที่มี pre-hook gen id
        const insertedCustomers = await Customer.create(customersData);
        const insertedGarages   = await Garage.create(garagesData);
        const insertedEmployees = await Employee.create(employeesData);

        console.log('Customers IDs:', insertedCustomers.map(c => c.customerID));
        console.log('Employees IDs:', insertedEmployees.map(e => e.employeeID));
        console.log('Garages IDs:',   insertedGarages.map(g => g.garageID));

        // ✅ ใช้ค่าที่ gen แล้วใน Car
        // เลือกให้ "ตรงกับ schema ของ Car":
        // - ถ้า Car.customerID เป็น "manual string" → ใช้ insertedCustomers[i].customerID
        // - ถ้า Car.customerID เป็น "ObjectId ref" → ใช้ insertedCustomers[i]._id
        const carsData = [
            {
                customerID: insertedCustomers[0].customerID, // หรือ ._id ถ้า schema เป็น ObjectId
                brand: 'Toyota', model: 'Corolla', year: '2022',
                licensePlate: 'กข 1234', color: 'White',
                engineID: 'ENG-001', policyNumber: 'POL-001',
                insuranceLevel: 1, insuranceBalance: 100000
            },
            {
                customerID: insertedCustomers[1].customerID,
                brand: 'Honda', model: 'Civic', year: '2020',
                licensePlate: 'ขง 5678', color: 'Black',
                engineID: 'ENG-002', policyNumber: 'POL-002',
                insuranceLevel: 2, insuranceBalance: 50000
            },
            {
                customerID: insertedCustomers[2].customerID,
                brand: 'Mazda', model: '3', year: '2018',
                licensePlate: 'คจ 8888', color: 'Red',
                engineID: 'ENG-003', policyNumber: 'POL-003',
                insuranceLevel: 1, insuranceBalance: 100000
            }
        ];

        const insertedCars = [];
        for (const carData of carsData) {
            const car = new Car(carData);
            const saved = await car.save(); // อย่าปิด validate ถ้ามี pre('validate') gen carID
            insertedCars.push(saved);
        }
        console.log('Car IDs:', insertedCars.map(c => c.carID ?? c._id.toString()));

        // ใช้ค่าที่ gen แล้วใน Claim
        // เลือกให้ตรงกับ schema Claim:
        // - ถ้า Claim.customerID/employeeID/carID เป็น manual string → ใช้ .customerID/.employeeID/.carID
        // - ถ้าเป็น ObjectId → ใช้ ._id
        const claimsData = [
            {
                customerID: insertedCustomers[0].customerID,  // หรือ _id
                employeeID: insertedEmployees[0].employeeID,  // หรือ _id
                carID:      insertedCars[0].carID, // ตาม schema
                location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
                detail: 'ชนด้านหน้าจากรถที่วิ่งสวนทาง ความเสียหายบริเวณกันชนหน้า ไฟหน้า และฝากระโปรงหน้า',
                state: 'repair',
                status: 'new',
                priorityLevel: 'normal',
                isClosed: false,
                incidentDate: '2025-10-20/10:00',
                estPrice: 25000,
                approvedPrice: 25000,
                additionalPrice: 0
            }
        ];

        for (const claimData of claimsData) {
            const claim = new Claim(claimData);
            await claim.save(); // ถ้า gen claimID ใน pre('save') ตรงนี้โอเค
        }

        const claimsHistoryData = [
            {
                claimNumber: 'CLM-2025-00001', // ไม่ unique เพราะ 1 claim มีได้หลาย history
                state: 'open_case',
                reportedDate:'2025-10-20/10:00'
            }
        ];

        for (const claimHistoryData of claimsHistoryData) {
            const claimHistory = new ClaimHistory(claimHistoryData);
            await claimHistory.save();
        }

        console.log('Data added successfully');
    } catch (err) {
        console.error('Insert failed:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
})();