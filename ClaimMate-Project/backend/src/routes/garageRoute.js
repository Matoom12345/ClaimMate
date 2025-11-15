const express = require('express');
const router = express.Router();
const db = require('../models');
const { ChooseGarageRequest, Claim, Customer, Car, Garage, User, AdditionalApprove } = require('../models');
const authenticate = require('../middlewares/authenticate');

// ============================================
// Garage Routes
// ============================================

// 📊 GET /api/garage/dashboard - Dashboard stats
// 📊 GET /api/garages/dashboard - Dashboard stats (ฉบับแก้ไข)
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        // 1. หา Garage ID จาก User ที่ Login
        const garage = await Garage.findOne({ where: { userId: req.user.id } });
        if (!garage) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลอู่ซ่อม' });
        }
        const garageId = garage.id;

        // 2. นับจำนวนเคสต่างๆ
        const pendingCount = await db.ChooseGarageRequest.count({
            where: { garageId, garageStatus: 'pending' }
        });

        // ⭐️⭐️⭐️ [FIX 1] ⭐️⭐️⭐️
        // แก้ '$ClaimStatus.currentStatus$' กลับไปเป็น '$ClaimStatus.state$'
        // และ 'in_progress' กลับไปเป็น 'repair' (ตามโค้ดเดิมของคุณ)
        const activeCount = await db.Claim.count({
            where: {
                garageId,
                '$ClaimStatus.state$': 'repair' 
            },
            include: [{ model: db.ClaimStatus, attributes: [] }] 
        });

        const approvalsCount = await db.AdditionalApprove.count({
            where: {
                approvalStatus: 'pending',
                '$Claim.garageId$': garageId
            },
            include: [{ model: db.Claim, attributes: [] }] 
        });

        // --- 3. ดึงรายการซ่อมที่กำลังทำ (Active Repairs) ---
        
        // ⭐️⭐️⭐️ [FIX 2] ⭐️⭐️⭐️ (แก้ที่ where)
        const activeRepairsData = await db.Claim.findAll({
            where: {
                garageId: garage.id,
                '$ClaimStatus.state$': 'repair' 
            },
            include: [
                 // ⭐️ [FIX 3] (แก้ที่ attributes)
                { model: db.ClaimStatus, attributes: ['state'] },
                { model: db.Car, attributes: ['model', 'licensePlate'] }
            ],
            limit: 5, // เอาแค่ 5 รายการล่าสุด
            order: [['updatedAt', 'DESC']]
        });

        // 4. แปลงข้อมูล
        const activeRepairsList = activeRepairsData.map(claim => ({
            id: claim.id,
            carModel: claim.Car?.model || 'N/A',
            licensePlate: claim.Car?.licensePlate || 'N/A',
            // ⭐️⭐️⭐️ [FIX 4] ⭐️⭐️⭐️ (แก้ที่ claim.ClaimStatus.state)
            status: claim.ClaimStatus?.state || 'repair',
        }));

        // --- 5. ดึงรายการอนุมัติล่าสุด (Recent Approvals) ---
        const recentApprovalsData = await db.AdditionalApprove.findAll({
            where: {
                '$Claim.garageId$': garageId
            },
            include: [{
                model: db.Claim,
                attributes: ['id'],
                include: [{ model: db.Car, attributes: ['model'] }]
            }],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        
        // 6. แปลงข้อมูล
        const recentApprovals = recentApprovalsData.map(appr => ({
            id: appr.id,
            carModel: appr.Claim?.Car?.model || 'N/A',
            claimId: appr.claimId,
            type: appr.approvalStatus // อันนี้ถูกต้องแล้ว (จาก Frontend)
        }));


        // 7. ส่งข้อมูลทั้งหมดกลับไป
        res.json({
            success: true,
            data: {
                stats: {
                    pendingClaims: pendingCount,
                    activeRepairs: activeCount,
                    approvalsPending: approvalsCount,
                    completedToday: 0 // (Placeholder)
                },
                activeRepairsList: activeRepairsList,
                recentApprovals: recentApprovals
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard:', error);
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
            if (req.user.role !== 'garage') {
                return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' });
            }
            return res.status(404).json({ message: 'ไม่พบข้อมูลอู่ (โปรดตรวจสอบว่าผูกบัญชีอู่กับ User นี้แล้ว)' });
        }

        // 2. ดึงคำขอที่รออนุมัติ (status: 'pending') สำหรับอู่นี้
        const pendingRequests = await ChooseGarageRequest.findAll({
            where: {
                garageId: garage.id,
                garageStatus: 'pending',
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
        if (request.garageStatus !== 'pending') {
            return res.status(400).json({ message: 'งานนี้ถูกดำเนินการไปแล้ว' });
        }

        const t = await db.sequelize.transaction();

        try {
            // 5.1 ✅ Update ChooseGarageRequest (แก้ไข field ให้ถูกต้อง)
            await ChooseGarageRequest.update(
                { garageStatus: 'accepted' }, // 🔥 แก้จาก 'status' เป็น 'garageStatus'
                { where: { id: requestId }, transaction: t }
            );

            // 5.2 ✅ Update Claim (เชื่อม garageId เข้ากับ Claim)
            await Claim.update(
                { garageId: garage.id },
                { where: { id: request.claimId }, transaction: t }
            );

            // 5.3 🔥 Update ClaimStatus (ตามที่คุณต้องการ)
            await db.ClaimStatus.update(
                {
                    state: 'repair',     // 🔥 เปลี่ยน state
                    currentStep: 4,             // 🔥 เปลี่ยน step
                    garageSelectedDate: new Date() // 🔥 บันทึกวันที่เลือกอู่
                },
                { where: { claimId: request.claimId }, transaction: t }
            );
            // 6. Commit Transaction
            await t.commit();

            res.status(200).json({
                success: true,
                message: 'รับงานสำเร็จ',
                request
            });

        } catch (error) {
            // Rollback ถ้าเกิด error
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error accepting job:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
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
        if (request.garageStatus !== 'pending') {
            return res.status(400).json({ message: 'งานนี้ถูกดำเนินการไปแล้ว' });
        }
        // 🔥 5. Update ChooseGarageRequest
        await ChooseGarageRequest.update(
            { garageStatus: 'rejected' }, // 🔥 แก้ field
            { where: { id: requestId } }
        );

        // 6. ✅ ไม่ต้อง update ClaimStatus (ให้ลูกค้าเลือกอู่ใหม่ได้)

        res.status(200).json({
            success: true,
            message: 'ปฏิเสธงานสำเร็จ',
            request
        });

    } catch (error) {
        console.error('Error rejecting job:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
});

// 🔧 GET /api/garage/repairs - รายการกำลังซ่อม
router.get('/repairs', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // หา Garage ID
        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ message: 'ไม่พบข้อมูลอู่' });
        }
        const repairs = await Claim.findAll({
            where: { garageId: garage.id },
            include: [
                {
                    model: db.ClaimStatus,
                    where: {
                        state: ['choose_garage', 'repair'], // 🔥 เฉพาะงานที่รับแล้ว
                        isClosed: false
                    },
                    required: true
                },
                {
                    model: Car,
                    attributes: ['brand', 'model', 'year', 'licensePlate', 'color']
                },
                {
                    model: Customer,
                    include: [{
                        model: User,
                        attributes: ['firstName', 'lastName', 'phoneNumber']
                    }]
                },
                {
                    model: db.RepairItem,
                    attributes: ['id', 'itemName', 'status']
                }

            ],
            order: [['createdAt', 'DESC']]
        });


        // Format ข้อมูล
        const formattedRepairs = repairs.map(repair => {
            const customer = repair.Customer?.User || {};
            const car = repair.Car || {};
            const status = repair.ClaimStatus || {};
            const items = repair.RepairItems || [];

            // คำนวณ progress (% รายการที่เสร็จ)
            const completedCount = items.filter(i => i.Status?.status === 'completed').length;
            const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

            // คำนวณสถานะรวม
            let overallStatus = 'in_progress';
            if (completedCount === items.length && items.length > 0) {
                overallStatus = 'completed';
            } else if (items.some(i => i.Status?.status === 'in_progress')) {
                overallStatus = 'in_progress';
            }

            return {
                id: `R-${repair.id}`,
                claimId: `CLM-${repair.id}`,
                customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
                phone: customer.phoneNumber || '',
                carModel: `${car.brand} ${car.model} ${car.year}`,
                licensePlate: car.licensePlate || '',
                status: overallStatus,

                startDate: status.garageSelectedDate || repair.createdAt,
                estimatedCompletion: null, // TODO: คำนวณจากวันเริ่ม + 3-5 วัน
                items: repair.RepairItems.map(item => ({
                    id: item.id,
                    label: item.itemName,
                    status: item.status || 'in_progress',
                    cost: item.cost
                })),
                notes: repair.detail || ''
            };
        });

        res.json({
            success: true,
            data: formattedRepairs
        });

    } catch (error) {
        console.error('Error fetching repairs:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
            error: error.message
        });
    }
});


// 2️⃣ GET /api/garages/repairs/:id - ดึงรายละเอียดงานซ่อม
router.get('/repairs/:id', authenticate, async (req, res) => {
    try {
        const repairId = req.params.id.replace('R-', ''); // ตัด prefix R-
        const userId = req.user.id;

        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ message: 'ไม่พบข้อมูลอู่' });
        }

        const repair = await Claim.findOne({
            where: {
                id: repairId,
                garageId: garage.id // ต้องเป็นงานของอู่นี้
            },
            include: [
                { model: db.ClaimStatus },
                {
                    model: Car,
                    attributes: ['brand', 'model', 'year', 'licensePlate', 'color']
                },
                {
                    model: Customer,
                    include: [{ model: User, attributes: ['firstName', 'lastName', 'phoneNumber'] }]
                },
                {
                    model: db.RepairItem,
                    // 🔥 เพิ่ม include AdditionalApprove เพื่อดึงสถานะการอนุมัติ
                    include: [{
                        model: db.AdditionalApprove,
                        as: 'AdditionalApprove',
                        required: false,
                        attributes: ['approvalStatus']
                    }]
                }
            ]
        });

        if (!repair) {
            return res.status(404).json({ message: 'ไม่พบงานซ่อมนี้' });
        }

        // 🔥 เพิ่ม Logic: ถ้า currentStep < 5 → อัปเดตเป็น 5 (repair)
        const status = repair.ClaimStatus;
        if (status && status.currentStep < 5) {
            await db.ClaimStatus.update({
                state: 'repair',
                currentStep: 5,
                repairDate: new Date()
            }, { where: { claimId: repairId } });

            // 🔥 อัปเดต repair object เพื่อส่งกลับไป
            repair.ClaimStatus.state = 'repair';
            repair.ClaimStatus.currentStep = 5;
            repair.ClaimStatus.repairDate = new Date();
        }

        // Format เหมือน GarageRepairs.jsx
        const customer = repair.Customer?.User || {};
        const car = repair.Car || {};
        const items = repair.RepairItems || [];

        const formattedRepair = {
            id: `R-${repair.id}`,
            claimId: `CLM-${repair.id}`,
            customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            phone: customer.phoneNumber || '',
            carModel: `${car.brand} ${car.model} ${car.year}`,
            licensePlate: car.licensePlate || '',
            currentStatus: 'repairing', // TODO: คำนวณจริง
            progress: 0, // TODO: คำนวณจริง
            startDate: repair.ClaimStatus?.garageSelectedDate || repair.createdAt,
            estimatedCompletion: null,
            totalEstimate: repair.estimateCost || 0,
            approvedAmount: repair.approvedCost || repair.estimateCost || 0,
            items: items.map(item => ({
                id: item.id,
                label: item.itemName,
                status: item.status || 'in_progress',
                cost: item.cost,
                isAdditional: item.approved === false, // ถ้ายังไม่ approved = รายการเพิ่มเติม
                approved: item.approved, // true/false
                approvalStatus: item.AdditionalApprove?.approvalStatus || null // 'pending'/'approved'/'rejected'
            })),
            notes: repair.detail || ''
        };

        res.json({
            success: true,
            data: formattedRepair
        });

    } catch (error) {
        console.error('Error fetching repair detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3️⃣ PUT /api/garages/repairs/:id/items/:itemId - อัปเดตสถานะรายการซ่อม
router.put('/repairs/:id/items/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body; // 'pending' | 'in_progress' | 'completed'
        const userId = req.user.id;

        // Validate status
        if (!['in_progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
        }

        // ตรวจสอบว่า item นี้เป็นของอู่นี้จริง
        const item = await db.RepairItem.findOne({
            where: { id: itemId },
            include: [{
                model: Claim,
                as: 'Claim',
                include: [{ model: Garage }]
            }]
        });

        // 🔥 Update status ใน RepairItem โดยตรง
        await db.RepairItem.update(
            { status },
            { where: { id: itemId } }
        );

        res.json({
            success: true,
            message: 'อัปเดตสถานะสำเร็จ'
        });

    } catch (error) {
        console.error('Error updating item status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 💰 POST /api/garage/request-additional - ขออนุมัติเพิ่ม
// 💰 POST /api/garage/request-additional - ขออนุมัติเพิ่ม (แก้ไขแล้ว)
router.post('/request-additional', authenticate, async (req, res) => {
    const { claimId, items, reason } = req.body; // claimId มาจาก repair.claimId.replace('CLM-', '')
    const userId = req.user.id;

    // 1. ตรวจสอบสิทธิ์
    const garage = await Garage.findOne({ where: { userId } });
    if (!garage) {
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์' });
    }

    // 2. ตรวจสอบว่าเป็นงานของอู่นี้จริง
    const claim = await Claim.findOne({
        where: { id: claimId, garageId: garage.id },
        include: [
            {
                model: Car,
                include: [{ model: db.Policy, attributes: ['remainingBalance'] }]
            }
        ]
    });

    if (!claim) {
        return res.status(404).json({ success: false, message: 'ไม่พบเคสนี้' });
    }

    const t = await db.sequelize.transaction();

    try {
        // 3. คำนวณยอดรวม
        const requestedAmount = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
        const currentCost = claim.estimateCost || 0;
        const totalCost = currentCost + requestedAmount;

        // 4. เช็ควงเงินคุ้มครอง
        const remainingBalance = claim.Car?.Policy?.remainingBalance || 0;
        const isWithinBudget = totalCost <= remainingBalance;

        // 5. สร้าง AdditionalApprove
        const approval = await db.AdditionalApprove.create({
            claimId: claimId,
            requestedAmount: requestedAmount,
            approvalStatus: 'pending',
            approvedAmount: 0,
            requestDate: new Date(),
            responseDate: null,
        }, { transaction: t });

        // 6. สร้าง RepairItem (approved = false หรือ true ตามวงเงิน)
        const repairItems = items.map(item => ({
            claimId: claimId,
            itemName: item.label, // ⚠️ ตรงกับ frontend ที่ส่งมาเป็น { label, cost }
            cost: parseFloat(item.cost || 0),
            approved: false,
            status: 'pending',
            additionalApproveId: approval.id
        }));
        await db.RepairItem.bulkCreate(repairItems, { transaction: t });

        // 7. ถ้าอนุมัติทันที → อัปเดต approvedCost
        if (isWithinBudget) {
            await Claim.update(
                { approvedCost: totalCost },
                { where: { id: claimId }, transaction: t }
            );
        }

        await t.commit();

        res.json({
            success: true,
            message: '✅ ส่งคำขออนุมัติไปยังบริษัทประกันภัยแล้ว (รอลูกค้าอนุมัติ)', // 🔥 แก้ message
            data: {
                approvalId: approval.id,
                status: approval.approvalStatus,
                requestedAmount: requestedAmount,
                totalCost: totalCost
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error requesting additional approval:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 📜 GET /api/garage/history - ประวัติงานซ่อม
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // หา Garage ID
        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ message: 'ไม่พบข้อมูลอู่' });
        }

        const history = await db.Claim.findAll({
            where: { garageId: garage.id },
            include: [
                {
                    model: db.ClaimStatus,
                    where: { state: 'completed', isClosed: true },
                    required: true
                },
                {
                    model: Car,
                    attributes: ['brand', 'model', 'licensePlate']
                },
                {
                    model: Customer,
                    include: [{
                        model: User,
                        attributes: ['firstName', 'lastName']
                    }]
                }
            ],
            order: [[db.ClaimStatus, 'completedDate', 'DESC']]
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ✅ POST /api/garage/complete-repair - ปิดงานซ่อม
router.post('/complete-repair', authenticate, async (req, res) => {
    try {
        const { claimId } = req.body;
        const userId = req.user.id;

        // 🔥 1. ตรวจสอบว่าเป็นอู่ที่รับงานจริง
        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ message: 'ไม่มีสิทธิ์' });
        }

        const claim = await Claim.findOne({
            where: { id: claimId, garageId: garage.id }
        });

        if (!claim) {
            return res.status(404).json({ message: 'ไม่พบเคสนี้' });
        }

        // 🔥 2. Update ClaimStatus → completed
        await db.ClaimStatus.update({
            state: 'completed',
            currentStep: 6,  // 🔥 เพิ่ม currentStep
            completedDate: new Date(),
            isClosed: true  // 🔥 ปิดเคส
        }, { where: { claimId } });

        res.json({
            success: true,
            message: 'ปิดงานสำเร็จ'
        });
    } catch (error) {
        console.error('Error completing repair:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================
// Urgent Request Routes (คำขอซ่อมด่วน)
// ============================================

// 🚨 GET /api/garage/urgent-requests
router.get('/urgent-requests', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const garage = await Garage.findOne({ where: { userId } });
        
        if (!garage) {
            return res.status(403).json({ 
                success: false, 
                message: 'ไม่พบข้อมูลอู่' 
            });
        }

        const urgentRequests = await db.UrgentRequest.findAll({
            where: { approver: 'garage' },
            include: [{
                model: db.Claim,
                where: { garageId: garage.id },
                required: true,
                include: [
                    {
                        model: Customer,
                        include: [{ 
                            model: User, 
                            attributes: ['firstName', 'lastName', 'phoneNumber'] 
                        }]
                    },
                    {
                        model: Car,
                        attributes: ['brand', 'model', 'year', 'licensePlate']
                    }
                ]
            }],
            order: [['requestDate', 'DESC']]
        });

        const formattedRequests = urgentRequests.map(request => {
            const claim = request.Claim || {};
            const customer = claim.Customer?.User || {};
            const car = claim.Car || {};

            return {
                id: `URG-${request.id}`,
                urgentRequestId: request.id,
                claimId: `CLM-${claim.id}`,
                customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
                customerPhone: customer.phoneNumber || '',
                carModel: `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim(),
                licensePlate: car.licensePlate || '',
                type: request.type || 'urgent_repair',
                detail: request.detail || '',
                status: request.approvalStatus,
                requestDate: request.requestDate,
                approvalDate: request.approvalDate,
                fileUrl: request.fileUrl
            };
        });

        res.json({
            success: true,
            data: formattedRequests
        });

    } catch (error) {
        console.error('Error fetching urgent requests:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 🚨 POST /api/garage/urgent-requests/:id/approve
router.post('/urgent-requests/:id/approve', authenticate, async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์' });
        }

        const request = await db.UrgentRequest.findOne({
            where: { id: requestId },
            include: [{
                model: db.Claim,
                where: { garageId: garage.id },
                required: true
            }]
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'ไม่พบคำขอนี้' });
        }

        if (request.approvalStatus !== 'pending') {
            return res.status(400).json({ success: false, message: 'คำขอนี้ถูกดำเนินการแล้ว' });
        }

        await db.UrgentRequest.update({
            approvalStatus: 'approved',
            approvalDate: new Date()
        }, { where: { id: requestId } });

        res.json({
            success: true,
            message: 'อนุมัติคำขอซ่อมด่วนสำเร็จ'
        });

    } catch (error) {
        console.error('Error approving urgent request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🚨 POST /api/garage/urgent-requests/:id/reject
router.post('/urgent-requests/:id/reject', authenticate, async (req, res) => {
    try {
        const requestId = req.params.id;
        const { reason } = req.body;
        const userId = req.user.id;

        const garage = await Garage.findOne({ where: { userId } });
        if (!garage) {
            return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์' });
        }

        const request = await db.UrgentRequest.findOne({
            where: { id: requestId },
            include: [{
                model: db.Claim,
                where: { garageId: garage.id },
                required: true
            }]
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'ไม่พบคำขอนี้' });
        }

        if (request.approvalStatus !== 'pending') {
            return res.status(400).json({ success: false, message: 'คำขอนี้ถูกดำเนินการแล้ว' });
        }

        await db.UrgentRequest.update({
            approvalStatus: 'rejected',
            approvalDate: new Date()
        }, { where: { id: requestId } });

        res.json({
            success: true,
            message: 'ปฏิเสธคำขอซ่อมด่วนสำเร็จ'
        });

    } catch (error) {
        console.error('Error rejecting urgent request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
module.exports = router;