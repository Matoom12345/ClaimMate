const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Base Model
// Import Discriminator Models
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Garage = require('../models/Garage');
// const authMiddleware = require('../middlewares/authMiddleware'); // *สมมติว่ามีการยืนยันตัวตน


// ***********************************************************************************
// * 1. GET /api/users/me: ต้องอยู่ก่อน GET /:id เพื่อแก้ปัญหา Cast Error
// ***********************************************************************************
router.get('/me', /* authMiddleware, */ async (req, res) => {
    try {
        // *******************************************************************
        // * สมมติ: Custom ID และ Role ถูกส่งมาใน req.user จาก Auth Middleware
        // *******************************************************************
        // const customId = req.user.customId;
        // const role = req.user.role;

        // *** สำหรับการทดสอบ (หากไม่มี Auth Middleware) ***
        // ให้กำหนดค่าเองชั่วคราวเพื่อทดสอบ (ต้องมีข้อมูลใน MongoDB)
        const customId = 'E00001';
        const role = 'Employee';
        // *******************************************************************

        if (!customId || !role) {
            return res.status(401).json({ message: 'Authentication data (ID or Role) missing.' });
        }

        let Model;
        let query = {};
        let selectFields = 'firstName lastName email role -_id';

        switch (role) {
            case 'Employee':
                Model = Employee;
                query = { employeeID: customId };
                selectFields += ' employeeID position';
                break;
            case 'Customer':
                Model = Customer;
                query = { customerID: customId };
                selectFields += ' customerID phoneNumber';
                break;
            case 'Garage':
                Model = Garage;
                query = { garageID: customId };
                selectFields += ' garageID garageName location phoneNumber';
                break;
            default:
                return res.status(400).json({ message: `Invalid user role: ${role}` });
        }

        const userProfile = await Model.findOne(query).select(selectFields);

        if (!userProfile) {
            return res.status(404).json({ message: `${role} profile not found with ID: ${customId}` });
        }

        res.status(200).json(userProfile);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server error' });
    }
});
// ***********************************************************************************
// * สิ้นสุด /me endpoint
// ***********************************************************************************


// ***********************************************************************************
// * 2. GET /:id: (ต้องอยู่หลัง /me)
// ***********************************************************************************
// GET: ดึง user ตาม id (เดิม)
router.get('/:id', async (req, res) => {
    try {
        // Route นี้จะทำงานเฉพาะเมื่อเป็น MongoDB ObjectId เท่านั้น
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        // ในกรณีที่ส่งค่าที่ไม่ใช่ ObjectId มา (เช่นส่ง ID Custom มา), Mongoose จะโยน Error
        // หากคุณต้องการรองรับการค้นหาด้วย Custom ID ด้วย คุณต้องแก้ไข Logic ในส่วนนี้
        res.status(500).json({ error: err.message });
    }
});
// ***********************************************************************************


// GET: ดึง user ทั้งหมด (เดิม)
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// POST: เพิ่ม user ใหม่ (เดิม)
router.post('/', async (req, res) => {
    try {
        // ต้องตรวจสอบ Role และใช้ Model ที่ถูกต้องในการสร้าง user ใหม่
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT: แก้ไขข้อมูล user (เดิม)
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // ให้คืนค่า user ที่แก้แล้ว
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: ลบ user (เดิม)
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;