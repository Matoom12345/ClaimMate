const multer = require("multer");

// ✅ เก็บไฟล์ในหน่วยความจำ (ไม่เขียนลง disk)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10MB
});

module.exports = upload;