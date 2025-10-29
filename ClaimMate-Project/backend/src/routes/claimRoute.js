// src/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');

/* ────────────────────────────────────────────────
   ✅ เปิดเคสใหม่
──────────────────────────────────────────────────*/
router.post('/create', async (req, res) => {
    try {
        const claim = new Claim(req.body);
        await claim.save();
        res.status(201).json(claim);
    } catch (err) {
        console.error('Error creating claim:', err);
        res.status(400).json({ message: err.message });
    }
});

/* ────────────────────────────────────────────────
   ✅ ดึงเคสทั้งหมด (insurance/admin)
──────────────────────────────────────────────────*/
router.get('/all', async (req, res) => {
    try {
        const docs = await Claim.aggregate([
            /* Customer */
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerID',
                    foreignField: 'customerID',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

            /* Insurance */
            {
                $lookup: {
                    from: 'users',
                    localField: 'insuranceID',
                    foreignField: 'insuranceID',
                    as: 'insurance'
                }
            },
            { $unwind: { path: '$insurance', preserveNullAndEmptyArrays: true } },

            /* Car */
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carID',
                    foreignField: 'carID',
                    as: 'car'
                }
            },
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },

            /* Garage */
            {
                $lookup: {
                    from: "users",
                    let: { gID: "$garageID" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$garageID", "$$gID"] } } },
                        { $match: { role: "Garage" } }
                    ],
                    as: "garage"
                }
            },
            { $unwind: { path: "$garage", preserveNullAndEmptyArrays: true } },

            /* PROJECT */
            {
                $project: {
                    id: "$_id",
                    claimNumber: 1,
                    title: 1,
                    detail: 1,
                    location: 1,

                    state: 1,
                    status: 1,
                    currentStep: 1,
                    priorityLevel: 1,
                    isClosed: 1,

                    incidentDate: 1,
                    reportedDate: 1,
                    inspectionDate: 1,
                    approvalDate: 1,
                    garageSelectedDate: 1,
                    repairStartDate: 1,
                    completedDate: 1,

                    estimatedCost: 1,
                    approvedCost: 1,
                    additionalCost: 1,

                    /* Customer */
                    customerID: 1,
                    customerName: {
                        $concat: [
                            { $ifNull: ['$customer.firstName', ''] }, ' ',
                            { $ifNull: ['$customer.lastName', ''] }
                        ]
                    },
                    customerPhone: '$customer.phoneNumber',

                    /* Insurance */
                    insuranceName: {
                        $concat: [
                            { $ifNull: ['$insurance.firstName', ''] }, ' ',
                            { $ifNull: ['$insurance.lastName', ''] }
                        ]
                    },

                    /* Car */
                    carBrand: '$car.brand',
                    carModel: '$car.model',
                    licensePlate: '$car.licensePlate',

                    /* Garage */
                    garageName: '$garage.garageName',
                    garagePhone: '$garage.phoneNumber',
                    garageEmail: '$garage.email'
                }
            }
        ]);

        res.json(docs);
    } catch (err) {
        console.error('Error fetching claims:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ────────────────────────────────────────────────
   ✅ Active Claims ของ Insurance
──────────────────────────────────────────────────*/
router.get('/active', async (req, res) => {
    try {
        const { insuranceID } = req.query;
        if (!insuranceID) return res.status(400).json({ message: 'insuranceID is required' });

        const active = await Claim.aggregate([
            { $match: { insuranceID, isClosed: false } },

            /* Customer */
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerID',
                    foreignField: 'customerID',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

            /* Car */
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carID',
                    foreignField: 'carID',
                    as: 'car'
                }
            },
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    id: "$_id",
                    claimNumber: 1,
                    title: 1,
                    status: 1,
                    priorityLevel: 1,
                    currentStep: 1,
                    location: 1,
                    incidentDate: 1,

                    customerName: {
                        $concat: [
                            { $ifNull: ['$customer.firstName', ''] }, ' ',
                            { $ifNull: ['$customer.lastName', ''] }
                        ]
                    },
                    carBrand:'$car.brand',
                    carModel: '$car.model',
                    carYear: '$car.year',
                    licensePlate: '$car.licensePlate'
                }
            }
        ]);

        res.json(active);
    } catch (err) {
        console.error('Error fetching active claims:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ────────────────────────────────────────────────
   ✅ Customer → เคลมทั้งหมด
──────────────────────────────────────────────────*/
router.get('/customer/:customerID', async (req, res) => {
    try {
        const claims = await Claim.find({ customerID: req.params.customerID })
            .sort({ incidentDate: -1 });

        res.json({ success: true, claims });
    } catch (err) {
        console.error('Error fetching customer claims:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/* ────────────────────────────────────────────────
   ✅ Customer Stats
──────────────────────────────────────────────────*/
router.get('/customer/:customerID/stats', async (req, res) => {
    try {
        const { customerID } = req.params;

        const total = await Claim.countDocuments({ customerID });
        const ongoing = await Claim.countDocuments({ customerID, isClosed: false });
        const completed = await Claim.countDocuments({ customerID, isClosed: true });

        res.json({
            success: true,
            stats: { total, ongoing, completed }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/* ────────────────────────────────────────────────
   ✅ ✅ ✅ Claim Detail (Customer)
   GET /api/claims/detail/:claimNumber
──────────────────────────────────────────────────*/
router.get('/detail/:claimNumber', async (req, res) => {
    try {
        const claimNumber = req.params.claimNumber;

        const claim = await Claim.aggregate([
            { $match: { claimNumber } },

            /* Customer */
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerID',
                    foreignField: 'customerID',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

            /* Insurance Officer */
            {
                $lookup: {
                    from: "users",
                    localField: "insuranceID",
                    foreignField: "insuranceID",   // ✅ FIX
                    as: "insurance"
                }
            },
            { $unwind: { path: "$insurance", preserveNullAndEmptyArrays: true } },

            /* Car */
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carID',
                    foreignField: 'carID',
                    as: 'car'
                }
            },
            { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },

            /* Garage */
            {
                $lookup: {
                    from: "users",
                    let: { gID: "$garageID" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$garageID", "$$gID"] } } },
                        { $match: { role: "Garage" } }
                    ],
                    as: "garage"
                }
            },
            { $unwind: { path: "$garage", preserveNullAndEmptyArrays: true } },

            /* PROJECT */
            {
                $project: {
                    id: "$_id",
                    claimNumber: 1,
                    title: 1,
                    detail: 1,
                    location: 1,

                    state: 1,
                    status: 1,
                    currentStep: 1,
                    priorityLevel: 1,
                    isClosed: 1,

                    incidentDate: 1,
                    reportedDate: 1,
                    inspectionDate: 1,
                    approvalDate: 1,
                    garageSelectedDate: 1,
                    repairStartDate: 1,
                    completedDate: 1,

                    estimatedCost: 1,
                    approvedCost: 1,
                    additionalCost: 1,

                    /* Car */
                    carModel: '$car.model',
                    carBrand: '$car.brand',
                    licensePlate: '$car.licensePlate',
                    carColor: '$car.color',
                    Year: '$car.year',

                    /* Garage */
                    garageName: '$garage.garageName',
                    garagePhone: '$garage.phoneNumber',
                    garageEmail: '$garage.email',

                    /* ✅ Officer (Insurance User) */
                    assignedOfficer: {
                        name: {
                            $concat: [
                                { $ifNull: ['$insurance.firstName', ''] }, ' ',
                                { $ifNull: ['$insurance.lastName', ''] }
                            ]
                        },
                        phone: '$insurance.phoneNumber',
                        email: '$insurance.email'
                    }
                }
            }
        ]);

        res.json({ success: true, claim: claim[0] || null });

    } catch (err) {
        console.error('Error fetching claim detail:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/* ────────────────────────────────────────────────
   ✅ เปลี่ยน state/status + history
──────────────────────────────────────────────────*/
router.patch('/:claimNumber/state', async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const { state, status } = req.body;

        const updated = await Claim.findOneAndUpdate(
            { claimNumber },
            { ...(state ? { state } : {}), ...(status ? { status } : {}) },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Claim not found' });

        res.json(updated);
    } catch (err) {
        console.error('Update state error:', err);
        res.status(400).json({ message: err.message });
    }
});

/* ────────────────────────────────────────────────
   Insurance Dashboard Summary
   GET /api/claims/stats/summary
──────────────────────────────────────────────────*/
router.get('/stats/summary', async (req, res) => {
    try {
        const totalClaims = await Claim.countDocuments({});
        const pendingClaims = await Claim.countDocuments({
            isClosed: false,
            status: { $in: ["new", "survey", "approved", "choose_garage", "repair"] }
        });
        const completedClaims = await Claim.countDocuments({
            isClosed: true
        });

        res.json({
            totalClaims,
            pendingClaims,
            completedClaims
        });
    } catch (err) {
        console.error("Error getting stats:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;