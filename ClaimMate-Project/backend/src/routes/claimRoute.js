const express = require("express");
const router = express.Router();

// ❌ ลบ fs, path, และ tempStorage/uploadTemp
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");

const Claim = require("../models/Claim");
const RepairItem = require("../models/RepairItem");
const AccidentPhoto = require("../models/AccidentPhoto");

const upload = require("../middlewares/upload"); // ✅ (ตัวนี้ใช้ memoryStorage)
const cloudinary = require("../config/cloudinary");
const uploadImage = require("../utils/uploadToCloudinary"); // ⭐️ (เพิ่ม import นี้)



/* =====================================================
   ✅ 1) เปิดเคสใหม่
===================================================== */
router.post("/", async (req, res) => {
    try {
        const {
            customerID,
            insuranceID,
            carID,
            title,
            location,
            detail,
            priorityLevel,
            incidentDate,
            reportedDate
        } = req.body;

        // ตรวจข้อมูล
        if (!customerID || !insuranceID || !carID || !title || !location || !detail) {
            return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
        }

        // เช็คเคสเปิดของรถคันนี้
        const existingOpenClaim = await Claim.findOne({
            carID,
            isClosed: false
        });

        if (existingOpenClaim) {
            return res.status(400).json({
                success: false,
                message: `รถคันนี้มีเคสเปิดอยู่แล้ว (${existingOpenClaim.claimNumber})`
            });
        }

        // ✅ create claim (Claim model gen claimNumber อัตโนมัติ)
        const claim = await Claim.create({
            customerID,
            insuranceID,
            carID,
            title,
            location,
            detail,
            priorityLevel,
            incidentDate,
            reportedDate,
            status: "new",
            state: "open_case",
            currentStep: 1,
            isClosed: false
        });

        return res.json({ success: true, claim });

    } catch (error) {
        console.error("CREATE CLAIM ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

/* =====================================================
   ✅ 2) ดึงเคสทั้งหมด (insurance/admin)
===================================================== */
router.get("/all", async (req, res) => {
    try {
        const docs = await Claim.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "customerID",
                    foreignField: "customerID",
                    as: "customer"
                }
            },
            { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "users",
                    localField: "insuranceID",
                    foreignField: "insuranceID",
                    as: "insurance"
                }
            },
            { $unwind: { path: "$insurance", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "cars",
                    localField: "carID",
                    foreignField: "carID",
                    as: "car"
                }
            },
            { $unwind: { path: "$car", preserveNullAndEmptyArrays: true } },

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

                    customerID: 1,
                    customerName: {
                        $concat: [
                            { $ifNull: ["$customer.firstName", ""] },
                            " ",
                            { $ifNull: ["$customer.lastName", ""] }
                        ]
                    },
                    customerPhone: "$customer.phoneNumber",

                    insuranceName: {
                        $concat: [
                            { $ifNull: ["$insurance.firstName", ""] },
                            " ",
                            { $ifNull: ["$insurance.lastName", ""] }
                        ]
                    },

                    carBrand: "$car.brand",
                    carModel: "$car.model",
                    carYear: "$car.year",
                    licensePlate: "$car.licensePlate",
                    carColor: "$car.color",
                    engineID: "$car.engineID",
                    policyNumber: "$car.policyNumber",

                    garageName: "$garage.garageName",
                    garagePhone: "$garage.phoneNumber",
                    garageEmail: "$garage.email"
                }
            }
        ]);

        res.json(docs);

    } catch (err) {
        console.error("Error fetching claims:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* =====================================================
   ✅ 3) Active Claims
===================================================== */
router.get("/active", async (req, res) => {
    try {
        const { insuranceID } = req.query;
        if (!insuranceID)
            return res.status(400).json({ message: "insuranceID is required" });

        const active = await Claim.aggregate([
            { $match: { insuranceID, isClosed: false } },

            {
                $lookup: {
                    from: "users",
                    localField: "customerID",
                    foreignField: "customerID",
                    as: "customer"
                }
            },
            { $unwind: "$customer" },

            {
                $lookup: {
                    from: "cars",
                    localField: "carID",
                    foreignField: "carID",
                    as: "car"
                }
            },
            { $unwind: "$car" },

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
                            "$customer.firstName",
                            " ",
                            "$customer.lastName"
                        ]
                    },

                    carBrand: "$car.brand",
                    carModel: "$car.model",
                    carYear: "$car.year",
                    licensePlate: "$car.licensePlate",
                    engineID: "$car.engineID",
                    policyNumber: "$car.policyNumber"
                }
            }
        ]);

        res.json(active);

    } catch (err) {
        console.error("Error fetching active claims:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* =====================================================
   ✅ 4) Customer → เคลมทั้งหมด
===================================================== */
router.get("/customer/:customerID", async (req, res) => {
    try {
        const claims = await Claim.aggregate([
            { $match: { customerID: req.params.customerID } },

            {
                $lookup: {
                    from: "cars",
                    localField: "carID",
                    foreignField: "carID",
                    as: "car"
                }
            },
            { $unwind: "$car" },

            {
                $project: {
                    _id: 1,
                    claimNumber: 1,
                    title: 1,
                    incidentDate: 1,
                    state: 1,
                    currentStep: 1,
                    isClosed: 1,

                    carModel: "$car.model",
                    licensePlate: "$car.licensePlate",
                    carBrand: "$car.brand",
                    carYear: "$car.year"
                }
            },

            { $sort: { incidentDate: -1 } }
        ]);

        res.json({ success: true, claims });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/* =====================================================
   ✅ 5) Stats
===================================================== */
router.get("/customer/:customerID/stats", async (req, res) => {
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
        console.error("Error fetching stats:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/* =====================================================
   ✅ 6) Detail
===================================================== */
router.get("/detail/:claimNumber", async (req, res) => {
    try {
        const claimNumber = req.params.claimNumber;

        const claim = await Claim.aggregate([
            { $match: { claimNumber } },

            {
                $lookup: {
                    from: "users",
                    localField: "customerID",
                    foreignField: "customerID",
                    as: "customer"
                }
            },
            // --- FIX HERE ---
            { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "users",
                    localField: "insuranceID",
                    foreignField: "insuranceID",
                    as: "insurance"
                }
            },
            // --- FIX HERE ---
            { $unwind: { path: "$insurance", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "cars",
                    localField: "carID",
                    foreignField: "carID",
                    as: "car"
                }
            },
            // --- FIX HERE ---
            { $unwind: { path: "$car", preserveNullAndEmptyArrays: true } },

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

            // ... $project stage ...
            // (ใน $project อาจจะต้องเพิ่มการ check null เช่น $ifNull)
            {
                $project: {
                    id: "$customer.customerID", // อาจเป็น null
                    claimNumber: 1,
                    title: 1,
                    // ... (rest of your fields) ...

                    // ถ้า $unwind แล้วเป็น null, $car.model จะเป็น null
                    // ใช้ $ifNull เพื่อป้องกัน error
                    carModel: { $ifNull: ["$car.model", "N/A"] },
                    carBrand: { $ifNull: ["$car.brand", "N/A"] },
                    carYear: { $ifNull: ["$car.year", "N/A"] },
                    licensePlate: { $ifNull: ["$car.licensePlate", "N/A"] },
                    // ... (rest of car fields) ...

                    garageName: { $ifNull: ["$garage.garageName", "N/A"] },
                    // ... (rest of garage fields) ...

                    assignedOfficer: {
                        name: {
                            $concat: [
                                { $ifNull: ["$insurance.firstName", ""] },
                                " ",
                                { $ifNull: ["$insurance.lastName", ""] }
                            ]
                        },
                        phone: "$insurance.phoneNumber",
                        email: "$insurance.email"
                    },

                    // --- สำคัญมาก: เพิ่มข้อมูลลูกค้าที่นี่ ---
                    // คุณลืมใส่ข้อมูลลูกค้าใน $project
                    customerName: {
                        $concat: [
                            { $ifNull: ["$customer.firstName", ""] },
                            " ",
                            { $ifNull: ["$customer.lastName", ""] }
                        ]
                    },
                    customerPhone: { $ifNull: ["$customer.phoneNumber", "N/A"] },
                    customerEmail: { $ifNull: ["$customer.email", "N/A"] }
                }
            }
        ]);

        res.json({ success: true, claim: claim[0] || null });

    } catch (err) {
        console.error("Detail error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/* =====================================================
   ✅ 7) Update State / Status
===================================================== */
router.patch("/:claimNumber/state", async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const { state, status } = req.body;

        const updated = await Claim.findOneAndUpdate(
            { claimNumber },
            { ...(state && { state }), ...(status && { status }) },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Claim not found" });

        res.json(updated);

    } catch (err) {
        console.error("Update state error:", err);
        res.status(400).json({ message: err.message });
    }
});

/* =====================================================
   ✅ 8) Summary Dashboard
===================================================== */
router.get("/stats/summary", async (req, res) => {
    try {
        const totalClaims = await Claim.countDocuments({});
        const pendingClaims = await Claim.countDocuments({
            isClosed: false,
            status: { $in: ["new", "inspecting", "pending_report"] }
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
        res.status(500).json({ message: "Server error" });
    }
});

router.patch("/:claimNumber", async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const updateData = req.body;

        const updated = await Claim.findOneAndUpdate(
            { claimNumber },
            updateData,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success:false, message:"Claim not found"});

        res.json({ success:true, claim: updated });

    } catch (err) {
        console.error("Update claim error:", err);
        res.status(500).json({ success:false, message: err.message });
    }
});

/* =====================================================
   ✅ 9) Repair Items CRUD
===================================================== */
router.post("/:claimNumber/repair-items", async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const { type, cost, remark } = req.body;

        const item = await RepairItem.create({
            claimNumber,
            type,
            cost,
            remark
        });

        res.json({ success: true, item });

    } catch (err) {
        console.error("Add repair item error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.get("/:claimNumber/repair-items", async (req, res) => {
    try {
        const items = await RepairItem.find({
            claimNumber: req.params.claimNumber
        }).sort({ createdAt: -1 });

        res.json({ success: true, items });

    } catch (err) {
        console.error("Fetch repair items error:", err);
        res.status(500).json({ success: false });
    }
});

router.patch("/repair-items/:repairNumber", async (req, res) => {
    try {
        const updated = await RepairItem.findOneAndUpdate(
            { repairNumber: req.params.repairNumber },
            req.body,
            { new: true }
        );

        res.json({ success: true, item: updated });

    } catch (err) {
        console.error("Update repair item error:", err);
        res.status(500).json({ success: false });
    }
});

router.delete("/repair-items/:repairNumber", async (req, res) => {
    try {
        await RepairItem.findOneAndDelete({
            repairNumber: req.params.repairNumber
        });

        res.json({ success: true });

    } catch (err) {
        console.error("Delete repair item error:", err);
        res.status(500).json({ success: false });
    }
});

/* =====================================================
   ✅ 10) Upload Accident Photos (upload middleware)
===================================================== */
router.post("/:claimNumber/photos", upload.single("photo"), async (req, res) => {
    try {
        const { claimNumber } = req.params;
        const { type, caption } = req.body;

        if (!req.file)
            return res.status(400).json({ success: false, message: "No file uploaded" });

        // ⭐️ แก้ไข: ใช้อัปโหลด Buffer (จาก memoryStorage)
        const result = await uploadImage(
            req.file.buffer,
            `claims/${claimNumber}`
        );

        const saved = await AccidentPhoto.create({
            claimNumber,
            type: type || "damage",
            caption: caption || null,
            photoURL: result.secure_url // ✅ URL จาก cloudinary
        });

        res.json({ success: true, photo: saved });

    } catch (err) {
        console.error("Upload photo error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* =====================================================
   ✅ 11) List Photos
===================================================== */
router.get("/:claimNumber/photos", async (req, res) => {
    try {
        const photos = await AccidentPhoto.find({
            claimNumber: req.params.claimNumber
        }).sort({ createdAt: -1 });

        res.json({ success: true, photos });

    } catch (err) {
        console.error("Fetch photos error:", err);
        res.status(500).json({ success: false });
    }
});

/* =====================================================
   ✅ 12) Delete Photo (Cloudinary + DB)
===================================================== */
router.delete("/photos/:id", async (req, res) => {
    try {
        const photo = await AccidentPhoto.findById(req.params.id);

        if (!photo)
            return res.status(404).json({ success: false, message: "Not found" });

        // --- ✅ START FIX ---
        // แก้ไข Logic การดึง publicId ให้ถูกต้อง
        const url = photo.photoURL;
        const uploadMarker = "/upload/";

        // 1. หาตำแหน่งของ "/upload/"
        const uploadIndex = url.indexOf(uploadMarker);

        // 2. ตัดเอาเฉพาะส่วนที่อยู่หลัง "/upload/" (เช่น v123456/claims/...)
        const afterUpload = url.substring(uploadIndex + uploadMarker.length);

        // 3. หาทับ (/) ตัวแรก (ที่อยู่หลัง v123456) แล้วตัดทิ้งไป
        const publicIdWithExtension = afterUpload.substring(afterUpload.indexOf('/') + 1);

        // 4. ลบนามสกุลไฟล์ .jpg, .png ออก
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");
        // --- ✅ END FIX ---

        // (เพิ่ม Log เพื่อดูว่าเราได้ publicId ถูกต้องหรือไม่)
        console.log("Attempting to delete from Cloudinary. Public ID:", publicId);

        await cloudinary.uploader.destroy(publicId);

        await AccidentPhoto.findByIdAndDelete(req.params.id);

        res.json({ success: true });

    } catch (err) {
        console.error("Delete photo error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* =====================================================
   ✅ 13) Submit Claim → เปลี่ยน state → survey
===================================================== */
router.post("/:claimNumber/submit", async (req, res) => {
    try {
        const { claimNumber } = req.params;

        const updated = await Claim.findOneAndUpdate(
            { claimNumber },
            {
                state: "survey",
                status: "inspecting",
                currentStep: 2,
                inspectionDate: new Date().toISOString().slice(0, 16).replace("T", " ")
            },
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success: false, message: "Not found" });

        res.json({ success: true, claim: updated });

    } catch (err) {
        console.error("Submit error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/full-detail/:claimNumber", async (req, res) => {
    try {
        const { claimNumber } = req.params;

        const claim = await Claim.aggregate([
            { $match: { claimNumber } },

            {
                $lookup: {
                    from: "users",
                    localField: "customerID",
                    foreignField: "customerID",
                    as: "customer"
                }
            },
            { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } }
        ]);

        if (!claim[0]) {
            return res.status(404).json({ success: false, message: "Claim not found" });
        }

        const photos = await AccidentPhoto.find({ claimNumber });
        const repairItems = await RepairItem.find({ claimNumber });

        return res.json({
            success: true,
            claim: {
                ...claim[0],
                customerName: claim[0].customer
                    ? `${claim[0].customer.firstName} ${claim[0].customer.lastName}`
                    : null
            },
            photos,
            repairItems
        });

    } catch (err) {
        console.error("🔥 FULL DETAIL ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

/* =====================================================
✅ 14) SAVE DRAFT / SUBMIT (Frontend เรียกตัวนี้)
   ⭐️⭐️⭐️ (โค้ดใหม่ทั้งหมด) ⭐️⭐️⭐️
===================================================== */
router.post(
    "/save/:claimNumber",
    // ⭐️ 1. ใช้ upload (memoryStorage) รับไฟล์ Array ชื่อ "newPhotos"
    upload.array("newPhotos"),
    async (req, res) => {

        console.log(`\n[SAVE /${req.params.claimNumber}] - START`);

        try {
            const { claimNumber } = req.params;

            // ⭐️ 2. ดึงข้อมูล Text Fields และ Parse JSON
            const {
                damageDescription,
                inspectionDate,
                mode
            } = req.body;

            // (ข้อมูล Array ที่ส่งมาเป็น JSON string)
            const photosToUpdate = JSON.parse(req.body.photosToUpdate || "[]");
            const repairItems = JSON.parse(req.body.repairItems || "[]");

            // ⭐️ 3. ดึง Metadata ของไฟล์ใหม่ (ที่ส่งมาเป็น Array คู่ขนาน)
            const newPhotoCaptions = Array.isArray(req.body.newPhotoCaptions)
                ? req.body.newPhotoCaptions
                : [req.body.newPhotoCaptions];

            const newPhotoTypes = Array.isArray(req.body.newPhotoTypes)
                ? req.body.newPhotoTypes
                : [req.body.newPhotoTypes];

            // ⭐️ 4. ไฟล์ใหม่อยู่ใน req.files
            const newPhotoFiles = req.files || [];

            console.log("[SAVE] 1. Finding claim...");
            const claim = await Claim.findOne({ claimNumber });
            if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });

            claim.detail = damageDescription;
            claim.inspectionDate = inspectionDate;

            if (mode === "submit") {
                claim.state = "survey";
                claim.currentStep = (claim.currentStep || 1) + 1;
            }

            console.log("[SAVE] 2. Saving claim details...");
            await claim.save();
            console.log("[SAVE] 3. Claim details SAVED.");

            // ✅ 2A) สร้างรูปใหม่ (Upload to Cloudinary จาก Buffer)
            console.log(`[SAVE] 4. Processing ${newPhotoFiles.length} new photos...`);
            for (let i = 0; i < newPhotoFiles.length; i++) {
                const file = newPhotoFiles[i];
                const caption = newPhotoCaptions[i] || '';
                const type = newPhotoTypes[i] || 'damage';

                console.log(`[SAVE DEBUG] 4A. Uploading buffer to Cloudinary...`);

                // ⭐️ 5. อัปโหลด Buffer (จาก memoryStorage)
                const result = await uploadImage(
                    file.buffer,
                    `claims/${claimNumber}`
                );
                console.log(`[SAVE DEBUG] 4B. Cloudinary SUCCESS.`);

                await AccidentPhoto.create({
                    claimNumber,
                    type: type,
                    caption: caption,
                    photoURL: result.secure_url
                });
                console.log(`[SAVE DEBUG] 4C. DB Create Done.`);
                // (ไม่ต้องลบ temp file)
            }

            // ✅ 2B) อัปเดตรูปเก่า (อัปเดต Type/Caption)
            console.log(`[SAVE] 5. Processing ${photosToUpdate.length} existing photos...`);
            for (const p of photosToUpdate) {
                if (p._id && p._id.length > 12) {
                    await AccidentPhoto.findByIdAndUpdate(p._id, {
                        type: p.type,
                        caption: p.caption
                    });
                }
            }
            console.log("[SAVE] 6. Existing photos UPDATED.");

            // ✅ 3) SAVE REPAIR ITEMS
            console.log(`[SAVE] 7. Processing ${repairItems.length} repair items...`);
            for (const item of repairItems) {
                if (!item.type) {
                    continue;
                }

                const itemData = {
                    claimNumber,
                    type: item.type === "other" ? (item.customDescription || 'อื่นๆ') : item.type,
                    cost: Number(item.cost) || 0
                };

                if (item._id && item._id.length > 12) {
                    console.log(`[SAVE] 7A. Updating RepairItem ID: ${item._id}`);
                    await RepairItem.findByIdAndUpdate(item._id, itemData);
                } else {
                    console.log("[SAVE] 7B. Creating new RepairItem...");
                    await RepairItem.create(itemData);
                }
            }
            console.log("[SAVE] 8. RepairItems SAVED.");

            return res.json({ success: true });

        } catch (err) {
            console.error("🔥 SAVE ERROR (IN CATCH BLOCK):", err);
            return res.status(500).json({ success: false, error: err });
        }
    }
);

router.delete("/photo/:id", async (req, res) => {
    try {
        await AccidentPhoto.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete("/repair-item/:id", async (req, res) => {
    try {
        await RepairItem.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});


// ❌ ลบ router.post("/upload-temp", ...) ทิ้ง

module.exports = router;