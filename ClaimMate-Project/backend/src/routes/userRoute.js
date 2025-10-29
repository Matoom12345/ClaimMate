// src/routes/userRoute.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// ✅ ค้นหาลูกค้าจากเลขบัตรประชาชน
router.get("/by-idcard/:idCard", async (req, res) => {
    try {
        const cleanId = req.params.idCard.replace(/-/g, "");

        const user = await Customer.findOne({ citizenID: cleanId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ไม่พบข้อมูลลูกค้า"
            });
        }

        res.json({
            success: true,
            user: {
                customerID: user.customerID,
                citizenID: user.citizenID,
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phoneNumber,
                email: user.email,
                policyNumber: user.policyNumber || "",
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;