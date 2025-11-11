const express = require('express');
const router = express.Router();
const db = require('../models');

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
router.get('/pending', async (req, res) => {
    try {
        const garageId = req.query.garageId;

        const requests = await db.ChooseGarageRequest.findAll({
            where: { 
                garageId,
                garageStatus: 'pending' 
            },
            include: [
                {
                    model: db.Claim,
                    include: [
                        { model: db.Car },
                        { model: db.Customer },
                        { model: db.ClaimStatus },
                        { model: db.RepairItem }
                    ]
                }
            ],
            order: [['requestDate', 'DESC']]
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ✅ POST /api/garage/accept-repair - ยืนยันรับซ่อม
router.post('/accept-repair', async (req, res) => {
    try {
        const { requestId } = req.body;

        const request = await db.ChooseGarageRequest.findByPk(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบคำขอ'
            });
        }

        // Update request status
        await request.update({
            garageStatus: 'accepted',
            responseDate: new Date()
        });

        // Update claim status
        await db.ClaimStatus.update(
            { state: 'repair', status: 'inspecting' },
            { where: { claimId: request.claimId }}
        );

        res.json({
            success: true,
            message: 'ยืนยันรับซ่อมสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ❌ POST /api/garage/reject-repair - ปฏิเสธงานซ่อม
router.post('/reject-repair', async (req, res) => {
    try {
        const { requestId, reason } = req.body;

        const request = await db.ChooseGarageRequest.findByPk(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบคำขอ'
            });
        }

        await request.update({
            garageStatus: 'rejected',
            responseDate: new Date(),
            rejectReason: reason
        });

        res.json({
            success: true,
            message: 'ปฏิเสธงานสำเร็จ'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
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
            { where: { claimId }}
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