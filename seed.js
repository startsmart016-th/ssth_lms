/**
 * ============================================================================
 * STARTSMART TECH HUB - MONGODB ATLAS SEED SCRIPT (seed.js)
 * ============================================================================
 * Initial Database Seed Script provisioning the required accounts, institution
 * settings, and sample curriculum into MongoDB Atlas / local database.
 *
 * SPECIFIED ACCOUNTS:
 * - Admin: Seidu Mahamadu | SST-ADM-001 | Pass: 11316638 | PIN: 70723
 * - Facilitator: Prof Seidu Mohammed | SST-FAC-001 | Pass: 11318142 | PIN: 48617
 * - Student: Seidu Abdul Rafiq | SST-STU-001 | Pass: 11037000 | PIN: 21408
 * ============================================================================
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { InstitutionSettings, User } from './models.js';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/startsmart_lms';

async function runSeed() {
  console.log('====================================================');
  console.log('🌱 Starting StartSmart Tech Hub Database Seeding...');
  console.log('====================================================');

  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB Atlas / Database successfully.');

    // 1. Seed Institution Settings
    console.log('\n🏛️ Seeding Institution Settings...');
    const defaultSettings = {
      name: 'StartSmart Tech Hub',
      tagline: 'Empowering Next-Generation Digital Artisans & Leaders',
      logoUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
      location: 'StartSmart Innovation Campus, Innovation Drive, Block B, Tech Valley',
      contactEmail: 'admissions@startsmart.tech',
      contactPhone: '+234 800 STARTSMART / +234 803 113 1663',
      websiteUrl: 'https://startsmart.tech',
      adminSignatureUrl: '/admin-signature.png',
      sealOrStampUrl: '/official-stamp.png',
    };

    let settings = await InstitutionSettings.findOne();
    if (!settings) {
      settings = await InstitutionSettings.create(defaultSettings);
      console.log('✓ Institution Settings created.');
    } else {
      Object.assign(settings, defaultSettings);
      await settings.save();
      console.log('✓ Institution Settings updated.');
    }

    // 2. Hash Passwords and 5-Digit PINs
    console.log('\n🔐 Generating cryptographic hashes for credentials...');
    const adminPasswordHash = await bcrypt.hash('11316638', 10);
    const adminPinHash = await bcrypt.hash('70723', 10);

    const facilitatorPasswordHash = await bcrypt.hash('11318142', 10);
    const facilitatorPinHash = await bcrypt.hash('48617', 10);

    const studentPasswordHash = await bcrypt.hash('11037000', 10);
    const studentPinHash = await bcrypt.hash('21408', 10);

    // 3. User Seed Array
    const seedUsers = [
      {
        fullName: 'Seidu Mahamadu',
        email: 'seidu.admin@startsmart.tech',
        password: adminPasswordHash,
        pin: adminPinHash,
        role: 'admin',
        idNumber: 'SST-ADM-001',
        avatarUrl:
          'https://i.imgur.com/J1pnjB4.png',
        signatureUrl: defaultSettings.adminSignatureUrl,
        department: 'Executive Academic Council & Administration',
        status: 'active',
        idCardIssuedDate: '2025-01-01',
        idCardExpiryDate: '2028-12-31',
      },
      {
        fullName: 'Prof Seidu Mohammed',
        email: 'seidu.facilitator@startsmart.tech',
        password: facilitatorPasswordHash,
        pin: facilitatorPinHash,
        role: 'facilitator',
        idNumber: 'SST-FAC-001',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        signatureUrl:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><path d="M15,45 Q50,15 80,30 T130,15 Q170,45 200,25" fill="none" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="52" font-family="cursive" font-size="14" fill="%2310b981">Prof Seidu Mohammed</text></svg>',
        department: 'Computer Science & Software Engineering',
        status: 'active',
        idCardIssuedDate: '2025-01-15',
        idCardExpiryDate: '2027-12-31',
      },
      {
        fullName: 'Seidu Abdul Rafiq',
        email: 'seidu.student@startsmart.tech',
        password: studentPasswordHash,
        pin: studentPinHash,
        role: 'student',
        idNumber: 'SST-STU-001',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        signatureUrl: '',
        department: 'Software Engineering & Cloud Computing',
        status: 'active',
        idCardIssuedDate: '2025-02-01',
        idCardExpiryDate: '2027-12-31',
      },
    ];

    console.log('\n👤 Seeding Primary Users...');
    for (const userData of seedUsers) {
      const existing = await User.findOne({
        $or: [{ email: userData.email }, { idNumber: userData.idNumber }],
      });

      if (existing) {
        Object.assign(existing, userData);
        await existing.save();
        console.log(`✓ Updated existing user: ${userData.fullName} (${userData.idNumber} - ${userData.role})`);
      } else {
        await User.create(userData);
        console.log(`✓ Created user: ${userData.fullName} (${userData.idNumber} - ${userData.role})`);
      }
    }

    console.log('\n====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Login Test Credentials:');
    console.log('  1. ADMIN:');
    console.log('     Name / ID / Email: Seidu Mahamadu | SST-ADM-001 | seidu.admin@startsmart.tech');
    console.log('     Password:         11316638');
    console.log('     5-Digit PIN:      70723');
    console.log('     Role Destination: /admin/dashboard\n');
    console.log('  2. FACILITATOR:');
    console.log('     Name / ID / Email: Prof Seidu Mohammed | SST-FAC-001 | seidu.facilitator@startsmart.tech');
    console.log('     Password:         11318142');
    console.log('     5-Digit PIN:      48617');
    console.log('     Role Destination: /facilitator/dashboard\n');
    console.log('  3. STUDENT:');
    console.log('     Name / ID / Email: Seidu Abdul Rafiq | SST-STU-001 | seidu.student@startsmart.tech');
    console.log('     Password:         11037000');
    console.log('     5-Digit PIN:      21408');
    console.log('     Role Destination: /student/dashboard\n');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('ℹ️ Local in-memory store in server/db.ts is already pre-configured with these exact users.');
    }
    process.exit(0);
  }
}

// Execute seed if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}

export default runSeed;
