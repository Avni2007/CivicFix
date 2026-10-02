const mongoose = require('mongoose');

const departmentSubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  headOfficerName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' }
}, { _id: false });

const municipalitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  state: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['Municipal Corporation', 'Municipal Council', 'Nagar Panchayat', 'Cantonment Board', 'Union Territory Local Body'],
    default: 'Municipal Corporation' 
  },
  lgdCode: { type: String, default: '' }, // Ministry of Panchayati Raj / MoHUA Local Government Directory Code
  portalUrl: { type: String, default: '' },
  officialEmailDomain: { type: String, default: '' },
  helpline: { type: String, default: '112' },
  controlRoomEmail: { type: String, default: '' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  departments: [departmentSubSchema],
  populationEstimate: { type: Number, default: 0 },
  zoneCount: { type: Number, default: 4 },
  wardCount: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

municipalitySchema.index({ state: 1, city: 1 });
municipalitySchema.index({ lgdCode: 1 });

module.exports = mongoose.model('Municipality', municipalitySchema);
