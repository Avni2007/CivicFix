/**
 * Provision official municipal (authority/admin) accounts using official government-verified data.
 *
 * Municipal accounts are intentionally NOT creatable through the public
 * /api/auth/register endpoint — that endpoint only ever creates 'citizen'
 * accounts. This script is the controlled provisioning path for municipal
 * staff, meant to be run by administrators (Super Admin / municipal HRMS ops).
 *
 * Official Modes:
 *   1. Bulk provision all official government-verified staff (all 36 States & UTs):
 *      node seed/provisionMunicipalUser.js --allVerified
 *
 *   2. Provision official government staff by HRMS Employee ID from dataset:
 *      node seed/provisionMunicipalUser.js --employeeId "HRMS-DL-MCD-1099"
 *
 *   3. Provision all official government staff for a specific State/UT:
 *      node seed/provisionMunicipalUser.js --state "Delhi"
 *
 *   4. Manual single provisioning with government verification credentials:
 *      node seed/provisionMunicipalUser.js \
 *        --name "Er. Vikas Anand" \
 *        --email officer.pwd.delhi@civicfix.gov \
 *        --password "demo1234" \
 *        --role authority \
 *        --department "Public Works" \
 *        --employeeId "HRMS-DL-MCD-1099" \
 *        --designation "Engineer-in-Chief (Roads, Flyovers & Potholes)" \
 *        --state "Delhi" \
 *        --municipalityCode "MCD-DL" \
 *        --verificationAuthority "Municipal Corporation of Delhi Engineering Cadre"
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const verifiedStaffDataset = require('../data/government_verified_staff_dataset.json');

const VALID_DEPARTMENTS = ['Public Works', 'Sanitation', 'Electricity', 'Water', 'Drainage', 'Traffic', 'Municipal Administration', 'General'];

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      args[key] = value;
      if (value !== true) i++;
    }
  }
  return args;
}

async function provisionFromRecord(sData, defaultPassword = 'demo1234') {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const user = await User.findOneAndUpdate(
    { email: sData.email.toLowerCase() },
    {
      name: sData.name,
      email: sData.email.toLowerCase(),
      passwordHash,
      role: sData.role,
      department: sData.department,
      phone: sData.phone || '',
      locationName: sData.locationName || `${sData.state} Municipal Office`,
      employeeId: sData.employeeId ? sData.employeeId.trim() : undefined,
      designation: sData.designation || '',
      state: sData.state || 'National',
      municipalityCode: sData.municipalityCode || '',
      governmentIdVerified: true,
      verificationAuthority: sData.verificationAuthority || 'Official Government Cadre',
      status: 'active',
      isVerified: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
}

async function provisionMunicipalUser() {
  const args = parseArgs();
  const { 
    name, 
    email, 
    password, 
    role, 
    department, 
    employeeId, 
    phone, 
    designation,
    state,
    municipalityCode,
    verificationAuthority,
    allVerified,
    all
  } = args;

  try {
    await connectDB();

    // Mode 1: Bulk provision all 73+ official government-verified staff
    if (allVerified || all) {
      console.log('🏛️  Provisioning all Official Government-Verified Staff from national dataset...');
      let count = 0;
      for (const sData of verifiedStaffDataset) {
        const u = await provisionFromRecord(sData, password || 'demo1234');
        count++;
        console.log(`  [${count}/${verifiedStaffDataset.length}] ${u.name} (${u.role.toUpperCase()}) - ${u.designation} [${u.employeeId}]`);
      }
      console.log(`\n✅ Successfully provisioned ${count} official government staff across all 36 States & UTs.`);
      console.log('Staff members can sign in at /municipal-login with default password: demo1234');
      await disconnectDB();
      process.exit(0);
    }

    // Mode 2: Provision from verified dataset by state
    if (state && !email && !name) {
      const stateMatches = verifiedStaffDataset.filter(
        s => s.state.toLowerCase() === state.toLowerCase()
      );
      if (stateMatches.length > 0) {
        console.log(`🏛️  Provisioning Official Government Staff for State: "${state}"...`);
        for (const sData of stateMatches) {
          const u = await provisionFromRecord(sData, password || 'demo1234');
          console.log(`  - ${u.name} (${u.designation}) | Email: ${u.email} | HRMS: ${u.employeeId}`);
        }
        console.log(`\n✅ Provisioned ${stateMatches.length} official staff members for ${state}.`);
        await disconnectDB();
        process.exit(0);
      }
    }

    // Mode 3: Lookup from verified dataset by employeeId
    if (employeeId && !name && !email) {
      const match = verifiedStaffDataset.find(
        s => s.employeeId.toLowerCase() === employeeId.toLowerCase().trim()
      );
      if (match) {
        console.log(`🏛️  Found official record for HRMS ID: ${employeeId}`);
        const u = await provisionFromRecord(match, password || 'demo1234');
        console.log('[ProvisionMunicipalUser] Official account provisioned successfully:');
        console.log(`  Name:         ${u.name}`);
        console.log(`  Email:        ${u.email}`);
        console.log(`  Role:         ${u.role}`);
        console.log(`  Department:   ${u.department}`);
        console.log(`  Designation:  ${u.designation}`);
        console.log(`  State:        ${u.state}`);
        console.log(`  HRMS ID:      ${u.employeeId}`);
        console.log(`  Authority:    ${u.verificationAuthority}`);
        console.log('Account can sign in at POST /api/auth/municipal-login.');
        await disconnectDB();
        process.exit(0);
      } else {
        console.warn(`[ProvisionMunicipalUser] Employee ID "${employeeId}" not found in dataset. Proceeding with manual input...`);
      }
    }

    // Mode 4: Standard / Manual provisioning
    const errors = [];
    if (!name) errors.push('--name is required (or use --allVerified / --employeeId)');
    if (!email) errors.push('--email is required');
    if (!password || password.length < 8) errors.push('--password is required (min 8 characters)');
    if (!role || !['authority', 'admin'].includes(role)) errors.push('--role must be "authority" or "admin"');
    if (role === 'authority' && (!department || !VALID_DEPARTMENTS.includes(department))) {
      errors.push(`--department is required for --role authority (one of: ${VALID_DEPARTMENTS.join(', ')})`);
    }

    if (errors.length) {
      console.error('[ProvisionMunicipalUser] Invalid arguments:');
      errors.forEach(e => console.error('  - ' + e));
      console.log('\nQuick Usage Examples:');
      console.log('  node seed/provisionMunicipalUser.js --allVerified');
      console.log('  node seed/provisionMunicipalUser.js --employeeId "HRMS-DL-MCD-1099"');
      console.log('  node seed/provisionMunicipalUser.js --state "Delhi"');
      await disconnectDB();
      process.exit(1);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error(`[ProvisionMunicipalUser] A user with email ${email} already exists (role: ${existing.role}). Aborting.`);
      await disconnectDB();
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      department: role === 'authority' ? department : 'Municipal Administration',
      phone: phone || '',
      employeeId: employeeId ? employeeId.trim() : undefined,
      designation: designation || (role === 'admin' ? 'Municipal Commissioner' : `${department} Officer`),
      state: state || 'National',
      municipalityCode: municipalityCode || '',
      governmentIdVerified: Boolean(verificationAuthority || employeeId),
      verificationAuthority: verificationAuthority || 'Municipal Administration Cadre',
      status: 'active',
      isVerified: true
    });

    console.log('[ProvisionMunicipalUser] Municipal account created successfully:');
    console.log(`  Name:         ${user.name}`);
    console.log(`  Email:        ${user.email}`);
    console.log(`  Role:         ${user.role}`);
    console.log(`  Department:   ${user.department}`);
    console.log(`  Designation:  ${user.designation}`);
    console.log(`  HRMS ID:      ${user.employeeId || '(none)'}`);
    console.log(`  Govt Verified:${user.governmentIdVerified}`);
    console.log('This account can sign in at POST /api/auth/municipal-login.');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[ProvisionMunicipalUser] Failed:', error.message);
    try { await disconnectDB(); } catch (_) {}
    process.exit(1);
  }
}

provisionMunicipalUser();
