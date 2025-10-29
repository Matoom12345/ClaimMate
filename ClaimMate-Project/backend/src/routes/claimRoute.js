// src/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const ClaimHistory = require('../models/ClaimHistory');

// เปิดเคสใหม่
router.post('/create', async (req, res) => {
    try {
        const claim = new Claim(req.body); // body ต้องมี customerID, insuranceID, carID
        await claim.save();
        res.status(201).json(claim);
    } catch (err) {
        console.error('Error creating claim:', err);
        res.status(400).json({ message: err.message });
    }
});

// ดึงเคสทั้งหมด (admin)
router.get('/all', async (req, res) => {
    try {
        const docs = await Claim.aggregate([
            // join customer (จาก users)
            { $lookup: {
                    from: 'users',
                    localField: 'customerID',
                    foreignField: 'customerID',
                    as: 'customer'
                }},
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }},

            // join insurance (จาก users)
            { $lookup: {
                    from: 'users',
                    localField: 'insuranceID',
                    foreignField: 'insuranceID',
                    as: 'insurance'
                }},
            { $unwind: { path: 'insurance', preserveNullAndEmptyArrays: true }},

            // join car (จาก cars)
            { $lookup: {
                    from: 'cars',
                    localField: 'carID',
                    foreignField: 'carID',
                    as: 'car'
                }},
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true }},

            // fields ที่จะส่งกลับ
            { $project: {
                    _id: 0,
                    id: '$_id',
                    claimNumber: 1,
                    state: 1,
                    status: 1, // ✅ แทน currentState
                    priorityLevel: 1,
                    isClosed: 1,
                    incidentDate: 1,
                    location: 1,
                    detail: 1,

                    customerID: 1,
                    customerName: {
                        $concat: [
                            { $ifNull: ['$customer.firstName', ''] }, ' ',
                            { $ifNull: ['$customer.lastName', ''] }
                        ]
                    },
                    customerPhone: '$customer.phoneNumber',

                    insuranceID: 1,
                    insuranceName: {
                        $concat: [
                            { $ifNull: ['insurance.firstName', ''] }, ' ',
                            { $ifNull: ['insurance.lastName', ''] }
                        ]
                    },
                    insuranceEmail: '$insurance.email',

                    carID: 1,
                    carBrand: '$car.brand',
                    carModel: '$car.model',
                    carYear: '$car.year',
                    licensePlate: '$car.licensePlate',
                    color: '$car.color',
                }}
        ]);

        res.json(docs);
    } catch (err) {
        console.error('Error fetching claims:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ดึงเคสที่ยังดำเนินการอยู่ (พนักงาน)
router.get('/active', async (req, res) => {
    try {
        const { insuranceID } = req.query;
        if (!insuranceID) return res.status(400).json({ message: 'insuranceID is required' });

        const active = await Claim.aggregate([
            { $match: {
                    insuranceID,
                    status: { $in: ['new', 'inspecting', 'pending_report'] }, // ✅ เปลี่ยน field
                    isClosed: false
                }},

            // join customer
            { $lookup: {
                    from: 'users',
                    localField: 'customerID',
                    foreignField: 'customerID',
                    as: 'customer'
                }},
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }},

            // join car
            { $lookup: {
                    from: 'cars',
                    localField: 'carID',
                    foreignField: 'carID',
                    as: 'car'
                }},
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true }},

            // map data ให้ frontend ใช้
            { $project: {
                    _id: 0,
                    id: '$_id',
                    claimNumber: 1,
                    status: 1, // ✅
                    priorityLevel: 1,
                    location: 1,
                    incidentDate: 1,

                    customerName: {
                        $concat: [
                            { $ifNull: ['$customer.firstName', ''] }, ' ',
                            { $ifNull: ['$customer.lastName', ''] }
                        ]
                    },
                    customerPhone: '$customer.phoneNumber',

                    licensePlate: '$car.licensePlate',
                    carBrand: '$car.brand',
                    carModel: '$car.model',
                    carYear: '$car.year',

                    reportProgress: { $literal: 0 }
                }}
        ]);

        res.json(active);
    } catch (err) {
        console.error('Error fetching active claims:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * 1) ดึงใบเคลมทั้งหมดของ Customer (ตาม customerID)
 * GET /api/claims/customer/:customerID
 */
router.get('/customer/:customerID', async (req, res) => {
    try {
        const { customerID } = req.params;

        const claims = await Claim.find({ customerID }).sort({ incidentDate: -1 });

        return res.json({
            success: true,
            claims
        });

    } catch (err) {
        console.error('Error fetching customer claims:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


/**
 * 2) สถิติเคลมของ Customer
 * GET /api/claims/customer/:customerID/stats
 */
router.get('/customer/:customerID/stats', async (req, res) => {
    try {
        const { customerID } = req.params;

        // 2.1 จำนวนเคลมทั้งหมด
        const total = await Claim.countDocuments({ customerID });

        // 2.2 จำนวนเคลมที่กำลังดำเนินการ
        const ongoing = await Claim.countDocuments({
            customerID,
            isClosed: false
        });

        // 2.3 จำนวนเคลมที่เสร็จสิ้น
        const completed = await Claim.countDocuments({
            customerID,
            isClosed: true
        });

        return res.json({
            success: true,
            stats: {
                total,
                ongoing,
                completed
            }
        });

    } catch (err) {
        console.error('Error fetching customer stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// เปลี่ยนสถานะและบันทึกประวัติ
router.patch('/:claimID/state', async (req, res) => {
    try {
        const { claimID } = req.params;
        const { state, status, reportedDate } = req.body;

        const updated = await Claim.findOneAndUpdate(
            { claimID },
            { ...(state ? { state } : {}), ...(status ? { status } : {}) },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Claim not found' });

        await ClaimHistory.create({
            claimNumber: claimID,
            state: state || updated.state,
            reportedDate: reportedDate || new Date().toISOString().slice(0,16).replace('T','/')
        });

        res.json(updated);
    } catch (err) {
        console.error('Update state error:', err);
        res.status(400).json({ message: err.message });
    }
});

// ดึงสรุปจำนวนเคลม
router.get('/stats/summary', async (req, res) => {
    try {
        // นับทั้งหมด
        const totalClaims = await Claim.countDocuments();

        // เคสที่ยังไม่ปิด (isClosed: false)
        const pendingClaims = await Claim.countDocuments({
            isClosed: false,
        });

        // เคสที่เสร็จสิ้น
        const completedClaims = await Claim.countDocuments({
            state: 'completed' // <-- field ตรงกับใน DB
        });

        res.json({ totalClaims, pendingClaims, completedClaims });
    } catch (err) {
        console.error('Error fetching summary stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;