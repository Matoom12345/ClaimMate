const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ✅ แก้ไข function ให้รับ publicId และตั้งค่า resource_type
function uploadImage(buffer, folder, publicId = null) {
    return new Promise((resolve, reject) => {

        const options = {
            folder: folder,
            resource_type: 'auto' // ✅
        };

        if (publicId) {
            options.public_id = publicId;
            options.overwrite = true; // ✅ อนุญาตให้เขียนทับถ้าชื่อซ้ำ
        }

        let stream = cloudinary.uploader.upload_stream(
            options, // ✅ ใช้ options ที่เรากำหนด
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

module.exports = uploadImage;