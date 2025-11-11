const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Car = require('./models/Car');
const Customer = require('./models/Customer');
const User = require('./models/User');     // base ของ discriminator
const Garage = require('./models/Garage');
const Insurance = require('./models/Insurance');
const Claim = require('./models/Claim');
const Counter = require('./models/Counter');

dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // ล้างข้อมูลเก่า (users ครอบ Customer/Insurance/Garage)
        await Promise.all([
            Claim.deleteMany({}),
            Car.deleteMany({}),
            User.deleteMany({}),
            Counter.deleteMany({}),
        ]);
        console.log('Cleared old data');

        // seed counters
        await Counter.insertMany([
            { _id: 'CUSTOMER', seq: 0 },
            { _id: 'INSURANCE', seq: 0 },
            { _id: 'GARAGE',   seq: 0 },
            { _id: 'CLAIM',    seq: 0 },
            { _id: 'CAR',      seq: 0 },
            { _id: 'CLAIMHISTORY', seq: 0 },
            { _id: 'REPAIR', seq: 0 },
        ]);

        // --- raw data ---
        const customersData = [
            { firstName: 'หฤษฎ์',     lastName: 'มนูญนิมิตร',   email: 'harit.man@ku.th',    citizenID: '1869900789127', phoneNumber: '0804484873' },
            { firstName: 'สมหมาย', lastName: 'กายา', email: 'dhee.won@ku.th',     citizenID: '1869903781946', phoneNumber: '0964403868' },
            { firstName: 'จันศรี', lastName: 'มีชัย',      email: 'jinnaphat.th@ku.th',      citizenID: '1869976496127', phoneNumber: '0996184224' },

        ];
        const garagesData = [
            { firstName: 'Here', lastName: 'HongThong', email: 'haritzazatv@gmail.com', phoneNumber: '0804484873', garageName: 'Here Hong', location: '1234 - las vegas' },
            { firstName: 'Jae',  lastName: 'Pingpong',  email: 'saniatheparat@gmail.com', phoneNumber: '0964403868', garageName: 'Jae Ping',  location: '1234 - los Angeles' },
        ];
        const insurancesData = [
            { firstName: 'พิมมา', lastName: 'ก้าวไหล', email: 'jidapa.mah@ku.th', phoneNumber: '0964403868' },
            { firstName: 'สมศรี', lastName: 'ดีเสมอ', email: 'nambnanenia@gmail.com', phoneNumber: '0804474765' }
        ];

        // ❗ ห้ามใช้ insertMany กับโมเดลที่มี pre-hook gen id
        const insertedCustomers = await Customer.create(customersData);
        const insertedGarages   = await Garage.create(garagesData);
        const insertedInsurances = await Insurance.create(insurancesData);

        console.log('Customers IDs:', insertedCustomers.map(c => c.customerID));
        console.log('Insurances IDs:', insertedInsurances.map(e => e.insuranceID));
        console.log('Garages IDs:',   insertedGarages.map(g => g.garageID));

        // ✅ ใช้ค่าที่ gen แล้วใน Car
        // เลือกให้ "ตรงกับ schema ของ Car":
        // - ถ้า Car.customerID เป็น "manual string" → ใช้ insertedCustomers[i].customerID
        // - ถ้า Car.customerID เป็น "ObjectId ref" → ใช้ insertedCustomers[i]._id
        const carsData = [
            {
                customerID: insertedCustomers[0].customerID, // หรือ ._id ถ้า schema เป็น ObjectId
                brand: 'Toyota', model: 'Corolla', year: '2022',
                licensePlate: 'กข 1234', color: 'ขาว',
                engineID: 'ENG-001', policyNumber: 'POL-001',
                insuranceLevel: '1', insuranceBalance: 1000000,
                insuranceCreateAt: "2025-10-20",
                insuranceExpireAt: "2030-10-20"
            },
            {
                customerID: insertedCustomers[0].customerID,
                brand: 'Honda', model: 'Civic', year: '2020',
                licensePlate: 'ขง 5678', color: 'ดำ',
                engineID: 'ENG-002', policyNumber: 'POL-002',
                insuranceLevel: '2+', insuranceBalance: 500000,
                insuranceCreateAt: "2028-11-21",
                insuranceExpireAt: "2033-11-21"
            },
            {
                customerID: insertedCustomers[2].customerID,
                brand: 'Mazda', model: '3', year: '2018',
                licensePlate: 'คจ 8888', color: 'แดง',
                engineID: 'ENG-003', policyNumber: 'POL-003',
                insuranceLevel: '3', insuranceBalance: 100000,
                insuranceCreateAt: "2027-09-26",
                insuranceExpireAt: "2032-09-26"
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
        // - ถ้า Claim.customerID/insuranceID/carID เป็น manual string → ใช้ .customerID/.insuranceID/.carID
        // - ถ้าเป็น ObjectId → ใช้ ._id
        const claimsData = [
            {
                customerID: insertedCustomers[0].customerID,  // หรือ _id
                insuranceID: insertedInsurances[0].insuranceID,  // หรือ _id
                carID:      insertedCars[0].carID, // ตาม schema
                location: '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
                detail: 'ชนด้านหน้าจากรถที่วิ่งสวนทาง ความเสียหายบริเวณกันชนหน้า ไฟหน้า และฝากระโปรงหน้า',
                currentStep: 1,
                state: 'repair',
                status: 'new',
                priorityLevel: 'normal',
                isClosed: false,
                incidentDate: '2025-10-20 10:00',
                reportedDate: '2025-10-20 10:02',
            }
        ];

        for (const claimData of claimsData) {
            const claim = new Claim(claimData);
            await claim.save(); // ถ้า gen claimID ใน pre('save') ตรงนี้โอเค
        }

        console.log('Data added successfully');
    } catch (err) {
        console.error('Insert failed:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
})();