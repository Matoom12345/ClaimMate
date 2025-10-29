// src/routes/carRoute.js
const express = require("express");
const router = express.Router();
const Car = require("../models/Car");

// ✅ ดึงรถทั้งหมดของลูกค้า
router.get("/by-customer/:customerID", async (req, res) => {
    try {
        const customerID = req.params.customerID;

        const cars = await Car.find({ customerID });

        res.json({
            success: true,
            cars
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;