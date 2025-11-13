const express = require('express');
const router = express.Router();
const { Claim, ClaimStatus, Car } = require('../models'); // นำเข้า Model ที่เกี่ยวข้อง


/**
 * @route   POST /api/claims
 * @desc    สร้างเคสเคลมใหม่
 * @access  Private (Insurance)
 */
router.post('/', async (req, res) => {
    const {
        customerID,
        insuranceID,
        carID,
        location,
        detail,
        priorityLevel, // สังเกตว่า frontend ส่ง priorityLevel แต่ model ไม่มี
        incidentDate,
    } = req.body;

    // TODO: ควรมีการตรวจสอบ validation ของข้อมูลที่รับมา

    try {
        // 1. สร้าง Claim หลัก
        const newClaim = await Claim.create({
            customerId: customerID,
            insuranceId: insuranceID,
            carId: carID,
            location: location,
            detail: detail,
            incidentDate: incidentDate,
            // estimateCost, additionalCost, approvedCost มีค่า default 0
        });

        // 2. สร้างสถานะเริ่มต้น (เช่น 'รอดำเนินการ')
        // (เราต้องใช้ Model 'ClaimStatus' ที่เชื่อมกัน)
        await ClaimStatus.create({
            claimId: newClaim.id,
            status: 'pending', // หรือ 'reported'
            notes: 'เคสถูกสร้างผ่านระบบโดยเจ้าหน้าที่ประกัน',
            // priorityLevel: priorityLevel, // (ถ้า ClaimStatus model มี field นี้)
        });

        // TODO: Frontend คาดหวัง claimNumber แต่ Claim model ไม่มี field นี้
        // เราจะส่ง id กลับไปแทน
        res.status(201).json({
            message: 'Claim created successfully',
            claim: { ...newClaim.toJSON(), claimNumber: `CLM-${newClaim.id}` } // สร้าง claimNumber จำลอง
        });

    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/claims/customer/:customerId
 * @desc    ดึงรายการเคลมทั้งหมดของลูกค้าคนหนึ่ง
 * @access  Private (Customer)
 */
router.get('/customer/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const claims = await Claim.findAll({
            where: { customerId },
            include: [{ model: ClaimStatus },
                {model: Car}]
        });

        // นับจำนวนแต่ละสถานะ
        const summary = {
            total: claims.length,
            pending: claims.filter(c => c.ClaimStatuses?.some(s => s.status === 'pending')).length,
            inProgress: claims.filter(c => c.ClaimStatuses?.some(s => s.status === 'in_progress')).length,
            completed: claims.filter(c => c.ClaimStatuses?.some(s => s.status === 'completed')).length
        };

        res.status(200).json({ claims, summary });
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/claims/customer/:customerId/stats
 * @desc    ดึงสถิติการเคลม (total, ongoing, completed)
 * @access  Private (Customer)
 */
router.get('/customer/:customerId/stats', async (req, res) => {
    const { customerId } = req.params;
    try {
        const claims = await Claim.findAll({
            where: { customerId },
            include: [{ model: ClaimStatus }],
        });

        const total = claims.length;

        //  นับ "กำลังดำเนินการ" จาก state หรือ status ก็ได้
        const ongoing = claims.filter(
            c => c.ClaimStatuses?.some(
                s =>
                    ['pending', 'in_progress', 'open_case'].includes(s.status) ||
                    ['pending', 'in_progress', 'open_case'].includes(s.state)
            )
        ).length;

        // ✅ นับ "เสร็จสิ้น" จาก state หรือ status ก็ได้
        const completed = claims.filter(
            c => c.ClaimStatuses?.some(
                s =>
                    ['completed', 'closed_case'].includes(s.status) ||
                    ['completed', 'closed_case'].includes(s.state)
            )
        ).length;

        res.status(200).json({
            stats: { total, ongoing, completed },
        });
    } catch (error) {
        console.error('Error fetching claim stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



module.exports = router;