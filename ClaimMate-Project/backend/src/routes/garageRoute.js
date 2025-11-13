const express = require('express');
const router = express.Router();
const db = require('../models');
const { ChooseGarageRequest, Claim, Customer, Car, Garage, User } = require('../models');
const authenticate = require('../middlewares/authenticate');

// ============================================
// Garage Routes
// ============================================

// 📊 GET /api/garage/dashboard - Dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        // TODO: เพิ่ม authentication middleware
        const garageId = req.query.garageId; // ชั่วคราว

        // นับจำนวนเคสต่างๆ
        const pendingCount = await db.ChooseGarageRequest.count({
            where: { garageId, garageStatus: 'pending' }
        });

        const activeCount = await db.Claim.count({
            where: {
                garageId,
                '$ClaimStatus.state$': 'repair'
            },
            include: [{ model: db.ClaimStatus }]
        });

        const approvalsCount = await db.AdditionalApprove.count({
            where: {
                approvalStatus: 'pending',
                '$Claim.garageId$': garageId
            },
            include: [{ model: db.Claim }]
        });

        res.json({
            success: true,
            stats: {
                pendingClaims: pendingCount,
                activeRepairs: activeCount,
                approvalsPending: approvalsCount,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 📋 GET /api/garage/pending - รายการรอยืนยัน
router.get('/pending-requests', authenticate, async (req, res) => { // << เพิ่ม authenticate ตรงนี้
    try {
        const userId = req.user.id; // << ใช้งานจาก middleware

        // 1. หา GarageId จาก UserId
        const garage = await Garage.findOne({ where: { userId: userId } });

        if (!garage) {
            // ตรวจสอบ Role ด้วย (เผื่อ Customer มาเรียก)
            if (req.user.role !== 'GARAGE') {
                return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' });
            }
            return res.status(404).json({ message: 'ไม่พบข้อมูลอู่ (โปรดตรวจสอบว่าผูกบัญชีอู่กับ User นี้แล้ว)' });
        }

        // 2. ดึงคำขอที่รออนุมัติ (status: 'pending') สำหรับอู่นี้
        const pendingRequests = await ChooseGarageRequest.findAll({
            where: {
                garageId: garage.id,
                status: 'pending',
            },
            include: [
                {
                    model: Claim,
                    as: 'Claim',
                    include: [
                        {
                            model: Customer,
                            as: 'Customer',
                            include: [{ model: User, as: 'User' }]
                        },
                        {
                            model: Car,
                            as: 'Car',
                        },
                    ],
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json(pendingRequests);

    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
});
router.post('/requests/:id/accept', authenticate, async (req, res) => {
    try {
        const requestId = req.params.id; // นี่คือ ID ของ ChooseGarageRequest
        const userId = req.user.id; // ID ของ User ที่ล็อกอิน (จาก middleware)

        // 1. ค้นหาอู่ที่ล็อกอินอยู่
        const garage = await Garage.findOne({ where: { userId: userId } });
        if (!garage) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดำเนินการ' });
        }

        // 2. ค้นหาใบคำขอ (ChooseGarageRequest)
        const request = await ChooseGarageRequest.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: 'ไม่พบคำขอนี้' });
        }

        // 3. ตรวจสอบสิทธิ์ (Authorization) ว่าอู่ที่ล็อกอิน เป็นอู่ที่ถูกเลือกจริง
        if (request.garageId !== garage.id) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์รับงานนี้' });
        }

        // 4. ตรวจสอบสถานะ (ป้องกันการกดซ้ำ)
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'งานนี้ถูกดำเนินการไปแล้ว' });
        }

        // 5. อัปเดตสถานะใบคำขอ (ChooseGarageRequest)
        request.status = 'accepted';
        await request.save();

        // 6. อัปเดตสถานะเคสหลัก (Claim) (ตามโฟลว์ P22: สถานะลูกค้าอัปเดตเป็น "กำลังซ่อม")
        const claim = await Claim.findByPk(request.claimId);
        if (claim) {
            // ใช้ค่า ENUM จาก 'ClaimStatus.js'
            claim.status = 'REPAIRING';
            await claim.save();
        }

        res.status(200).json({ message: 'รับงานสำเร็จ', request });

    } catch (error) {
        console.error('Error accepting job:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
    }
});

router.post('/requests/:id/reject', authenticate, async (req, res) => {
    try {
        const requestId = req.params.id; // ID ของ ChooseGarageRequest
        const userId = req.user.id;

        // 1. ค้นหาอู่
        const garage = await Garage.findOne({ where: { userId: userId } });
        if (!garage) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดำเนินการ' });
        }

        // 2. ค้นหาใบคำขอ
        const request = await ChooseGarageRequest.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: 'ไม่พบคำขอนี้' });
        }

        // 3. ตรวจสอบสิทธิ์
        if (request.garageId !== garage.id) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ปฏิเสธงานนี้' });
        }

        // 4. ตรวจสอบสถานะ
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'งานนี้ถูกดำเนินการไปแล้ว' });
        }

        // 5. อัปเดตสถานะใบคำขอ (ChooseGarageRequest)
        request.status = 'rejected';
        await request.save();

        // 6. อัปเดตสถานะเคสหลัก (Claim) (ตามโฟลว์ P13: ลูกค้ากลับไปเลือกอู่ใหม่)
        const claim = await Claim.findByPk(request.claimId);
        if (claim) {
            // ใช้ค่า ENUM จาก 'ClaimStatus.js'
            claim.status = 'PENDING_GARAGE'; // "รอการเลือกอู่"
            await claim.save();
        }

        res.status(200).json({ message: 'ปฏิเสธงานสำเร็จ', request });

    } catch (error) {
        console.error('Error rejecting job:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
    }
});

// 🔧 GET /api/garage/repairs - รายการกำลังซ่อม
router.get('/repairs', async (req, res) => {
    try {
        const garageId = req.query.garageId;

        const repairs = await db.Claim.findAll({
            where: { garageId },
            include: [
                {
                    model: db.ClaimStatus,
                    where: { state: 'repair' }
                },
                { model: db.Car },
                { model: db.Customer },
                { model: db.RepairItem }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: repairs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 💰 POST /api/garage/request-additional - ขออนุมัติเพิ่ม
router.post('/request-additional', async (req, res) => {
    try {
        const { claimId, requestedAmount, items, note } = req.body;

        // สร้างคำขออนุมัติ
        const approval = await db.AdditionalApprove.create({
            claimId,
            requestedAmount,
            note
        });

        // เพิ่ม repair items ใหม่
        if (items && items.length > 0) {
            const repairItems = items.map(item => ({
                claimId,
                itemName: item.name,
                cost: item.cost,
                approved: false
            }));
            await db.RepairItem.bulkCreate(repairItems);
        }

        res.json({
            success: true,
            message: 'ส่งคำขออนุมัติสำเร็จ',
            data: approval
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 📜 GET /api/garage/history - ประวัติงานซ่อม
router.get('/history', async (req, res) => {
    try {
        const garageId = req.query.garageId;

        const history = await db.Claim.findAll({
            where: { garageId },
            include: [
                {
                    model: db.ClaimStatus,
                    where: { state: 'completed' }
                },
                { model: db.Car },
                { model: db.Customer }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ✅ POST /api/garage/complete-repair - ปิดงานซ่อม
router.post('/complete-repair', async (req, res) => {
    try {
        const { claimId } = req.body;

        await db.ClaimStatus.update(
            {
                state: 'completed',
                completedDate: new Date()
            },
            { where: { claimId } }
        );

        res.json({
            success: true,
            message: 'ปิดงานสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;