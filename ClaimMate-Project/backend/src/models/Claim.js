const mongoose = require('mongoose');
const Counter = require('./Counter');

const claimSchema = new mongoose.Schema({
    claimNumber:    { type: String, unique: true, required: true },
    customerID:     { type: String, required: true },  // C00001
    employeeID:     { type: String, required: true },  // E00001
    carID:          { type: String, required: true },  // CAR-00001 (หรือทะเบียน)
    location:{ type: String, required: true },
    detail:         { type: String, required: true },
    state:          { type: String, enum: ['open_case','survey','approved','choose_garage','repair','completed'], default: 'open_case', required: true },
    status:   { type: String, enum: ['new','inspecting','pending_report'], default: 'new', required: true },
    priorityLevel:  { type: String, enum: ['urgent','high','normal'], required: true },
    isClosed:       { type: Boolean, default: false },
    incidentDate:   { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}\/\d{2}:\d{2}$/, 'Invalid date format (use yyyy-mm-dd/hh:mm)'] },
    estPrice:       { type: Number, required: true },
    approvedPrice:  { type: Number, required: true },
    additionalPrice:{ type: Number, required: true }
}, { collection: 'claims' });

// gen claimID ก่อน validate เพื่อผ่าน required
claimSchema.pre('validate', async function (next) {
    if (this.isNew && !this.claimID) {
        const year = new Date().getFullYear().toString();
        const counter = await Counter.findByIdAndUpdate(
            `CLAIM-${year}`,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const nextNumber = String(counter.seq).padStart(5, '0');   // 00001
        this.claimNumber = `CLM-${year}-${nextNumber}`;                // CLM-2025-00001
    }
    next();
});

// ช่วยค้นหาเร็วขึ้น
claimSchema.index({ currentState: 1, isClosed: 1 });
claimSchema.index({ employeeID: 1 });
claimSchema.index({ customerID: 1 });

module.exports = mongoose.model('Claim', claimSchema);