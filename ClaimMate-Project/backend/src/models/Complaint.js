const mongoose = require('mongoose');
const Counter = require("./Counter");

const complaintSchema = new mongoose.Schema({
    complaintID:        { type: String, required: true, unique: true }, // id
    claimNumber:            { type: String, required: true },
    type:      { type: String, required: true },
    head:      { type: String, required: true },
    detail:    { type: String, required: true },
    fileURL: { type: String, required: true },

}, {timestamps: true});

complaintSchema.index({ claimNumber:1, createdAt:-1 });

complaintSchema.pre("validate", async function(next){
    if (this.isNew && !this.complaintID) {
        const year = new Date().getFullYear().toString();
        const counter = await Counter.findByIdAndUpdate(
            `COMPLAINT-${year}`, { $inc:{ seq:1 } }, { new:true, upsert:true }
        );
        this.complaintID = `COMP-${year}-${String(counter.seq).padStart(10,"0")}`;
    }
    next();
});

// ส่งออก
module.exports = mongoose.model('Complaint', complaintSchema);