// models/Claim.js
const mongoose = require('mongoose');
const Counter = require('./Counter');

const claimSchema = new mongoose.Schema({
    claimNumber: { type:String, unique:true, required:true },
    customerID:  { type:String, required:true },   // C00001
    insuranceID: { type:String, required:true },   // E00001
    garageID:    { type:String, default:null },
    carID:       { type:String, required:true },   // CAR-00001
    title:       { type:String, required:true },
    location:    { type:String, required:true },
    detail:      { type:String, required:true },
    currentStep: { type:Number, default:1 },
    state:       { type:String, enum:['open_case','survey','approved','choose_garage','repair','completed'], default:'open_case', required:true },
    status:      { type:String, enum:['new','inspecting','pending_report'], default:'new', required:true },
    priorityLevel:{ type:String, enum:['urgent','high','normal'], required:true },
    isClosed:    { type:Boolean, default:false },

    incidentDate:      { type:String, required:true,  match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    reportedDate:      { type:String, required:true,  match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    inspectionDate:    { type:String, default:null,   match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    approvalDate:      { type:String, default:null,   match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    garageSelectedDate:{ type:String, default:null,   match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    repairStartDate:   { type:String, default:null,   match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },
    completedDate:     { type:String, default:null,   match:[/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/,'Invalid date format'] },

    estimatedCost: { type:Number, default:null },
    approvedCost:  { type:Number, default:null },
    additionalCost:{ type:Number, default:null }
}, { collection:'claims', timestamps:true });

claimSchema.index({ state:1, isClosed:1 });
claimSchema.index({ insuranceID:1 });
claimSchema.index({ customerID:1 });

// generate CLM-YYYY-00001
claimSchema.pre('validate', async function(next){
    if (this.isNew && !this.claimNumber) {
        const year = new Date().getFullYear().toString();
        const counter = await Counter.findByIdAndUpdate(
            `CLAIM-${year}`, { $inc:{ seq:1 } }, { new:true, upsert:true }
        );
        this.claimNumber = `CLM-${year}-${String(counter.seq).padStart(5,'0')}`;
    }
    next();
});

module.exports = mongoose.model('Claim', claimSchema);