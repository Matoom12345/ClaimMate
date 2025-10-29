const mongoose = require('mongoose');
const Counter = require('./Counter');

const claimHistorySchema = new mongoose.Schema({
    historyID: { type: String, unique: true, required: true }, // auto-gen
    claimNumber: { type: String, required: true, index: true }, // ไม่ unique เพราะ 1 claim มีได้หลาย history
    state: {
        type: String,
        enum: ['open_case','survey','approved','choose_garage','repair','completed'],
        required: true
    },
    reportedDate: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}\/\d{2}:\d{2}$/, 'Invalid date format (use yyyy-mm-dd/hh:mm)']
    }
}, { collection: 'claim_histories' });

// generate historyID ก่อน validate
claimHistorySchema.pre('validate', async function (next) {
    if (this.isNew && !this.historyID) {
        const counter = await Counter.findByIdAndUpdate(
            'CLAIM_HISTORY',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.historyID = `CHIS-${String(counter.seq).padStart(7, '0')}`; // ✅ ถูกต้อง
    }
    next();
});

module.exports = mongoose.model('ClaimHistory', claimHistorySchema);