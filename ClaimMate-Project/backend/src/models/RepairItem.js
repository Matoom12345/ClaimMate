const mongoose = require("mongoose");
const Counter = require("./Counter");

const repairItemSchema = new mongoose.Schema({
    repairNumber: { type:String, unique:true },
    claimNumber:  { type:String, required:true },
    type:         { type:String, required:true },
    cost:         { type:Number, required:true },
    remark:       { type:String, default:null }
}, { timestamps:true });

repairItemSchema.index({ claimNumber:1, createdAt:-1 });

repairItemSchema.pre("validate", async function(next){
    if (this.isNew && !this.repairNumber) {
        const year = new Date().getFullYear().toString();
        const counter = await Counter.findByIdAndUpdate(
            `REPAIR-${year}`, { $inc:{ seq:1 } }, { new:true, upsert:true }
        );
        this.repairNumber = `RPR-${year}-${String(counter.seq).padStart(5,"0")}`;
    }
    next();
});

module.exports = mongoose.model("RepairItem", repairItemSchema);