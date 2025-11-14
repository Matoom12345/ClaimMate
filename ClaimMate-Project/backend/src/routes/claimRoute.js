const express = require('express');
const router = express.Router();

// 1. (แก้ไข) Import Models และ Utils ให้ครบถ้วน
const {
    Claim,
    ClaimStatus,
    Customer,
    Car,
    Policy,
    User,
    Insurance,
    AccidentPhoto,
    RepairItem,
    AdditionalSurvey,
    Satisfaction,
    Garage,
    ChooseGarageRequest,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

// 2. ⭐️ (แก้ไข) Import Middlewares และ Utils ให้ถูกต้อง
const upload = require('../middlewares/upload'); // ⭐️ (แก้ไข) ไม่มี {}
const { uploadImage, deleteFromCloudinary } = require('../utils/uploadToCloudinary'); // ⭐️ (แก้ไข) import ทั้ง 2 function

// 3. (คงไว้) Route เดิม (Active Claims)
/**
 * @route   GET /api/claims/active
 * @desc    (คงไว้) ดึงเคสที่กำลังดำเนินการ (Active Claims)
 */
router.get('/active', async (req, res) => {
    // 1. ดึง insuranceID จาก query params (ตามที่ ActiveClaims.jsx ส่งมา)
    const { insuranceID } = req.query;

    if (!insuranceID) {
        return res.status(400).json({ message: 'insuranceID is required' });
    }

    try {
        const activeClaims = await Claim.findAll({
            // 2. กรองด้วย insuranceId ที่ส่งมา
            where: {
                insuranceId: insuranceID
            },
            include: [
                {
                    // 3. Join ClaimStatus
                    model: ClaimStatus,
                    where: {
                        isClosed: false, // เคสต้องยังไม่ปิด
                        currentStep: { [Op.lte]: 1 } // 4. (เงื่อนไขใหม่) ต้องมี currentStep <= 2
                    },
                    required: true // ใช้ INNER JOIN (ต้องมี ClaimStatus ที่ตรงเงื่อนไขเท่านั้น)
                },
                {
                    // 5. Join Car เพื่อเอา (brand, model, year, licensePlate)
                    model: Car,
                    attributes: ['brand', 'model', 'year', 'licensePlate'],
                    include: [{
                        // 6. Join Policy (ซ้อนใน Car) เพื่อเอา (policyNumber, level)
                        model: Policy,
                        attributes: ['policyNumber', 'level']
                    }]
                },
                {
                    // 7. Join Customer
                    model: Customer,
                    attributes: ['id'],
                    include: [{
                        // 8. Join User (ซ้อนใน Customer) เพื่อเอา (firstName, lastName, phoneNumber)
                        model: User,
                        attributes: ['firstName', 'lastName', 'phoneNumber']
                    }]
                }
            ],
            order: [
                ['incidentDate', 'DESC'] // เรียงเคสใหม่ล่าสุดขึ้นก่อน
            ]
        });

        // 9. Map ข้อมูลที่ได้จาก Sequelize ให้อยู่ใน Format ที่ Frontend (ActiveClaims.jsx) ต้องการ
        const formattedClaims = activeClaims.map(claim => {

            // (ป้องกัน Error หาก Join แล้วไม่พบข้อมูล)
            const customerUser = claim.Customer ? claim.Customer.User : {};
            const car = claim.Car || {};
            const policy = car.Policy || {};
            const status = claim.ClaimStatus || {};

            // (จัดการ Missing Field 1: priorityLevel -> ถูกตัดออกตามคำสั่ง)
            // const priorityLevel = status.urgentRepair ? 'urgent' : 'normal';

            return {
                // === Fields ที่ Frontend ต้องการ ===
                id: claim.id,
                claimNumber: `CLM-${claim.id}`, // สร้าง claimNumber (ไม่มีใน DB แต่มีใน logic)
                status: status.status, // จาก ClaimStatus

                // (จาก User)
                customerName: `${customerUser.firstName || ''} ${customerUser.lastName || ''}`.trim(),
                customerPhone: customerUser.phoneNumber || '',

                // (จาก Car)
                licensePlate: car.licensePlate || '',
                carBrand: car.brand || '',
                carModel: car.model || '',
                carYear: car.year || '',

                // (จาก Policy)
                policyNumber: policy.policyNumber || '',
                insuranceClass: policy.level || '', // (level คือ '1', '2+'...)

                // (จาก Claim)
                location: claim.location,
                incidentDate: claim.incidentDate,

                // (Fields ที่ต้องจัดการ)
                // priorityLevel: priorityLevel, // (ถูกตัดออกตามคำสั่ง 1)
                reportProgress: 0 // (Missing Field 2: Hardcoded เป็น 0)
            };
        });

        res.status(200).json(formattedClaims);

    } catch (error) {
        console.error('Error fetching active claims:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// 4. (คงไว้) Route เดิม (Create Claim)
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
        priorityLevel,
        incidentDate,
    } = req.body;

    // 1. ตรวจสอบ Active Claim
    try {
        const existingActiveClaim = await Claim.findOne({
            where: { carId: carID },
            include: [{
                model: ClaimStatus,
                where: { isClosed: false },
                required: true
            }]
        });

        if (existingActiveClaim) {
            return res.status(400).json({
                message: 'ไม่สามารถสร้างเคสใหม่ได้: รถคันนี้มีเคสที่กำลังดำเนินการอยู่'
            });
        }
    } catch (error) {
        console.error('Error checking existing claims:', error);
        return res.status(500).json({ message: 'Server error while checking claims', error: error.message });
    }

    // 2. ใช้ Transaction
    const t = await sequelize.transaction();

    try {
        // 2.1. สร้าง Claim
        const newClaim = await Claim.create({
            customerId: customerID,
            insuranceId: insuranceID,
            carId: carID,
            location: location,
            detail: detail,
            incidentDate: incidentDate,
        }, { transaction: t });

        // 2.2. กำหนดค่าความเร่งด่วน (ตาม Logic เดิม)
        const isUrgent = priorityLevel === 'urgent' || priorityLevel === 'high';

        // 2.3. สร้าง ClaimStatus
        await ClaimStatus.create({
            claimId: newClaim.id,
            state: 'open_case',
            status: 'new',
            currentStep: 1,
            reportedDate: new Date(), // (คำสั่ง 3) assignedDate เริ่มต้น
            inspectionDate: null, // (คำสั่ง 4) inspectionDate เริ่มต้นเป็น null
            urgentRepair: isUrgent, // (คำสั่ง 1) แม้ priority จะหายไป แต่ urgentRepair ยังต้องเก็บ
            isClosed: false,
        }, { transaction: t });

        // 3. Commit
        await t.commit();

        // 4. ส่งข้อมูลกลับ
        res.status(201).json({
            message: 'Claim created successfully',
            claim: { ...newClaim.toJSON(), claimNumber: `CLM-${newClaim.id}` }
        });

    } catch (error) {
        // 5. Rollback
        await t.rollback();
        console.error('Error creating claim:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// 5. ⭐️ (Route ใหม่) ⭐️
/**
 * @route   GET /api/claims/detail-report/:id
 * @desc    (ใหม่) ดึงข้อมูลทั้งหมดสำหรับหน้า ClaimDetail (ยุบ /detail และ /full-detail)
 * @access  Private (Insurance)
 */

// (List นี้สำหรับ map 'itemName' กลับไปเป็น 'type' ตามคำสั่ง 5)
const REPAIR_ITEM_TYPES = [
    'bumper_front', 'bumper_rear', 'hood', 'headlight', 'taillight',
    'door_front_left', 'door_front_right', 'door_rear_left', 'door_rear_right',
    'fender_left', 'fender_right', 'windshield_front', 'windshield_rear',
    'window_left', 'window_right', 'mirror_left', 'mirror_right',
    'paint_front', 'paint_rear', 'paint_left', 'paint_right',
    'tire_replace', 'rim_replace', 'suspension', 'alignment'
];

router.get('/detail-report/:id', async (req, res) => {
    const { id } = req.params; // id คือ Claim ID

    try {
        const claim = await Claim.findOne({
            where: { id: id },
            include: [
                { model: ClaimStatus, required: true },
                { model: AccidentPhoto, separate: true }, // 1:M
                { model: RepairItem, separate: true }, // 1:M
                {
                    model: Car,
                    include: [{ model: Policy }]
                },
                {
                    model: Customer,
                    include: [{ model: User }]
                },
                {
                    // (คำสั่ง 2) Join Insurance เพื่อเอา User
                    model: Insurance,
                    include: [{ model: User }]
                }
            ]
        });

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        // --- Map ข้อมูล ---

        // (ป้องกัน Error หาก Join แล้วไม่พบข้อมูล)
        const status = claim.ClaimStatus || {};
        const customer = claim.Customer ? claim.Customer.User : {};
        const car = claim.Car || {};
        const policy = car.Policy || {};
        const officer = claim.Insurance ? claim.Insurance.User : {};

        // (คำสั่ง 2: assignedOfficer)
        const assignedOfficerName = `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || 'N/A';
        const assignedOfficerEmail = officer.email || '';

        // (คำสั่ง 5: repairItems)
        const formattedRepairItems = (claim.RepairItems || []).map(item => {
            // (Logic เดิมที่ถูกต้อง: ตรวจสอบว่า itemName คือ 'type' หรือ 'customDescription')
            const isKnownType = REPAIR_ITEM_TYPES.includes(item.itemName);
            return {
                id: item.id,
                _id: item.id,
                existing: true,
                type: isKnownType ? item.itemName : 'other', // (Frontend's type)
                customDescription: isKnownType ? '' : item.itemName,
                cost: item.cost ?? 0,
            };
        });

        // 1. (สำหรับ Header UI)
        const formattedHeader = {
            id: claim.id,
            claimNumber: `CLM-${claim.id}`,
            status: status.status,
            // (คำสั่ง 1: priority ถูกตัดออก)

            customerFirstName: customer.firstName || '',
            customerLastName: customer.lastName || '',
            customerPhone: customer.phoneNumber || '',
            customerEmail: customer.email || '',

            policyNumber: policy.policyNumber || '',
            carBrand: car.brand || '',
            carModel: car.model || '',
            carYear: car.year || '',
            licensePlate: car.licensePlate || '',
            engineID: car.engineID || '',
            carColor: car.color || '',

            insuranceBalance: policy.remainingBalance || 0,

            incidentDate: claim.incidentDate,
            location: claim.location,
            detail: claim.detail,

            // (คำสั่ง 2: assignedOfficer)
            assignedOfficer: {
                name: assignedOfficerName,
                email: assignedOfficerEmail
            },
            // (คำสั่ง 3: assignedDate)
            assignedDate: status.reportedDate,
            // (คำสั่ง 4: inspectionDate)
            inspectionDate: status.inspectionDate // (ส่งไปเผื่อ UI อยากใช้)
        };

        // 2. (สำหรับ Form UI)
        const formattedPhotos = (claim.AccidentPhotos || []).map(p => ({
            id: p.id,
            _id: p.id,
            existing: true,
            preview: p.photoUrl,
            photoURL: p.photoUrl,
            type: p.type || 'damage', // (นี่คือ type 'damage'/'document' จาก Model)
            caption: p.caption || '',
            file: null
        }));

        // (ข้อมูล Raw สำหรับตั้งค่า Form)
        const rawClaimData = {
            _id: claim.id,
            claimNumber: `CLM-${claim.id}`,
            state: status.status,
            detail: claim.detail,
            incidentDate: claim.incidentDate,
            location: claim.location,
            insuranceBalance: policy.remainingBalance || 0,

            // (คำสั่ง 3)
            reportedDate: status.reportedDate,
            // (คำสั่ง 4)
            inspectionDate: status.inspectionDate, // (ใช้ field นี้ตั้งต้นฟอร์ม)
        };

        // ส่ง Response กลับไปใน Format ที่ Frontend คาดหวัง
        res.status(200).json({
            claim: formattedHeader,     // (สำหรับ Header)

            // (สำหรับ Form)
            claimRaw: rawClaimData,
            photos: formattedPhotos,
            repairItems: formattedRepairItems
        });

    } catch (error) {
        console.error('Error fetching claim detail report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// 6. ⭐️ (Route แก้ไข - สำคัญ) ⭐️
/**
 * @route   POST /api/claims/save/:id
 * @desc    (แก้ไข) บันทึกแบบร่าง (Draft) หรือ ส่งออก (Submit)
 * @access  Private (Insurance)
 */
// ⭐️ (แก้ไข) เปลี่ยน middleware เป็น upload.none()
router.post('/save/:id', upload.none(), async (req, res) => {
    const { id } = req.params; // Claim ID
    const {
        damageDescription,
        inspectionDate, // "yyyy-mm-dd hh:mm"
        mode, // ⭐️ 'draft' | 'submit' (นี่คือ Key)
        photosToUpdate, // JSON String
        repairItems, // JSON String
        additionalCost // ⭐️ (ตัวแปรสำคัญ)
    } = req.body;

    // ⭐️ (แก้ไข) Array พักสำหรับแก้ปัญหา RepairItem ซ้ำ
    const newlyCreatedItems = [];

    const t = await sequelize.transaction();

    try {
        // 1. คำนวณ Total Cost
        const parsedItems = JSON.parse(repairItems || '[]');
        const totalCost = parsedItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

        // 2. อัปเดต Claim หลัก (บันทึกข้อมูล Text)
        // (ขั้นตอนนี้จะทำเสมอ ไม่ว่าจะเป็น Draft หรือ Submit)
        await Claim.update({
            detail: damageDescription,
            estimateCost: totalCost,
            additionalCost: Number(additionalCost) || 0,
        }, { where: { id: id }, transaction: t });

        // 3. อัปเดต RepairItems (Upsert - แก้ปัญหาสร้างซ้ำ)
        // (ขั้นตอนนี้จะทำเสมอ)
        for (const item of parsedItems) {
            const itemName = item.type === 'other'
                ? (item.customDescription || 'Other')
                : item.type;
            const cost = Number(item.cost) || 0;

            if (item.existing && item._id) {
                // Update
                await RepairItem.update({
                    itemName: itemName,
                    cost: cost
                }, { where: { id: item._id, claimId: id }, transaction: t });
            } else if (!item.existing) {
                // Create
                const newItem = await RepairItem.create({
                    claimId: id,
                    itemName: itemName,
                    cost: cost,
                    // approved: false (เป็น default อยู่แล้ว)
                }, { transaction: t });

                // ⭐️ เก็บ ID ชั่วคราว (frontendId) คู่กับข้อมูลใหม่ (dbItem)
                newlyCreatedItems.push({
                    frontendId: item.frontendId, // ID ชั่วคราวจาก Frontend
                    dbItem: newItem // ข้อมูลจริงจาก DB
                });
            }
        }

        // 4. อัปเดต Photos (Update captions/types)
        // (ขั้นตอนนี้จะทำเสมอ)
        const parsedPhotosToUpdate = JSON.parse(photosToUpdate || '[]');
        for (const photo of parsedPhotosToUpdate) {
            await AccidentPhoto.update({
                caption: photo.caption || '',
                type: photo.type || 'damage'
            }, { where: { id: photo._id, claimId: id }, transaction: t });
        }

        // ⭐️⭐️⭐️ 5. (Logic ใหม่) อัปเดต ClaimStatus ตาม 'mode' ⭐️⭐️⭐️

        const inspectionDateTime = inspectionDate ? new Date(inspectionDate) : new Date();

        if (mode === 'submit') {
            // ---------------------------------
            // Case 1: กด "บันทึกและส่งออก"
            // ---------------------------------
            const hasExtraCost = Number(additionalCost) > 0;

            if (hasExtraCost) {
                // ⭐️ 1.1 (เกินวงเงิน) -> ส่งให้ลูกค้าอนุมัติ
                // (ทำตามคำขอ: state: 'survey', currentStep: 2)
                await ClaimStatus.update({
                    inspectionDate: inspectionDateTime,
                    status: 'survey', // ⬅️ (ตามคำขอ)
                    currentStep: 2,     // ⬅️ (ตามคำขอ)
                }, { where: { claimId: id }, transaction: t });

                // ⭐️ สร้าง AdditionalApprove (ตามคำขอ)
                await AdditionalSurvey.create({
                    claimId: id,
                    // ⭐️ ⭐️ ⭐️ (นี่คือจุดที่แก้ไข) ⭐️ ⭐️ ⭐️
                    requestedAmount: Number(additionalCost), // ⬅️ (แก้ไข)
                    status: 'pending' // ⬅️ สถานะ "รอ"
                }, { transaction: t });

                // (RepairItem.approved = false อยู่แล้วโดย default)

            } else {
                // ⭐️ 1.2 (ไม่เกินวงเงิน) -> อนุมัติเลย
                await ClaimStatus.update({
                    inspectionDate: inspectionDateTime,
                    status: 'approved', // ⬅️ (ตามคำขอ) อนุมัติ
                    currentStep: 3,     // ⬅️ (ตามคำขอ) ไป Step 3
                }, { where: { claimId: id }, transaction: t });

                // ⭐️ อัปเดต RepairItem.approved = true ทั้งหมด
                await RepairItem.update(
                    { approved: true },
                    { where: { claimId: id }, transaction: t }
                );
            }
        } else {
            // ---------------------------------
            // Case 2: กด "บันทึกแบบร่าง" (mode === 'draft')
            // ---------------------------------
            // ⭐️ (ตามคำขอ) บันทึก inspectionDate แต่ *ไม่* เปลี่ยน state หรือ currentStep
            await ClaimStatus.update({
                inspectionDate: inspectionDateTime,
                // (ไม่แตะต้อง status และ currentStep)
            }, { where: { claimId: id }, transaction: t });
        }


        // 6. ⭐️ (แก้ไข) ลบ Logic การอัปโหลด Photos ใหม่ออกจากส่วนนี้


        // 7. Commit
        await t.commit();

        // ⭐️ (แก้ไข) ส่งข้อมูล ID ใหม่กลับไปให้ Frontend
        res.status(200).json({
            message: 'Report saved successfully',
            newlyCreatedItems: newlyCreatedItems // ส่ง Array นี้กลับไป
        });

    } catch (error) {
        await t.rollback();
        console.error('Error saving report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// 7. ⭐️ (Route แก้ไข - เปิดใช้งาน) ⭐️
/**
 * @route   DELETE /api/claims/photos/:id
 * @desc    (แก้ไข) ลบรูปภาพ (จาก DB และ Cloudinary)
 * @access  Private (Insurance)
 */
router.delete('/photos/:id', async (req, res) => {
    const { id } = req.params; // Photo ID

    try {
        const photo = await AccidentPhoto.findByPk(id);

        if (photo) {
            // ⭐️ (แก้ไข) เปิดใช้งานการลบไฟล์ออกจาก Cloudinary
            await deleteFromCloudinary(photo.photoUrl);

            // ลบออกจาก DB
            await photo.destroy();
        }

        res.status(200).json({ message: 'Photo deleted' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// 8. (คงไว้) Route เดิม (Delete Repair Item)
/**
 * @route   DELETE /api/claims/repair-item/:id
 * @desc    (ใหม่) ลบรายการซ่อม
 * @access  Private (Insurance)
 */
router.delete('/repair-item/:id', async (req, res) => {
    const { id } = req.params; // RepairItem ID

    try {
        await RepairItem.destroy({
            where: { id: id }
        });
        res.status(200).json({ message: 'Repair item deleted' });
    } catch (error) {
        console.error('Error deleting repair item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// 9. ⭐️ (Route แก้ไข - สำคัญ) ⭐️
/**
 * @route   POST /api/claims/photos/upload/:id
 * @desc    (แก้ไข) อัปโหลดรูปภาพทันที (จาก Pop-up)
 * @access  Private (Insurance)
 */
router.post('/photos/upload/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params; // Claim ID
    const { caption, type } = req.body; // ⭐️ รับ type และ caption (itemName)

    if (!req.file) {
        return res.status(400).json({ message: 'No photo file provided' });
    }

    try {
        // 1. ⭐️ (แก้ไข) สร้าง folder path ตามที่ผู้ใช้ต้องการ
        const folderPath = `claims/CLM-${id}`;

        // 2. ⭐️ (แก้ไข) อัปโหลดไป Cloudinary โดยระบุ folder
        // (เราใช้ uploadImage จาก utils/uploadToCloudinary.js)
        const result = await uploadImage(req.file.buffer, folderPath);

        // 3. ⭐️ (แก้ไข) สร้าง Record ใน DB พร้อม type และ caption
        const newPhoto = await AccidentPhoto.create({
            claimId: id,
            photoUrl: result.secure_url,
            caption: caption || '', // (บันทึก caption ที่ส่งมา)
            type: type || 'damage'  // (บันทึก type ที่ส่งมา)
        });

        // 4. ⭐️ (แก้ไข) ส่งข้อมูลรูปภาพใหม่กลับไปใน Format ที่ UI (ClaimDetail.jsx) คาดหวัง
        // (เพื่อให้ UI update ทันทีโดยไม่ต้อง reload)
        const formattedPhoto = {
            id: newPhoto.id,
            _id: newPhoto.id,
            existing: true,
            preview: newPhoto.photoUrl,
            photoURL: newPhoto.photoUrl,
            type: newPhoto.type,
            caption: newPhoto.caption,
            file: null,
            loading: false // (เสร็จแล้ว)
        };

        res.status(201).json(formattedPhoto); // ⭐️ ส่ง Object นี้กลับไป

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 10. ⭐️ (Route ใหม่ - สำหรับ ClaimHistory) ⭐️
/**
 * @route   GET /api/claims/history
 * @desc    (NEW) ดึงเคสที่ปิดแล้ว (Claim History)
 * @access  Private (Insurance)
 */
router.get('/history', async (req, res) => {
    try {
        const closedClaims = await Claim.findAll({
            // ⭐️ (1. เลือก Fields ที่ต้องการจาก Claim)
            attributes: [
                'id',
                'incidentDate', // ⬅️ (UI ต้องการ)
                'estimateCost', // ⬅️ (เผื่อ approvedCost เป็น null)
                'approvedCost'  // ⬅️ (UI ต้องการ)
            ],
            include: [
                {
                    model: ClaimStatus,
                    where: { isClosed: true },
                    required: true
                },
                {
                    model: Customer,
                    include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                },
                {
                    // ⭐️ (2. แก้ไข Car)
                    model: Car,
                    attributes: [
                        'licensePlate', // (UI ต้องการ)
                        'model'         // ⬅️ (UI ต้องการ)
                    ]
                },
                {
                    model: Satisfaction,
                    required: false
                },
                {
                    // ⭐️ (3. เพิ่ม Insurance -> User)
                    model: Insurance,
                    attributes: ['id'],
                    include: [{
                        model: User,
                        attributes: ['firstName', 'lastName'] // ⬅️ (UI ต้องการ)
                    }]
                }
            ],
            order: [[ClaimStatus, 'completedDate', 'DESC']]
        });

        // ⭐️ (4. Map ข้อมูลให้ตรงกับ Mockup ของ Frontend)
        const formattedHistory = closedClaims.map(claim => {
            const customerUser = claim.Customer?.User || {};
            const car = claim.Car || {};
            const status = claim.ClaimStatus || {};
            const satisfaction = claim.Satisfaction || {};
            const officerUser = claim.Insurance?.User || {}; // ⬅️ ดึง Officer

            // ⬅️ (UI ต้องการชื่อ Officer)
            const assignedOfficerName = `${officerUser.firstName || ''} ${officerUser.lastName || ''}`.trim() || 'N/A';

            return {
                id: claim.id,
                claimNumber: `CLM-${claim.id}`,
                customerName: `${customerUser.firstName || ''} ${customerUser.lastName || ''}`.trim(),
                licensePlate: car.licensePlate || '',

                // --- Fields ที่แก้ไข/เพิ่ม ---
                carModel: car.model || '', // ⬅️ (เพิ่ม)
                incidentDate: claim.incidentDate, // ⬅️ (เพิ่ม)
                completedDate: status.completedDate || status.updatedAt,

                // ⬅️ (แก้ไข) ใช้ approvedCost ถ้ามี, ถ้าไม่มีใช้ estimateCost
                approvedAmount: claim.approvedCost || claim.estimateCost || 0,

                // ⬅️ (แก้ไข) เปลี่ยนชื่อ field เป็น satisfaction
                satisfaction: satisfaction.rating || 0, // (ใช้ 0 ถ้าเป็น null)

                assignedOfficer: assignedOfficerName, // ⬅️ (เพิ่ม)

                // (Field `estimatedCost` จาก mockup ไม่มีในตาราง แต่เราใช้ approvedAmount แทน)
                estimatedCost: claim.estimateCost || 0
            };
        });

        res.status(200).json(formattedHistory);

    } catch (error) {
        console.error('Error fetching claim history:', error);
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
            include: [
                {
                    model: ClaimStatus,
                    required: false // ใช้ Left Join เผื่อเคสที่เพิ่งสร้างและอาจยังไม่มี status (กันเหนียว)
                },
                {
                    model: Car,
                    attributes: ['brand', 'model', 'year', 'licensePlate'],
                    include: [{
                        model: Policy,
                        attributes: ['level']
                    }]
                },

                { model: ChooseGarageRequest },

            ],
            order: [['createdAt', 'DESC']] // เรียงจากใหม่ไปเก่า
        });

        // Helper function สำหรับดึง state อย่างปลอดภัย
        const getState = (c) => c.ClaimStatus ? c.ClaimStatus.state : 'unknown';

        // ✅ แก้ไข Logic การนับตาม ENUM จริงใน ClaimStatus.js
        const summary = {
            total: claims.length,

            // Pending (รอดำเนินการ): คือสถานะ 'open_case' (เพิ่งเปิดเคส)
            pending: claims.filter(c =>
                ['open_case'].includes(getState(c))
            ).length,

            // In Progress (กำลังดำเนินการ): รวม process กลางทางทั้งหมด
            inProgress: claims.filter(c =>
                ['survey', 'approved', 'choose_garage', 'repair'].includes(getState(c))
            ).length,

            // Completed (เสร็จสิ้น): สถานะ 'completed'
            completed: claims.filter(c =>
                ['completed'].includes(getState(c))
            ).length
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
            include: [{
                model: ClaimStatus,
                required: false // Left Join เผื่อเคสที่ยังไม่มีสถานะ
            }],
        });

        const total = claims.length;

        // 🔴 แก้ไข Logic การนับ: เช็คจาก state ที่มีอยู่จริงใน ENUM
        // รายการที่ถือว่า "กำลังดำเนินการ" (Ongoing)
        const ongoingStates = ['open_case', 'survey', 'approved', 'choose_garage', 'repair'];

        // รายการที่ถือว่า "เสร็จสิ้น" (Completed)
        const completedStates = ['completed'];

        const ongoing = claims.filter(c => {
            const s = c.ClaimStatus; // สมมติว่าเป็น 1:1 ถ้าเป็น 1:M ต้องใช้ c.ClaimStatuses[0]
            return s && ongoingStates.includes(s.state);
        }).length;

        const completed = claims.filter(c => {
            const s = c.ClaimStatus;
            return s && completedStates.includes(s.state);
        }).length;

        res.status(200).json({
            stats: { total, ongoing, completed },
        });
    } catch (error) {
        // ... error handling
    }
});

// ==========================================
// 🟢 ส่วนที่เพิ่มใหม่สำหรับหน้า Customer ClaimDetail
// ==========================================

/**
 * @route   GET /api/claims/detail/:id
 * @desc    ดึงข้อมูลพื้นฐานของเคลม (Header, Vehicle, Garage, Officer)
 * @access  Private (Customer)
 */
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const claim = await Claim.findOne({
            where: { id },
            include: [
                { model: ClaimStatus, required: false },
                {
                    model: Car,
                    required: false,
                    // ✅ แก้ไข: ย้าย Policy เข้ามาซ้อนใน Car
                    include: [{ model: Policy, required: false }]
                },
                { model: Garage, required: false },
                {
                    model: Insurance,
                    include: [{ model: User, attributes: ['firstName', 'lastName', 'phoneNumber', 'email'] }],
                    required: false
                }
                // ❌ ลบ { model: Policy, required: false } ที่เคยอยู่ตรงนี้ออก
            ]
        });

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        const status = claim.ClaimStatus || {};
        const car = claim.Car || {};
        const policy = car.Policy || {}; // ✅ ดึง Policy จาก Car แทน
        const garage = claim.Garage?.User || {};
        const insuranceUser = claim.Insurance?.User || {};

        // Flatten Data ตามที่ Frontend 'c' คาดหวัง
        const formattedClaim = {
            id: claim.id,
            claimNumber: `CLM-${claim.id}`,
            incidentDate: claim.incidentDate,
            location: claim.location,
            detail: claim.detail,
            state: status.state,
            priority: status.urgentRepair ? 'urgent' : 'normal',

            // Timeline Dates
            reportedDate: status.reportedDate,
            inspectionDate: status.inspectionDate,
            approvalDate: status.approvalDate,
            garageSelectedDate: status.garageSelectedDate,
            repairStartDate: status.repairDate,
            completedDate: status.completedDate,
            currentStep: status.currentStep,

            // Costs
            estimatedCost: claim.estimateCost || 0,
            approvedCost: claim.approvedCost || 0,
            additionalCost: claim.additionalCost || 0,

            // Vehicle
            carBrand: car.brand,
            carModel: car.model,
            carYear: car.year,
            carColor: car.color,
            licensePlate: car.licensePlate,
            engineID: car.engineID,

            // Policy (เผื่อใช้งาน)
            policyNumber: policy.policyNumber,
            coverageAmount: policy.coverageAmount,

            // Garage
            garageName: garage.firstName,
            garagePhone: garage.phoneNumber,
            garageEmail: garage.email,
            garageAddress: garage.address,
            googleMapsUrl: garage.googleMapsUrl,
            photoURL: garage.photoURL,

            // Officer
            insuranceFirstName: insuranceUser.firstName,
            insuranceLastName: insuranceUser.lastName,
            insurancePhone: insuranceUser.phoneNumber,
            insuranceEmail: insuranceUser.email,
        };

        res.json({ claim: formattedClaim });
    } catch (error) {
        console.error('Error fetching claim detail:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/claims/full-detail/:id
 * @desc    ดึงรูปภาพและรายการซ่อม (Repair Items & Photos)
 * @access  Private (Customer)
 */
router.get('/full-detail/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const claim = await Claim.findOne({
            where: { id },
            include: [
                { model: AccidentPhoto, separate: true },
                { model: RepairItem, separate: true },
                {
                    model: Car,
                    include: [{ model: Policy }]
                },
                {
                    model: ChooseGarageRequest,
                    where: { garageStatus: 'pending' },
                    required: false
                }
            ]
        });

        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        // ดึงวงเงินประกัน
        const policy = claim.Car?.Policy || {};
        const insuranceBalance = policy.coverageAmount; // ค่าสมมติถ้าไม่มีข้อมูล

        res.json({
            photos: claim.AccidentPhotos || [],
            repairItems: claim.RepairItems || [],
            claim: {
                insuranceBalance: insuranceBalance,
            }
        });
    } catch (error) {
        console.error('Error fetching full detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/claims/:id/accept-extra-cost
 * @desc    ลูกค้ายืนยันยอมรับค่าใช้จ่ายส่วนเกิน
 * @access  Private (Customer)
 */
router.post('/:id/accept-extra-cost', async (req, res) => {
    const { id } = req.params;
    const { extraCost } = req.body;

    try {
        const t = await sequelize.transaction();

        try {
            // 1. อัปเดต Additional Cost ในตาราง Claim
            await Claim.update({
                additionalCost: extraCost
            }, { where: { id }, transaction: t });

            // 2. เปลี่ยนสถานะเป็น Approved (เพื่อให้ดำเนินการต่อได้)
            await ClaimStatus.update({
                status: 'approved', // หรือ status อื่นตาม Flow งาน
                state: 'approved',
                currentStep: 3, // ขยับ Step ไปข้างหน้า
                approvalDate: new Date()
            }, { where: { claimId: id }, transaction: t });

            // 3. (Optional) ปิด Job AdditionalSurvey ถ้ามี
            await AdditionalSurvey.update({
                status: 'approved'
            }, { where: { claimId: id, status: 'pending' }, transaction: t });

            await t.commit();
            res.json({ success: true, message: 'Accepted extra cost successfully' });

        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error accepting extra cost:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;