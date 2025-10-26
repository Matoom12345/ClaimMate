const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Car = require('./models/Car');
const Customer = require('./models/Customer');
const User = require('./models/User');
const Garage = require('./models/Garage');
const Employee = require('./models/Employee');
const Claim = require('./models/Claim');


dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // 🔹 ลบข้อมูลเก่าออกก่อน (กันซ้ำ)
        await Promise.all([
            Customer.deleteMany({}),
            //Employee.deleteMany({}),
            Garage.deleteMany({}),
            Car.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('Cleared old data');

        const customers = [
            {
                firstName: 'Harit',
                lastName: 'Manoonnimit',
                email: 'harit.man@ku.th',
                citizenID:  '1869900789127',
                phoneNumber: '0804484873'
            },
            {
                firstName: 'Dheerawat',
                lastName: 'Wongkhunmuang',
                email: 'dhee.won@ku.th',
                citizenID:  '1869903781946',
                phoneNumber: '0964403868'
            },
            {
                firstName: 'jinnaphat',
                lastName: 'Theparat',
                email: 'jin.the@ku.th',
                citizenID:  '1869976496127',
                phoneNumber: '0996184224'
            },

        ]

        const garages = [
            {
                firstName: 'Here',
                lastName: 'HongThong',
                email: 'hong.man@ku.th',
                phoneNumber: '0804484873',
                garageName: 'Here Hong',
                location: '1234 - las vegas'
            },
            {
                firstName: 'Jae',
                lastName: 'Pingpong',
                email: 'ping.won@ku.th',
                phoneNumber: '0964403868',
                garageName: 'Jae Ping',
                location: '1234 - los Angeles'
            },

        ]


        // 🔹 สร้าง array ของรถหลายคัน
        const cars = [
            {
                customerID: customers[0]._id,
                model: 'Toyota Corolla',
                licensePlate: 'กข 1234',
                color: 'White',
                engineID: 'ENG-001',
                policyNumber: 'POL-001',
                insuranceLevel: 1,
                insuranceBalance: 100000
            },
            {
                customerID: customers[1]._id,
                model: 'Honda Civic',
                licensePlate: 'ขง 5678',
                color: 'Black',
                engineID: 'ENG-002',
                policyNumber: 'POL-002',
                insuranceLevel: 2,
                insuranceBalance: 50000
            },
            {
                customerID: customers[2]._id,
                model: 'Mazda 3',
                licensePlate: 'คจ 8888',
                color: 'Red',
                engineID: 'ENG-003',
                policyNumber: 'POL-003',
                insuranceLevel: 1,
                insuranceBalance: 100000
            }
        ]

        const employees = [
            {
                firstName: 'GG',
                lastName:  'EZ',
                email:     'GGEZ@gmail.com',
            }
        ]
        const claims = [
            {
                customerID:        customers[0]._id,
                employeeID:        employees[0]._id,
                carID:             cars[0]._id,
                accidentAddress:  '123 ถนนประชาราษฎร์ แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพมหานคร 10310',
                claimDetail:      'ชนด้านหน้าจากรถที่วิ่งสวนทาง ความเสียหายบริเวณกันชนหน้า ไฟหน้า และฝากระโปรงหน้า',
                claimStatus:      'repair',
                isClosed:         false,
                accidentDate:     Date.now(),
                estPrice:         25000,
                approvedPrice:    25000,
                additionalPrice:  0
            }
        ]


        try {
            // 🔹 เพิ่มทั้งหมดในครั้งเดียว
            await Customer.insertMany(customers);
            await Car.insertMany(cars);
            await Garage.insertMany(garages);
            await Employee.insertMany(employees);
            await Claim.insertMany(claims);

            console.log('Data added successfully:');
        } catch (err) {
            console.error('Insert failed:', err.message);
        } finally {
            await mongoose.connection.close();
            console.log('Connection closed');
        }
    })
    .catch(err => console.error('Connection failed:', err.message));