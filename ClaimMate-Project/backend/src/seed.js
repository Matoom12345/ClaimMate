// src/seed.js
const db = require('./models'); // อ้างอิงจาก models/index.js ที่คุณส่งมา

/**
 * ฟังก์ชัน Helper สำหรับสร้างวันที่ (คืนค่าเป็น Date Object)
 * Sequelize จะจัดการแปลงเป็น DATE หรือ DATEONLY ตามที่ Model กำหนด
 */
function getDate(year, month, day, hour = 0, minute = 0) {
    // month ใน JavaScript เริ่มที่ 0 (0 = Jan, 1 = Feb, ...)
    return new Date(year, month - 1, day, hour, minute);
}

async function seedDatabase() {
    console.log('🌱 Starting seeding process (Strictly following models)...');

    try {
        
        await db.sequelize.sync({ force: true });
        console.log('🔄 Database synced! (Dropped old data)');
        
        // --- 1. สร้างพนักงานบริษัทประกัน (Insurance Staff) 3 คน ---
        console.log('👤 Creating Insurance Staff (as per User.js & Insurance.js)...');

        // พนักงานคนที่ 1 (สมเกียรติ)
        const insuranceUser1 = await db.User.create({
            role: 'insurance', firstName: 'สมเกียรติ', lastName: 'ขยันยิ่ง',
            email: 'staff1@claimmate.com', phoneNumber: '0810001111'
        });
        const staff1 = await db.Insurance.create({ userId: insuranceUser1.id });

        // พนักงานคนที่ 2 (อารยา)
        const insuranceUser2 = await db.User.create({
            role: 'insurance', firstName: 'อารยา', lastName: 'ใจดี',
            email: 'staff2@claimmate.com', phoneNumber: '0810002222'
        });
        const staff2 = await db.Insurance.create({ userId: insuranceUser2.id });

        // พนักงานคนที่ 3 (วิชัย)
        const insuranceUser3 = await db.User.create({
            role: 'insurance', firstName: 'วิชัย', lastName: 'ว่องไว',
            email: 'staff3@claimmate.com', phoneNumber: '0810003333'
        });
        const staff3 = await db.Insurance.create({ userId: insuranceUser3.id });

        // --- 2. สร้างอู่ซ่อมรถ (Garages) 10 แห่ง ---
        console.log('🚗 Creating 10 Garages (as per User.js & Garage.js)...');

        // อู่ที่ 1 (มีรูป)
        let garageUser1 = await db.User.create({
            role: 'garage', firstName: 'อู่เค รุ่งเรือง', lastName: 'บริการ',
            email: 'garage1@claimmate.com', phoneNumber: '026158658'
        });
        const garage1 = await db.Garage.create({
            userId: garageUser1.id,
            garageName: 'บจ. เค. รุ่งเรืองบริการ',
            address: '6/9-10 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
            googleMapsUrl: null,
            photoURL: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/garage_1.jpg'
        });

        // อู่ที่ 2 (มีรูป)
        let garageUser2 = await db.User.create({
            role: 'garage', firstName: 'เจริญพงษ์', lastName: 'ออโต้คาร์',
            email: 'garage2@claimmate.com', phoneNumber: '027323054'
        });
        const garage2 = await db.Garage.create({
            userId: garageUser2.id,
            garageName: 'บจ. เจริญพงษ์ ออโต้คาร์',
            address: '1 ซ.รามคำแหง 79/2 ถ.รามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
            googleMapsUrl: null,
            photoURL: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/garage_2.jpg'
        });

        // อู่ที่ 3 (มีรูป)
        let garageUser3 = await db.User.create({
            role: 'garage', firstName: 'ส รุ่งโรจน์', lastName: 'มอเตอร์',
            email: 'garage3@claimmate.com', phoneNumber: '025706895'
        });
        const garage3 = await db.Garage.create({
            userId: garageUser3.id,
            garageName: 'บจ. ส รุ่งโรจน์มอเตอร์เซอร์วิส',
            address: '390 ซ.ลาดปลาเค้า 38 ถ.ลาดปลาเค้า แขวงจรเข้บัว เขตลาดพร้าว กรุงเทพฯ 10230',
            googleMapsUrl: null,
            photoURL: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/garage_3.jpg'
        });

        // อู่ที่ 4 (มีรูป)
        let garageUser4 = await db.User.create({
            role: 'garage', firstName: 'แสงสุวรรณ', lastName: 'กรุ๊ป',
            email: 'garage4@claimmate.com', phoneNumber: '025531791'
        });
        const garage4 = await db.Garage.create({
            userId: garageUser4.id,
            garageName: 'บจ. แสงสุวรรณกรุ๊ป',
            address: '38 ซ.ลาดปลาเค้า 24 แขวงจรเข้บัว เขตลาดพร้าว กรุงเทพฯ 10230',
            googleMapsUrl: null,
            photoURL: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/garage_4.jpg'
        });

        // อู่ที่ 5 (มีรูป)
        let garageUser5 = await db.User.create({
            role: 'garage', firstName: 'อู่โปร 73', lastName: '',
            email: 'garage5@claimmate.com', phoneNumber: '029436281'
        });
        const garage5 = await db.Garage.create({
            userId: garageUser5.id,
            garageName: 'บจ. อู่โปร 73',
            address: '150/1 ซ.ประเสริฐมนูกิจ 29 ถ.ประเสริฐมนูกิจ แขวงจระเข้บัว เขตลาดพร้าว กรุงเทพฯ 10230',
            googleMapsUrl: null,
            photoURL: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/garage_5.jpg'
        });

        // อู่ที่ 6 (ไม่มีรูป)
        let garageUser6 = await db.User.create({
            role: 'garage', firstName: 'เอ็กซเรย์', lastName: 'ออโต้คาร์',
            email: 'garage6@claimmate.com', phoneNumber: '029344848'
        });
        const garage6 = await db.Garage.create({
            userId: garageUser6.id,
            garageName: 'บจ. เอ็กซเรย์ ออโต้คาร์',
            address: '400/1 ซ.ลาดพร้าว 94 แขวงพลับพลา เขตวังทองหลาง กรุงเทพฯ 10310',
            googleMapsUrl: null, photoURL: null
        });

        // อู่ที่ 7 (ไม่มีรูป)
        let garageUser7 = await db.User.create({
            role: 'garage', firstName: 'อ.เจริญ', lastName: 'การช่าง',
            email: 'garage7@claimmate.com', phoneNumber: '024153148'
        });
        const garage7 = await db.Garage.create({
            userId: garageUser7.id,
            garageName: 'อู่ อ.เจริญการช่าง',
            address: '31/38-39 หมู่1 ถ.เอกชัย แขวงบางขุนเทียน เขตจอมทอง กรุงเทพฯ 10150',
            googleMapsUrl: null, photoURL: null
        });

        // อู่ที่ 8 (ไม่มีรูป)
        let garageUser8 = await db.User.create({
            role: 'garage', firstName: 'อรุณยนต์', lastName: '',
            email: 'garage8@claimmate.com', phoneNumber: '024240321'
        });
        await db.Garage.create({
            userId: garageUser8.id,
            garageName: 'อู่อรุณยนต์',
            address: '979 ซ.จรัญ 40 ถ.จรัญฯ แขวงบางยี่ขัน เขตบางพลัด กรุงเทพฯ 10700',
            googleMapsUrl: null, photoURL: null
        });

        // อู่ที่ 9 (ไม่มีรูป)
        let garageUser9 = await db.User.create({
            role: 'garage', firstName: 'สามมิตร', lastName: 'การาจ',
            email: 'garage9@claimmate.com', phoneNumber: '022582148'
        });
        await db.Garage.create({
            userId: garageUser9.id,
            garageName: 'อู่ สามมิตรการาจ',
            address: '592 ซ.ไผ่สิงห์โต ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
            googleMapsUrl: null, photoURL: null
        });

        // อู่ที่ 10 (ไม่มีรูป)
        let garageUser10 = await db.User.create({
            role: 'garage', firstName: 'อารี', lastName: 'การช่าง',
            email: 'garage10@claimmate.com', phoneNumber: '022595535'
        });
        await db.Garage.create({
            userId: garageUser10.id,
            garageName: 'อู่ อารีการช่าง',
            address: '172 ซ.อรรถกระวี 2 ถ.พระราม 4 แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
            googleMapsUrl: null, photoURL: null
        });

        
        // --- 3. สร้างลูกค้า (Customers) 8 คน, รถ (Cars) และ กรมธรรม์ (Policies) ---
        console.log('👥 Creating 8 Customers, Cars, and Policies...');

        // -----------------------------------------------------------------
        // C1-C5: ลูกค้า 5 คนที่ "ไม่มีประวัติเคลม"
        // -----------------------------------------------------------------

        // C1: สมชาย (เงื่อนไข: มีรถ 1 คัน, ประกันชั้น 2)
        console.log('Creating C1: สมชาย (1 car, level 2)...');
        let userC1 = await db.User.create({
            role: 'customer', firstName: 'สมชาย', lastName: 'ใจดี',
            email: 'somchai@email.com', phoneNumber: '0811111111'
        });
        const customerC1 = await db.Customer.create({
            userId: userC1.id, citizenId: '1111111111111'
        });
        let carC1_1 = await db.Car.create({
            customerId: customerC1.id, brand: 'Toyota', model: 'Vios', year: 2018,
            color: 'Silver', engineID: 'ENG-C1-1', licensePlate: 'กข 1234'
        });
        await db.Policy.create({
            carId: carC1_1.id, policyNumber: 'P-001', level: '2',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2'],
            startDate: getDate(2025, 1, 1), endDate: getDate(2026, 1, 1)
        });

        // C2: สมศรี (เงื่อนไข: ประกันหมดอายุ)
        console.log('Creating C2: สมศรี (2 cars, EXPIRED policy)...');
        let userC2 = await db.User.create({
            role: 'customer', firstName: 'สมศรี', lastName: 'มีสุข',
            email: 'somsri@email.com', phoneNumber: '0822222222'
        });
        const customerC2 = await db.Customer.create({
            userId: userC2.id, citizenId: '2222222222222'
        });
        let carC2_1 = await db.Car.create({
            customerId: customerC2.id, brand: 'Honda', model: 'Civic', year: 2020,
            color: 'Black', engineID: 'ENG-C2-1', licensePlate: 'กค 5678'
        });
        await db.Policy.create({
            carId: carC2_1.id, policyNumber: 'P-002', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2024, 3, 1), endDate: getDate(2025, 3, 1) // <-- หมดอายุ
        });
        let carC2_2 = await db.Car.create({
            customerId: customerC2.id, brand: 'Mazda', model: '2', year: 2019,
            color: 'Red', engineID: 'ENG-C2-2', licensePlate: 'ชษ 9999'
        });
        await db.Policy.create({
            carId: carC2_2.id, policyNumber: 'P-003', level: '3+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'],
            startDate: getDate(2024, 5, 15), endDate: getDate(2025, 5, 15) // <-- หมดอายุ
        });

        // C3: มานะ (เงื่อนไข: มี 1 คันเป็นประกันชั้น 1)
        console.log('Creating C3: มานะ (3 cars, 1x level 1)...');
        let userC3 = await db.User.create({
            role: 'customer', firstName: 'มานะ', lastName: 'ขยัน',
            email: 'mana@email.com', phoneNumber: '0833333333'
        });
        const customerC3 = await db.Customer.create({
            userId: userC3.id, citizenId: '3333333333333'
        });
        let carC3_1 = await db.Car.create({
            customerId: customerC3.id, brand: 'Mercedes-Benz', model: 'C220d', year: 2022,
            color: 'White', engineID: 'ENG-C3-1', licensePlate: 'งจ 555'
        });
        await db.Policy.create({
            carId: carC3_1.id, policyNumber: 'P-004', level: '1', // <-- ประกันชั้น 1
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['1'],
            startDate: getDate(2025, 2, 1), endDate: getDate(2026, 2, 1)
        });
        let carC3_2 = await db.Car.create({
            customerId: customerC3.id, brand: 'Ford', model: 'Ranger', year: 2021,
            color: 'Blue', engineID: 'ENG-C3-2', licensePlate: 'ตล 888'
        });
        await db.Policy.create({
            carId: carC3_2.id, policyNumber: 'P-005', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2025, 6, 1), endDate: getDate(2026, 6, 1)
        });
        let carC3_3 = await db.Car.create({
            customerId: customerC3.id, brand: 'Honda', model: 'Scoopy-i', year: 2023,
            color: 'Pink', engineID: 'ENG-C3-3', licensePlate: '1กท 1111'
        });
        await db.Policy.create({
            carId: carC3_3.id, policyNumber: 'P-006', level: '3+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'],
            startDate: getDate(2025, 1, 20), endDate: getDate(2026, 1, 20)
        });

        // C4: ปิติ (เงื่อนไข: มีรถ 5 คัน)
        console.log('Creating C4: ปิติ (5 cars)...');
        let userC4 = await db.User.create({
            role: 'customer', firstName: 'ปิติ', lastName: 'ยินดี',
            email: 'piti@email.com', phoneNumber: '0844444444'
        });
        const customerC4 = await db.Customer.create({
            userId: userC4.id, citizenId: '4444444444444'
        });
        // รถ 5 คัน
        let carC4_1 = await db.Car.create({ customerId: customerC4.id, brand: 'Nissan', model: 'Almera', year: 2019, color: 'Grey', engineID: 'ENG-C4-1', licensePlate: 'บห 4321' });
        await db.Policy.create({ carId: carC4_1.id, policyNumber: 'P-007', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 1, 10), endDate: getDate(2026, 1, 10) });
        let carC4_2 = await db.Car.create({ customerId: customerC4.id, brand: 'Toyota', model: 'Fortuner', year: 2021, color: 'Black', engineID: 'ENG-C4-2', licensePlate: 'บต 4322' });
        await db.Policy.create({ carId: carC4_2.id, policyNumber: 'P-008', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 2, 11), endDate: getDate(2026, 2, 11) });
        let carC4_3 = await db.Car.create({ customerId: customerC4.id, brand: 'Isuzu', model: 'D-Max', year: 2020, color: 'White', engineID: 'ENG-C4-3', licensePlate: 'ผผ 4323' });
        await db.Policy.create({ carId: carC4_3.id, policyNumber: 'P-009', level: '3+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'], startDate: getDate(2025, 3, 12), endDate: getDate(2026, 3, 12) });
        let carC4_4 = await db.Car.create({ customerId: customerC4.id, brand: 'MG', model: 'ZS', year: 2022, color: 'Red', engineID: 'ENG-C4-4', licensePlate: 'ฌฌ 4324' });
        await db.Policy.create({ carId: carC4_4.id, policyNumber: 'P-010', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 4, 13), endDate: getDate(2026, 4, 13) });
        let carC4_5 = await db.Car.create({ customerId: customerC4.id, brand: 'Suzuki', model: 'Swift', year: 2018, color: 'Yellow', engineID: 'ENG-C4-5', licensePlate: 'ฐฐ 4325' });
        await db.Policy.create({ carId: carC4_5.id, policyNumber: 'P-011', level: '3+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'], startDate: getDate(2025, 5, 14), endDate: getDate(2026, 5, 14) });

        // C5: วีระ (เงื่อนไข: มีรถ 5 คัน)
        console.log('Creating C5: วีระ (5 cars)...');
        let userC5 = await db.User.create({
            role: 'customer', firstName: 'วีระ', lastName: 'กล้าหาญ',
            email: 'veera@email.com', phoneNumber: '0855555555'
        });
        const customerC5 = await db.Customer.create({
            userId: userC5.id, citizenId: '5555555555555'
        });
        // รถ 5 คัน
        let carC5_1 = await db.Car.create({ customerId: customerC5.id, brand: 'Honda', model: 'Accord', year: 2022, color: 'Silver', engineID: 'ENG-C5-1', licensePlate: 'ทท 1' });
        await db.Policy.create({ carId: carC5_1.id, policyNumber: 'P-012', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 7, 1), endDate: getDate(2026, 7, 1) });
        let carC5_2 = await db.Car.create({ customerId: customerC5.id, brand: 'Mazda', model: '3', year: 2021, color: 'Blue', engineID: 'ENG-C5-2', licensePlate: 'ทท 2' });
        await db.Policy.create({ carId: carC5_2.id, policyNumber: 'P-013', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 8, 2), endDate: getDate(2026, 8, 2) });
        let carC5_3 = await db.Car.create({ customerId: customerC5.id, brand: 'Toyota', model: 'Yaris', year: 2020, color: 'White', engineID: 'ENG-C5-3', licensePlate: 'ทท 3' });
        await db.Policy.create({ carId: carC5_3.id, policyNumber: 'P-014', level: '3+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'], startDate: getDate(2025, 9, 3), endDate: getDate(2026, 9, 3) });
        let carC5_4 = await db.Car.create({ customerId: customerC5.id, brand: 'Ford', model: 'Everest', year: 2019, color: 'Black', engineID: 'ENG-C5-4', licensePlate: 'ทท 4' });
        await db.Policy.create({ carId: carC5_4.id, policyNumber: 'P-015', level: '3+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'], startDate: getDate(2025, 10, 4), endDate: getDate(2026, 10, 4) });
        let carC5_5 = await db.Car.create({ customerId: customerC5.id, brand: 'BMW', model: 'X1', year: 2020, color: 'Grey', engineID: 'ENG-C5-5', licensePlate: 'ทท 5' });
        await db.Policy.create({ carId: carC5_5.id, policyNumber: 'P-016', level: '2+',remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'], startDate: getDate(2025, 11, 5), endDate: getDate(2026, 11, 5) });


        // -----------------------------------------------------------------
        // C6-C8: ลูกค้า 3 คนที่ "มีประวัติเคลมเสร็จสิ้น"
        // -----------------------------------------------------------------

        // C6: ชูใจ (มีรถ 2 คัน)
        console.log('Creating C6: ชูใจ (2 cars, 1 completed claim)...');
        let userC6 = await db.User.create({
            role: 'customer', firstName: 'ชูใจ', lastName: 'ใฝ่รู้',
            email: 'chujai@email.com', phoneNumber: '0866666666'
        });
        const customerC6 = await db.Customer.create({
            userId: userC6.id, citizenId: '6666666666666'
        });
        const carC6_1 = await db.Car.create({
            customerId: customerC6.id, brand: 'Honda', model: 'CR-V', year: 2020,
            color: 'Bronze', engineID: 'ENG-C6-1', licensePlate: 'สส 111'
        });
        await db.Policy.create({
            carId: carC6_1.id, policyNumber: 'P-017', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2025, 4, 1), endDate: getDate(2026, 4, 1)
        });
        const carC6_2 = await db.Car.create({
            customerId: customerC6.id, brand: 'Toyota', model: 'Camry', year: 2022,
            color: 'Black', engineID: 'ENG-C6-2', licensePlate: 'สส 222'
        });
        await db.Policy.create({
            carId: carC6_2.id, policyNumber: 'P-018', level: '3+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'],
            startDate: getDate(2025, 8, 1), endDate: getDate(2026, 8, 1)
        });

        // C7: นารี (มีรถ 3 คัน)
        console.log('Creating C7: นารี (3 cars, 1 completed claim)...');
        let userC7 = await db.User.create({
            role: 'customer', firstName: 'นารี', lastName: 'งามตา',
            email: 'naree@email.com', phoneNumber: '0877777777'
        });
        const customerC7 = await db.Customer.create({
            userId: userC7.id, citizenId: '7777777777777'
        });
        const carC7_1 = await db.Car.create({
            customerId: customerC7.id, brand: 'Mitsubishi', model: 'Pajero', year: 2021,
            color: 'White', engineID: 'ENG-C7-1', licensePlate: 'นร 1'
        });
        await db.Policy.create({
            carId: carC7_1.id, policyNumber: 'P-019', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2025, 2, 20), endDate: getDate(2026, 2, 20)
        });
        const carC7_2 = await db.Car.create({
            customerId: customerC7.id, brand: 'Honda', model: 'Jazz', year: 2019,
            color: 'Yellow', engineID: 'ENG-C7-2', licensePlate: 'นร 2'
        });
        await db.Policy.create({
            carId: carC7_2.id, policyNumber: 'P-020', level: '3+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'],
            startDate: getDate(2025, 3, 20), endDate: getDate(2026, 3, 20)
        });
        const carC7_3 = await db.Car.create({
            customerId: customerC7.id, brand: 'Nissan', model: 'March', year: 2018,
            color: 'Green', engineID: 'ENG-C7-3', licensePlate: 'นร 3'
        });
        await db.Policy.create({
            carId: carC7_3.id, policyNumber: 'P-021', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2025, 4, 20), endDate: getDate(2026, 4, 20)
        });

        // C8: เอก (มีรถ 2 คัน)
        console.log('Creating C8: เอก (2 cars, 1 completed claim)...');
        let userC8 = await db.User.create({
            role: 'customer', firstName: 'เอก', lastName: 'ใจดี',
            email: 'aek@email.com', phoneNumber: '0888888888'
        });
        const customerC8 = await db.Customer.create({
            userId: userC8.id, citizenId: '8888888888888'
        });
        const carC8_1 = await db.Car.create({
            customerId: customerC8.id, brand: 'Isuzu', model: 'MU-X', year: 2022,
            color: 'Blue', engineID: 'ENG-C8-1', licensePlate: 'ออ 123'
        });
        await db.Policy.create({
            carId: carC8_1.id, policyNumber: 'P-022', level: '3+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['3+'],
            startDate: getDate(2025, 9, 1), endDate: getDate(2026, 9, 1)
        });
        const carC8_2 = await db.Car.create({
            customerId: customerC8.id, brand: 'Toyota', model: 'Altis', year: 2020,
            color: 'Grey', engineID: 'ENG-C8-2', licensePlate: 'ออ 456'
        });
        await db.Policy.create({
            carId: carC8_2.id, policyNumber: 'P-023', level: '2+',
            remainingBalance: db.Policy.COVERAGE_AMOUNTS['2+'],
            startDate: getDate(2025, 10, 1), endDate: getDate(2026, 10, 1)
        });


        // --- 4. สร้างเคสเคลม (Claims) ที่เสร็จสิ้นแล้ว 3 เคส ---
        console.log('📋 Creating 3 completed Claims for C6, C7, C8...');
        // (เราจะใช้ข้อมูล staff1, staff2, staff3 และ garage1, garage2, garage3)

        // เคสที่ 1: ของ ชูใจ (C6)
        const claim1 = await db.Claim.create({
            customerId: customerC6.id,
            carId: carC6_1.id,          // เคลมรถ CR-V
            insuranceId: staff1.id,     // สมเกียรติ (Staff1) เป็นคนรับเคส
            garageId: garage1.id,       // ซ่อมที่อู่ เค. รุ่งเรือง (Garage1)
            incidentDate: getDate(2024, 7, 1, 10, 30), // วันที่เกิดเหตุ (ปีที่แล้ว)
            location: 'หน้าปากซอยลาดพร้าว 101',
            detail: 'คู่กรณีเบียดเลนซ้าย ทำให้กันชนหน้าเสียหาย',
            estimateCost: 15000.0,
            additionalCost: 0,
            approvedCost: 15000.0 // อนุมัติเต็ม
        });
        await db.ClaimStatus.create({
            claimId: claim1.id,
            state: 'completed', // สถานะ: เสร็จสิ้น
            status: 'new', // (ตาม default)
            currentStep: 6, // (ตาม state 'completed')
            reportedDate: getDate(2024, 7, 1, 11, 0), // (วันที่ต่างๆ ที่เกิดขึ้นในอดีต)
            inspectionDate: getDate(2024, 7, 2, 9, 0),
            approvalDate: getDate(2024, 7, 2, 14, 0),
            garageSelectedDate: getDate(2024, 7, 3, 10, 0),
            repairDate: getDate(2024, 7, 5, 8, 30),
            completedDate: getDate(2024, 7, 10, 16, 0),
            isClosed: true // ปิดเคสแล้ว
        });
        await db.AccidentPhoto.create({
            claimId: claim1.id, type: 'damage',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/car_crash_1.jpg',
            caption: 'รอยครูดที่กันชนหน้าซ้าย'
        });
        await db.AccidentPhoto.create({
            claimId: claim1.id, type: 'document',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/document_1.jpg',
            caption: 'ใบขับขี่'
        });
        await db.RepairItem.create({
            claimId: claim1.id, itemName: 'เปลี่ยนกันชนหน้า (เบิกใหม่)', cost: 12000.0, approved: true
        });
        await db.RepairItem.create({
            claimId: claim1.id, itemName: 'ทำสีกันชน', cost: 3000.0, approved: true
        });

        // เคสที่ 2: ของ นารี (C7)
        const claim2 = await db.Claim.create({
            customerId: customerC7.id,
            carId: carC7_1.id,          // เคลมรถ Pajero
            insuranceId: staff2.id,     // อารยา (Staff2) เป็นคนรับเคส
            garageId: garage2.id,       // ซ่อมที่อู่ เจริญพงษ์ (Garage2)
            incidentDate: getDate(2024, 10, 5, 18, 0), 
            location: 'ลานจอดรถห้างสรรพสินค้า',
            detail: 'ถอยชนเสา กระจกมองข้างแตก',
            estimateCost: 8000.0,
            additionalCost: 0,
            approvedCost: 8000.0
        });
        await db.ClaimStatus.create({
            claimId: claim2.id,
            state: 'completed',
            status: 'new',
            currentStep: 6,
            reportedDate: getDate(2024, 10, 5, 18, 30),
            inspectionDate: getDate(2024, 10, 6, 10, 0),
            approvalDate: getDate(2024, 10, 6, 11, 0),
            garageSelectedDate: getDate(2024, 10, 7, 13, 0),
            repairDate: getDate(2024, 10, 8, 9, 0),
            completedDate: getDate(2024, 10, 9, 12, 0),
            isClosed: true
        });
        await db.AccidentPhoto.create({
            claimId: claim2.id, type: 'damage',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/car_crash_2.jpg',
            caption: 'กระจกมองข้างแตก'
        });
        await db.RepairItem.create({
            claimId: claim2.id, itemName: 'เปลี่ยนกระจกมองข้าง (ขวา)', cost: 8000.0, approved: true
        });

        // เคสที่ 3: ของ เอก (C8)
        const claim3 = await db.Claim.create({
            customerId: customerC8.id,
            carId: carC8_2.id,          // เคลมรถ Altis
            insuranceId: staff3.id,     // วิชัย (Staff3) เป็นคนรับเคส
            garageId: garage3.id,       // ซ่อมที่อู่ ส รุ่งโรจน์ (Garage3)
            incidentDate: getDate(2025, 1, 15, 8, 15), 
            location: 'ถนนวิภาวดีรังสิต',
            detail: 'มอเตอร์ไซค์เฉี่ยวประตูหลังซ้ายเป็นรอยยาว',
            estimateCost: 10000.0,
            additionalCost: 0,
            approvedCost: 10000.0
        });
        await db.ClaimStatus.create({
            claimId: claim3.id,
            state: 'completed',
            status: 'new',
            currentStep: 6,
            reportedDate: getDate(2025, 1, 15, 8, 30),
            inspectionDate: getDate(2025, 1, 16, 9, 0),
            approvalDate: getDate(2025, 1, 16, 13, 0),
            garageSelectedDate: getDate(2025, 1, 17, 10, 0),
            repairDate: getDate(2025, 1, 20, 9, 0),
            completedDate: getDate(2025, 1, 25, 17, 0),
            isClosed: true
        });
        await db.AccidentPhoto.create({
            claimId: claim3.id, type: 'damage',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/car_crash_3.jpg',
            caption: 'รอยขูดประตูหลังซ้าย'
        });
        await db.AccidentPhoto.create({
            claimId: claim3.id, type: 'damage',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,h_200,w_300/car_crash_4.jpg',
            caption: 'รอยขูดประตูหน้าซ้าย (เล็กน้อย)'
        });
        await db.RepairItem.create({
            claimId: claim3.id, itemName: 'ซ่อม+ทำสี ประตูหลังซ้าย', cost: 7000.0, approved: true
        });
        await db.RepairItem.create({
            claimId: claim3.id, itemName: 'ซ่อม+ทำสี ประตูหน้าซ้าย', cost: 3000.0, approved: true
        });


        console.log('✅ Seeding process completed successfully.');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        console.log('Database connection closed.');
        await db.sequelize.close(); 
    }
}

// --- รันฟังก์ชัน Seed ---
seedDatabase();