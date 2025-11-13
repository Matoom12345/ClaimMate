const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * ⭐️ (แก้ไข) Export Function 1: uploadImage
 * (โค้ดเดิมของคุณ)
 */
function uploadImage(buffer, folder, publicId = null) {
    return new Promise((resolve, reject) => {
        const options = {
            folder: folder,
            resource_type: "auto",
        };

        if (publicId) {
            options.public_id = publicId;
            options.overwrite = true;
        }

        let stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

/**
 * ⭐️ (เพิ่ม) Export Function 2: deleteFromCloudinary
 * (ฟังก์ชันนี้จำเป็นสำหรับ claimRoute.js แต่หายไปจากไฟล์ของคุณ)
 */
const deleteFromCloudinary = (url) => {
    return new Promise((resolve, reject) => {
        // 1. ดึง public_id จาก URL
        // (เช่น "claims/CLM-1/abcde12345")
        const regex = /upload\/(?:v\d+\/)?([^\.]+)/;
        const match = url.match(regex);

        if (!match || !match[1]) {
            // ถ้าหา public_id ไม่เจอ (เช่น URL ผิด) ให้ resolve ไปเลย (ถือว่าลบแล้ว)
            console.warn('Could not parse public_id from URL for deletion:', url);
            return resolve(true);
        }

        const publicId = match[1];

        // 2. สั่ง Cloudinary ลบ
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error);
                return reject(error);
            }
            resolve(result);
        });
    });
};

/**
 * ⭐️ (แก้ไข) Export เป็นอ็อบเจ็กต์
 * เพื่อให้ claimRoute.js สามารถ import แบบ destructuring ได้
 */
module.exports = {
    uploadImage,
    deleteFromCloudinary,
};