const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');
const Draft = require('../models/Draft');
const CalendarTask = require('../models/CalendarTask');
const Municipality = require('../models/Municipality');

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

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Cleaning existing database collections...');

    await User.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintHistory.deleteMany({});
    await Notification.deleteMany({});
    await Comment.deleteMany({});
    await Feedback.deleteMany({});
    await Draft.deleteMany({});
    await CalendarTask.deleteMany({});
    await Municipality.deleteMany({});

    // 1. Seed 36 Official Indian State & UT Municipalities
    console.log('[Seeder] Seeding 36 Official Indian State & UT Municipal Corporations...');
    for (const mData of statesDataset) {
      const departmentsWithMetadata = STANDARD_DEPARTMENTS.map(d => ({
        name: d.name,
        code: `${mData.shortName}-${d.code}`,
        headOfficerName: `${d.name} In-Charge (${mData.city})`,
        contactEmail: `${d.code.toLowerCase()}.${mData.shortName.toLowerCase()}@${mData.officialEmailDomain}`,
        contactPhone: mData.helpline
      }));

      await Municipality.create({
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
      });
    }
    console.log(' ✅ 36 Municipalities seeded.');

    // 2. Seed Official Government-Verified Staff Dataset (73+ Official Accounts)
    console.log('[Seeder] Seeding Official Government-Verified Staff Dataset (HRMS Cadre)...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo1234', salt);

    const staffUserMap = {};
    for (const sData of staffDataset) {
      const user = await User.create({
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
      });
      staffUserMap[sData.email.toLowerCase()] = user;
    }
    console.log(` ✅ ${staffDataset.length} Official Government Staff accounts provisioned.`);

    // 3. Create Convenience Citizen & Demo Shortcut Accounts (linked with official credentials)
    console.log('[Seeder] Creating Citizen and Verified Demo Shortcut Accounts...');
    const citizenUser = await User.create({
      name: 'Avni Sharma',
      email: 'citizen@civicfix.demo',
      passwordHash,
      role: 'citizen',
      department: 'None',
      phone: '+91 98765 43210',
      locationName: 'Green Park, Sector 4, New Delhi',
      isVerified: true,
      stats: { reportedCount: 14, resolvedCount: 9 }
    });

    const secondCitizen = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@civicfix.demo',
      passwordHash,
      role: 'citizen',
      department: 'None',
      phone: '+91 98111 22334',
      locationName: 'University Campus Area, Delhi',
      isVerified: true,
      stats: { reportedCount: 6, resolvedCount: 4 }
    });

    const roadsOfficer = await User.create({
      name: 'Er. Vikas Anand (Roads & Infrastructure)',
      email: 'authority@civicfix.demo',
      passwordHash,
      role: 'authority',
      department: 'Public Works',
      phone: '011-23225260',
      locationName: 'Civic Centre, 14th Floor, JLN Marg, New Delhi',
      employeeId: 'HRMS-DEMO-PWD-01',
      designation: 'Engineer-in-Chief (Roads, Flyovers & Potholes)',
      state: 'Delhi',
      municipalityCode: 'MCD-DL',
      governmentIdVerified: true,
      verificationAuthority: 'Municipal Corporation of Delhi Engineering Cadre',
      isVerified: true
    });

    const sanitationOfficer = await User.create({
      name: 'Dr. Pradeep Kawatra (Sanitation & DEMS)',
      email: 'officer.sanitation@civicfix.demo',
      passwordHash,
      role: 'authority',
      department: 'Sanitation',
      phone: '011-23225275',
      locationName: 'Civic Centre, 22nd Floor, JLN Marg, New Delhi',
      employeeId: 'HRMS-DEMO-SWM-01',
      designation: 'Director (Department of Environment Management Services)',
      state: 'Delhi',
      municipalityCode: 'MCD-DL',
      governmentIdVerified: true,
      verificationAuthority: 'MCD Environment Management Services',
      isVerified: true
    });

    const electricityOfficer = await User.create({
      name: 'Er. Rajesh Sharma (Power & Streetlighting)',
      email: 'officer.electricity@civicfix.demo',
      passwordHash,
      role: 'authority',
      department: 'Electricity',
      phone: '0771-2535785',
      locationName: 'RMC Electrical Division, Raipur',
      employeeId: 'HRMS-DEMO-ELE-01',
      designation: 'Assistant Engineer (Streetlighting & Power Grid)',
      state: 'Chhattisgarh',
      municipalityCode: 'RMC-CG',
      governmentIdVerified: true,
      verificationAuthority: 'Raipur Municipal Corporation Statutory Services',
      isVerified: true
    });

    const adminUser = await User.create({
      name: 'Dr. Ashwani Kumar, IAS',
      email: 'admin@civicfix.demo',
      passwordHash,
      role: 'admin',
      department: 'Municipal Administration',
      phone: '011-23225249',
      locationName: 'Dr. S.P. Mukherjee Civic Centre, JLN Marg, New Delhi',
      employeeId: 'HRMS-DEMO-ADM-01',
      designation: 'Commissioner, Municipal Corporation of Delhi',
      state: 'Delhi',
      municipalityCode: 'MCD-DL',
      governmentIdVerified: true,
      verificationAuthority: 'Ministry of Home Affairs / Govt. of NCT of Delhi',
      isVerified: true
    });

    // 4. Populate Realistic Geo-Tagged Complaints
    console.log('[Seeder] Populating 36+ realistic complaints across Indian municipal jurisdictions...');

    const sampleComplaintsData = [
      {
        complaintId: 'CIV-2026-000101',
        title: 'Deep Hazardous Pothole on Ring Road near AIIMS Flyover',
        description: 'Large crater-like pothole in the middle lane causing abrupt braking and two-wheeler skids. Located right under the outer ring road flyover approach.',
        category: 'Pothole',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
        location: { address: 'Ring Road near AIIMS Flyover Approach', lat: 28.5672, lng: 77.2100, city: 'New Delhi', area: 'South Delhi' },
        reportedBy: citizenUser._id,
        assignedDepartment: 'Public Works',
        assignedOfficer: roadsOfficer._id,
        aiAnalysis: { confidence: 0.96, suggestedCategory: 'Pothole', suggestedPriority: 'CRITICAL', suggestedDepartment: 'Public Works', similarCount: 1, summary: 'High-risk road crater on major Delhi arterial route.' }
      },
      {
        complaintId: 'CIV-2026-000102',
        title: 'Uncollected Commercial Waste Heap behind Karol Bagh Market',
        description: 'Extensive accumulation of organic and packaging waste overflowing onto the pedestrian lane. Stray animals tearing garbage bags, causing severe stench.',
        category: 'Garbage',
        priority: 'HIGH',
        status: 'ASSIGNED',
        images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'],
        location: { address: 'Block 12, Ajmal Khan Road Lane, Karol Bagh', lat: 28.6517, lng: 77.1906, city: 'New Delhi', area: 'Central Delhi' },
        reportedBy: secondCitizen._id,
        assignedDepartment: 'Sanitation',
        assignedOfficer: sanitationOfficer._id,
        aiAnalysis: { confidence: 0.95, suggestedCategory: 'Garbage', suggestedPriority: 'HIGH', suggestedDepartment: 'Sanitation', similarCount: 2, summary: 'Commercial refuse accumulation in high-density shopping zone.' }
      },
      {
        complaintId: 'CIV-2026-000103',
        title: 'Consecutive Dark Streetlight Stretch on Shanti Path',
        description: 'Row of 4 LED street pole luminaires failing to illuminate at dusk, creating dark corridor for cyclists and night pedestrians.',
        category: 'Streetlight',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80'],
        proofOfWorkImages: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'],
        location: { address: 'Pole No. 44-48, Shanti Path, Chanakyapuri', lat: 28.5921, lng: 77.1884, city: 'New Delhi', area: 'Chanakyapuri' },
        reportedBy: citizenUser._id,
        assignedDepartment: 'Electricity',
        assignedOfficer: electricityOfficer._id,
        resolvedAt: new Date(Date.now() - 86400000),
        aiAnalysis: { confidence: 0.93, suggestedCategory: 'Streetlight', suggestedPriority: 'MEDIUM', suggestedDepartment: 'Electricity', similarCount: 0, summary: 'Luminaires failed circuit breaker in Chanakyapuri circle.' }
      },
      {
        complaintId: 'CIV-2026-000104',
        title: 'Open Clogged Storm Water Drain Overflowing near Rohini Sector 9',
        description: 'Open municipal drainage conduit overflowing black stagnant water onto service road after moderate showers. Health hazard for local school.',
        category: 'Drainage',
        priority: 'CRITICAL',
        status: 'REPORTED',
        images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80'],
        location: { address: 'Near Mother Dairy, Sector 9, Rohini', lat: 28.7120, lng: 77.1230, city: 'Delhi', area: 'North West Delhi' },
        reportedBy: secondCitizen._id,
        assignedDepartment: 'Drainage',
        aiAnalysis: { confidence: 0.97, suggestedCategory: 'Drainage', suggestedPriority: 'CRITICAL', suggestedDepartment: 'Drainage', similarCount: 1, summary: 'Storm drainage blockage requiring desilting suction tanker.' }
      },
      {
        complaintId: 'CIV-2026-000105',
        title: 'Pressurized Water Supply Main Line Burst at Nariman Point',
        description: 'Underground municipal potable water pipeline burst beneath footpath, spewing thousands of liters of clean drinking water onto roadway.',
        category: 'Water',
        priority: 'CRITICAL',
        status: 'CLOSED',
        images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'],
        proofOfWorkImages: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
        location: { address: 'Free Press Journal Marg, Nariman Point', lat: 18.9256, lng: 72.8242, city: 'Mumbai', area: 'South Mumbai' },
        reportedBy: citizenUser._id,
        assignedDepartment: 'Water',
        resolvedAt: new Date(Date.now() - 172800000),
        closedAt: new Date(Date.now() - 86400000),
        aiAnalysis: { confidence: 0.98, suggestedCategory: 'Water', suggestedPriority: 'CRITICAL', suggestedDepartment: 'Water', similarCount: 0, summary: 'BMC Ward A drinking water pipeline replaced and tested.' }
      }
    ];

    // Seed state-specific sample complaints from indian_states_municipal_dataset
    for (let i = 0; i < statesDataset.length; i++) {
      const mData = statesDataset[i];
      const sample = mData.sampleComplaint;
      const complaintId = `CIV-IND-${String(i + 101).padStart(4, '0')}`;

      const matchingStaff = staffDataset.find(s => s.state === mData.state && s.role === 'authority') 
        || staffDataset.find(s => s.state === mData.state);
      const officerDoc = matchingStaff ? staffUserMap[matchingStaff.email.toLowerCase()] : roadsOfficer;

      const validCategories = ['Garbage', 'Pothole', 'Road', 'Streetlight', 'Water', 'Drainage', 'Public Property', 'Traffic', 'Other'];
      const complaintCategory = validCategories.includes(sample.category) 
        ? sample.category 
        : (sample.category === 'Electricity' ? 'Streetlight' : 'Other');

      sampleComplaintsData.push({
        complaintId,
        title: sample.title,
        description: sample.description,
        category: complaintCategory,
        priority: sample.priority,
        status: i % 4 === 0 ? 'RESOLVED' : i % 3 === 0 ? 'IN_PROGRESS' : i % 2 === 0 ? 'ASSIGNED' : 'REPORTED',
        images: [
          sample.category === 'Pothole'
            ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
            : sample.category === 'Garbage'
            ? 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80'
            : sample.category === 'Water' || sample.category === 'Drainage'
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80'
        ],
        location: {
          address: sample.address,
          lat: mData.location.lat,
          lng: mData.location.lng,
          city: mData.city,
          area: mData.district || mData.city
        },
        reportedBy: i % 2 === 0 ? citizenUser._id : secondCitizen._id,
        assignedDepartment: matchingStaff ? matchingStaff.department : 'Public Works',
        assignedOfficer: officerDoc ? officerDoc._id : roadsOfficer._id,
        aiAnalysis: {
          confidence: 0.92,
          suggestedCategory: sample.category,
          suggestedPriority: sample.priority,
          suggestedDepartment: matchingStaff ? matchingStaff.department : 'Public Works',
          similarCount: i % 3,
          summary: `NLP classification in ${mData.city}, ${mData.state}. Municipal body: ${mData.name} (LGD: ${mData.lgdCode}).`
        }
      });
    }

    const createdComplaints = await Complaint.insertMany(sampleComplaintsData);
    console.log(`[Seeder] Created ${createdComplaints.length} complaints.`);

    // Create Drafts
    await Draft.create({
      userId: citizenUser._id,
      title: 'Unfinished Pipeline Excavation Trench',
      description: 'Public works dug up the road near sector 4 market 3 days ago for water pipe inspection but left an open 4-foot deep trench without any safety barriers or warning lights.',
      category: 'Water',
      priority: 'HIGH',
      location: { address: 'Sector 4 Market Road, Green Park', lat: 28.5580, lng: 77.2020 }
    });

    // Create Calendar Tasks
    const inProgressComplaint = createdComplaints.find(c => c.status === 'IN_PROGRESS');
    if (inProgressComplaint) {
      await CalendarTask.create({
        complaintId: inProgressComplaint._id,
        assignedTo: roadsOfficer._id,
        title: `Site Inspection & Asphalt Patching: ${inProgressComplaint.complaintId}`,
        date: new Date(),
        deadline: new Date(Date.now() + 86400000 * 2),
        status: 'UPCOMING',
        notes: 'Dispatched 2 asphalt rollers and 4 crew members.'
      });
    }

    // Create Audit History Logs & Notifications
    for (const c of createdComplaints.slice(0, 8)) {
      await ComplaintHistory.create({
        complaint: c._id,
        complaintId: c.complaintId,
        status: 'REPORTED',
        action: 'REPORTED',
        changedBy: citizenUser._id,
        changedByName: citizenUser.name,
        changedByRole: 'citizen',
        comment: 'Initial complaint submission.'
      });

      if (c.status !== 'REPORTED') {
        await ComplaintHistory.create({
          complaint: c._id,
          complaintId: c.complaintId,
          status: c.status,
          action: 'STATUS_CHANGE',
          changedBy: roadsOfficer._id,
          changedByName: roadsOfficer.name,
          changedByRole: 'authority',
          comment: `Updated status to ${c.status}.`
        });
      }

      await Notification.create({
        user: citizenUser._id,
        complaint: c._id,
        complaintId: c.complaintId,
        title: `Status update: ${c.status}`,
        message: `Complaint ${c.complaintId} has been updated to ${c.status}.`,
        type: 'STATUS_CHANGE'
      });

      await Comment.create({
        complaint: c._id,
        user: roadsOfficer._id,
        message: 'Official Municipal Engineering team dispatched for field assessment.'
      });
    }

    console.log('===================================================');
    console.log('🇮🇳 CIVICFIX SEEDING WITH OFFICIAL GOVT DATA COMPLETE!');
    console.log('===================================================');
    console.log('OFFICIAL GOVERNMENT-VERIFIED STAFF READY:');
    console.log('  🏛️  Delhi MCD Commissioner:    commissioner.mcd@delhi.gov.in / demo1234');
    console.log('  🛠️  Delhi MCD Roads Chief:     officer.pwd.delhi@civicfix.gov / demo1234');
    console.log('  🏛️  Mumbai BMC Commissioner:   commissioner.bmc@mcgm.gov.in  / demo1234');
    console.log('  🛠️  Mumbai BMC Roads Chief:    officer.pwd.maharashtra@civicfix.gov / demo1234');
    console.log('  🏛️  BBMP Bengaluru Comm.:      commissioner.bbmp@karnataka.gov.in / demo1234');
    console.log('  🛠️  BBMP Bengaluru PWD Chief:  officer.pwd.karnataka@civicfix.gov / demo1234');
    console.log('---------------------------------------------------');
    console.log('CONVENIENCE SHORTCUT ACCOUNTS (Auto-Prefilled):');
    console.log('  👤 Citizen:     citizen@civicfix.demo           / demo1234');
    console.log('  👷 Authority:   authority@civicfix.demo         / demo1234 (PWD Delhi)');
    console.log('  🛠️ Sanitation:  officer.sanitation@civicfix.demo / demo1234 (DEMS MCD)');
    console.log('  👑 Admin:       admin@civicfix.demo             / demo1234 (MCD Comm.)');
    console.log('===================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
