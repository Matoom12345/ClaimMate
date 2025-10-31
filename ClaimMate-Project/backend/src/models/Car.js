const mongoose = require('mongoose');
const Counter = require('./Counter');

const carSchema = new mongoose.Schema({
    carID:           { type: String, unique: true, required: true }, // gen อัตโนมัติ
    customerID:      { type: String, required: true, index: true },  // ไม่ unique
    brand:           { type: String, required: true, trim: true },
    model:           { type: String, required: true, trim: true },
    year:            { type: String, required: true },               // จะใช้ Number ก็ได้
    licensePlate:    { type: String, required: true, unique: true }, // แนะนำให้ unique
    color:           { type: String, required: true, trim: true },
    engineID:        { type: String, required: true, unique: true },

    policyNumber:    { type: String, required: true, unique: true },
    insuranceLevel:  { type:String, enum:['1','2','3','2+','3+'], required:true },
    insuranceBalance:{ type: Number, required: true },
    insuranceCreateAt:{ type:String, required:true,  match:[/^\d{4}-\d{2}-\d{2}$/,'Invalid date format'] },
    insuranceExpireAt:{ type:String, required:true,  match:[/^\d{4}-\d{2}-\d{2}$/,'Invalid date format'] },
}, { versionKey: false, collection: 'cars' });

// สร้าง carID ก่อน validate (จะไม่ล้มเพราะ required)
carSchema.pre('validate', async function (next) {
    if (this.isNew && !this.carID) {
        const counter = await Counter.findByIdAndUpdate(
            'CAR',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.carID = `CAR-${String(counter.seq).padStart(5, '0')}`; // รูปแบบอ่านง่ายขึ้น
    }
    next();
});

// Normalize ทะเบียนรถก่อนเซฟ (เช่น ตัดช่องว่าง/เป็นตัวพิมพ์ใหญ่)
carSchema.pre('save', function (next) {
    if (this.isModified('licensePlate') && typeof this.licensePlate === 'string') {
        this.licensePlate = this.licensePlate.replace(/\s+/g, '').toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Car', carSchema);