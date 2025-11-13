const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // 1. เพิ่ม JWT
const db = require('../models'); // 2. เพิ่ม Sequelize DB
const sendEmail = require('../utils/sendEmail');

// เก็บ OTP ชั่วคราว (ใน production ควรใช้ Redis)
const otpStore = new Map();

// ✅ ส่ง OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`[AUTH DEBUG] Received email: "${email}"`);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกอีเมล'
            });
        }

        // 1. ตรวจสอบว่า email นี้มีอยู่ในฐานข้อมูลหรือไม่
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้งานสำหรับอีเมลนี้'
            });
        }
        // ---------------------

        // สุ่ม OTP 6 หลัก
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // เก็บ OTP (expire ใน 5 นาที)
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // ส่ง Email
        await sendEmail(
            email,
            'รหัส OTP สำหรับเข้าสู่ระบบ ClaimMate',
            `รหัส OTP ของคุณคือ: ${otp}\n\nรหัสนี้จะหมดอายุใน 5 นาที`
        );

        res.json({
            success: true,
            message: 'ส่ง OTP สำเร็จ'
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการส่ง OTP',
            error: error.message
        });
    }
});

// ✅ ยืนยัน OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // ตรวจสอบ OTP
        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({
                success: false,
                message: 'OTP หมดอายุหรือไม่ถูกต้อง'
            });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP หมดอายุ'
            });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP ไม่ถูกต้อง'
            });
        }

        // ✅ OTP ถูกต้อง - ลบออกจาก store
        otpStore.delete(email);

        // 2. ดึงข้อมูล user จาก database
        const user = await db.User.findOne({
            where: { email: email },
            include: [
                { model: db.Customer },
                { model: db.Insurance },
                { model: db.Garage }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน'
            });
        }

        // 3. สร้าง JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token หมดอายุใน 1 วัน
        );

        // --- [ ✅ 4. แก้ไขตรงนี้: สร้าง Payload แบบ Flat ] ---
        // 4.1. แปลง User (Sequelize object) เป็น JSON ธรรมดา
        const userPayload = user.toJSON();

        // 4.2. ดึง ID จาก Profile ที่ซ้อนอยู่ ออกมาไว้ข้างนอก
        if (user.role === 'insurance' && userPayload.Insurance) {
            userPayload.insuranceID = userPayload.Insurance.id; // ⬅️ นี่คือจุดที่แก้!
            userPayload.company = userPayload.Insurance.company;
        } else if (user.role === 'customer' && userPayload.Customer) {
            userPayload.customerID = userPayload.Customer.id;
        } else if (user.role === 'garage' && userPayload.Garage) {
            userPayload.garageID = userPayload.Garage.id;
        }

        // 4.3. (Optional) ลบ Object ที่ซ้อนกันทิ้ง เพื่อความสะอาด
        delete userPayload.Insurance;
        delete userPayload.Customer;
        delete userPayload.Garage;
        // --- [ จบการแก้ไข ] ---


        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            user: userPayload, // ⬅️ ส่ง Payload ที่ "Flat" แล้วกลับไป
            token: token
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการยืนยัน OTP',
            error: error.message
        });
    }
});

module.exports = router;