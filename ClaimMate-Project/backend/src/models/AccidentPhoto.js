const mongoose = require('mongoose');
const {version} = require("mongoose");

const accidentPhotoSchema = new mongoose.Schema({
    claimID: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    detail: { type: String, required: true },
    photoURL: { type: String, required: true },
});

module.exports = mongoose.model('AccidentPhoto', accidentPhotoSchema);