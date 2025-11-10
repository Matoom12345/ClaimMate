// src/seed.js
const db = require('./models');
const bcrypt = require('bcrypt');

// ฟังก์ชันหลักสำหรับเพาะข้อมูล
async function seedDatabase() {
    console.log('🌱 Starting seeding process (Find or Create)...');
    
    // 1. เชื่อมต่อฐานข้อมูลก่อน
    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.');

        // 2. สร้าง Hashed Password (รหัสผ่านคือ '123456')
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // --- 3. สร้าง Users ---
        // findOrCreate จะคืนค่าเป็น [instance, created]
        // instance = ข้อมูลที่พบ หรือ ที่เพิ่งสร้าง
        // created = boolean บอกว่าเพิ่งสร้าง (true) หรือ พบข้อมูลเดิม (false)

        const [userCustomer, createdCustomer] = await db.User.findOrCreate({
            where: { email: 'customer@test.com' },
            defaults: {
                password: hashedPassword,
                role: 'customer',
                firstName: 'สมชาย',
                lastName: 'ใจดี',
                phone: '0812345678'
            }
        });
        if (createdCustomer) console.log('👤 Created User: customer@test.com');

        const [userInsurance, createdInsurance] = await db.User.findOrCreate({
            where: { email: 'insurance@test.com' },
            defaults: {
                password: hashedPassword,
                role: 'insurance',
                firstName: 'เจ้าหน้าที่',
                lastName: 'ประกัน',
                phone: '0887654321'
            }
        });
        if (createdInsurance) console.log('👤 Created User: insurance@test.com');

        const [userGarage, createdGarage] = await db.User.findOrCreate({
            where: { email: 'garage@test.com' },
            defaults: {
                password: hashedPassword,
                role: 'garage',
                firstName: 'นายช่าง',
                lastName: 'ซ่อมได้',
                phone: '0899998888'
            }
        });
        if (createdGarage) console.log('👤 Created User: garage@test.com');


        // --- 4. สร้าง Sub-roles (เฉพาะในกรณีที่ User เพิ่งถูกสร้าง) ---
        
        if (createdCustomer) {
            await db.Customer.create({
                userId: userCustomer.id,
                address: '123/45 ถ.สุขุมวิท กทม.',
                citizenId: '1234567890123'
            });
            console.log('🚗 Created Customer profile.');
        }

        if (createdInsurance) {
            await db.Insurance.create({
                userId: userInsurance.id,
                position: 'Surveyor'
            });
            console.log('💼 Created Insurance profile.');
        }

        if (createdGarage) {
            await db.Garage.create({
                userId: userGarage.id,
                garageName: 'อู่ช่างซ่อมได้',
                address: '456/78 ถ.รามอินทรา กทม.'
            });
            console.log('🔧 Created Garage profile.');
        }

        // --- 5. (ตัวอย่าง) สร้างข้อมูลอื่นๆ ---
        // เราจะสร้างรถและกรมธรรม์ให้ลูกค้า ถ้าลูกค้านี้เพิ่งถูกสร้างขึ้นมา
        if (createdCustomer) {
            const car1 = await db.Car.create({
                customerId: userCustomer.id,
                brand: 'Toyota',
                model: 'Vios',
                year: 2020,
                licensePlate: 'กข-1234'
            });
            console.log('🚗 Created Car.');

            await db.Policy.create({
                carId: car1.id,
                policyNumber: 'POLICY-001',
                level: '1',
                startDate: '2024-01-01',
                endDate: '2025-01-01',
                balance: 20000.00
            });
            console.log('🧾 Created Policy.');
        }

        console.log('🎉 Seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // 6. ปิดการเชื่อมต่อ
        await db.sequelize.close();
        console.log('Database connection closed.');
    }
}

// 7. รันฟังก์ชัน
seedDatabase();