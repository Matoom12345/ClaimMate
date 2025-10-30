const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function uploadImage(buffer, folder) {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

module.exports = uploadImage;