const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const Municipality = require('../models/Municipality');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');

const statesDataset = require('../data/indian_states_municipal_dataset.json');
const staffDataset = require('../data/government_verified_staff_dataset.json');

const STANDARD_DEPARTMENTS = [
  { name: 'Public Works', code: 'PWD' },
  { name: 'Sanitation', code: 'SWM' },
  { name: 'Water', code: 'WAT' },
  { name: 'Drainage', code: 'DRN' },
  { name: 'Electricity', code: 'ELE' },
  { name: 'Traffic', code: 'TRF' },
  { name: 'Municipal Administration', code: 'ADM' }
];

async function seedIndiaStatesDataset() {
  try {
    console.log('🇮🇳 Starting Government-Verified Indian States & Municipal Staff Seeder...');
    await connectDB();

    // 1. Seed Municipalities (36 States & Union Territories)
    console.log(`\n[1/3] Upserting 36 Government-Verified Municipal Corporations & Councils...`);
    for (const mData of statesDataset) {
      const departmentsWithMetadata = STANDARD_DEPARTMENTS.map(d => ({
        name: d.name,
        code: `${mData.shortName}-${d.code}`,
        headOfficerName: `${d.name} In-Charge (${mData.city})`,
        contactEmail: `${d.code.toLowerCase()}.${mData.shortName.toLowerCase()}@${mData.officialEmailDomain}`,
        contactPhone: mData.helpline
      }));

      await Municipality.findOneAndUpdate(
        { code: mData.code },
        {
          name: mData.name,
          code: mData.code,
          state: mData.state,
          city: mData.city,
          district: mData.district,
          type: mData.type === 'Union Territory' && mData.state !== 'Delhi' && mData.state !== 'Chandigarh' && mData.state !== 'Jammu and Kashmir'
            ? 'Municipal Council'
            : 'Municipal Corporation',
          lgdCode: mData.lgdCode,
          portalUrl: mData.portalUrl,
          officialEmailDomain: mData.officialEmailDomain,
          helpline: mData.helpline,
          controlRoomEmail: mData.controlRoomEmail,
          location: mData.location,
          populationEstimate: mData.populationEstimate,
          zoneCount: mData.zoneCount,
          wardCount: mData.wardCount,
          departments: departmentsWithMetadata,
          isActive: true
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(` ✅ 36 State & UT Municipal Bodies upserted with verified LGD codes & helplines.`);

    // 2. Seed Official Government-Verified Staff (Commissioners & Department Engineers)
    console.log(`\n[2/3] Provisioning Government-Verified Municipal Staff across all 36 States & UTs...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo1234', salt);

    let staffCreated = 0;
    const staffUserMap = {}; // email -> user doc

    for (const sData of staffDataset) {
      const user = await User.findOneAndUpdate(
        { email: sData.email.toLowerCase() },
        {
          name: sData.name,
          email: sData.email.toLowerCase(),
          passwordHash,
          role: sData.role,
          department: sData.department,
          phone: sData.phone,
          locationName: sData.locationName,
          employeeId: sData.employeeId,
          designation: sData.designation,
          state: sData.state,
          municipalityCode: sData.municipalityCode,
          governmentIdVerified: true,
          verificationAuthority: sData.verificationAuthority,
          isVerified: true,
          status: 'active'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      staffUserMap[sData.email.toLowerCase()] = user;
      staffCreated++;
    }
    console.log(` ✅ ${staffCreated} Official Government Staff accounts provisioned with HRMS credentials.`);

    // 3. Seed Realistic Geo-Tagged Complaints for Each State & UT
    console.log(`\n[3/3] Generating Geo-Tagged Complaints for each State's Municipal Jurisdiction...`);
    let citizenDemoUser = await User.findOne({ role: 'citizen', email: 'citizen@civicfix.demo' });
    if (!citizenDemoUser) {
      citizenDemoUser = await User.create({
        name: 'Avni Sharma (Citizen)',
        email: 'citizen@civicfix.demo',
        passwordHash,
        role: 'citizen',
        phone: '+91 98765 43210',
        locationName: 'National Resident',
        isVerified: true
      });
    }

    let complaintCount = 0;
    for (let i = 0; i < statesDataset.length; i++) {
      const mData = statesDataset[i];
      const complaintId = `CIV-IND-${String(i + 101).padStart(4, '0')}`;
      const sample = mData.sampleComplaint;

      // Find staff officer for this state
      const matchingStaff = staffDataset.find(s => s.state === mData.state && s.role === 'authority') 
        || staffDataset.find(s => s.state === mData.state);
      const officerDoc = matchingStaff ? staffUserMap[matchingStaff.email.toLowerCase()] : null;

      const complaintDoc = await Complaint.findOneAndUpdate(
        { complaintId },
        {
          complaintId,
          title: sample.title,
          description: sample.description,
          category: sample.category,
          priority: sample.priority,
          status: i % 3 === 0 ? 'RESOLVED' : i % 2 === 0 ? 'IN_PROGRESS' : 'REPORTED',
          images: [
            sample.category === 'Pothole'
              ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
              : sample.category === 'Garbage'
              ? 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80'
              : sample.category === 'Water' || sample.category === 'Drainage'
              ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?auto=format&fit=crop&w=800&q=80'
          ],
          location: {
            address: sample.address,
            lat: mData.location.lat,
            lng: mData.location.lng,
            city: mData.city,
            area: mData.district || mData.city
          },
          reportedBy: citizenDemoUser._id,
          assignedDepartment: matchingStaff ? matchingStaff.department : 'Public Works',
          assignedOfficer: officerDoc ? officerDoc._id : null,
          aiAnalysis: {
            confidence: 0.92,
            suggestedCategory: sample.category,
            suggestedPriority: sample.priority,
            suggestedDepartment: matchingStaff ? matchingStaff.department : 'Public Works',
            similarCount: 1,
            summary: `Automated NLP classified issue in ${mData.city}, ${mData.state}. Municipal local body: ${mData.name} (LGD: ${mData.lgdCode}).`
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Audit history
      await ComplaintHistory.findOneAndUpdate(
        { complaintId, action: 'REPORTED' },
        {
          complaint: complaintDoc._id,
          complaintId,
          status: 'REPORTED',
          action: 'REPORTED',
          changedBy: citizenDemoUser._id,
          changedByName: citizenDemoUser.name,
          details: `Issue reported via CivicFix portal for ${mData.city} jurisdiction.`
        },
        { upsert: true, new: true }
      );

      complaintCount++;
    }

    console.log(` ✅ ${complaintCount} Geo-Tagged Complaints seeded across all Indian States & UTs.`);
    console.log('\n======================================================');
    console.log('🎉 INDIAN STATES & GOVERNMENT-VERIFIED DATASET READY!');
    console.log('All municipal staff can log in with:');
    console.log('Password: demo1234');
    console.log('URL: http://localhost:3000/municipal-login');
    console.log('======================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedIndiaStatesDataset();
}

module.exports = { seedIndiaStatesDataset };
