const mongoose = require('mongoose');

const accidentPhotoSchema = new mongoose.Schema({
    claimNumber: { type: String, required: true },
    type: { type: String, enum: ["damage", "document"], default: "damage" },
    caption: { type: String, default: null },
    photoURL: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('AccidentPhoto', accidentPhotoSchema);