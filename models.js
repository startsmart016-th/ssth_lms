/**
 * ============================================================================
 * STARTSMART TECH HUB MOBILE LMS - MONGOOSE MODELS (models.js)
 * ============================================================================
 * Production-ready Mongoose schemas and models for:
 * 1. InstitutionSettings (Singleton pattern)
 * 2. User Schema (RBAC, Digital ID Credentials, Authentication)
 * ============================================================================
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// ============================================================================
// 1. INSTITUTION SETTINGS SCHEMA (SINGLETON PATTERN)
// ============================================================================
/**
 * Stores global branding, contact coordinates, admin signature, and official seal/stamp.
 * Enforces a strict Singleton pattern via a static `getSingleton()` helper so only one
 * configuration record ever exists across the entire institution.
 */
const InstitutionSettingsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      default: 'StartSmart Tech Hub',
    },
    tagline: {
      type: String,
      trim: true,
      default: 'Empowering Next-Gen Digital Leaders & Tech Innovators',
    },
    logoUrl: {
      type: String,
      default: '/icon.svg',
    },
    location: {
      type: String,
      default: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'registrar@startsmart.tech',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '+234 (0) 800-STARTSMART / +1 (555) 019-2831',
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: 'https://startsmart.tech',
    },
    // High-resolution SVG / PNG vector signature of the Chief Academic Director / Registrar
    adminSignatureUrl: {
      type: String,
      default: '/admin-signature.png',
    },
    // Official cryptographic digital seal / stamp with watermark and verification rings
    sealOrStampUrl: {
      type: String,
      default: '/official-stamp.png',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static Singleton helper:
 * Guarantees that only one document exists in the collection.
 * Creates default institutional data if no document is present.
 */
InstitutionSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// ============================================================================
// 2. USER SCHEMA (RBAC & DYNAMIC DIGITAL ID CARD)
// ============================================================================
/**
 * User schema accommodating Students, Facilitators, and Administrators.
 * Features:
 * - Hashed passwords (bcrypt pre-save hook)
 * - Unique ID number for institutional badges (e.g., SST-001)
 * - Facilitator/Admin digital signatures for grading and course certifications
 * - Active/Suspended/Graduated status tracking
 * - Digital ID card issue and expiration dates
 */
const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [4, 'Password must be at least 4 characters long'],
      select: false, // Omit password hash by default from queries for security
    },
    pin: {
      type: String,
      required: [true, 'Security PIN is required'],
      select: false, // Omit security PIN hash by default from queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'facilitator', 'student'],
        message: '{VALUE} is not an authorized role',
      },
      default: 'student',
      required: true,
    },
    idNumber: {
      type: String,
      required: [true, 'Unique institutional ID number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      default:
        'https://i.imgur.com/J1pnjB4.png',
    },
    signatureUrl: {
      type: String,
      default: '',
      // Strictly utilized for Facilitator course completion sign-offs and Admin verifications
    },
    department: {
      type: String,
      default: 'Information & Applied Technology',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'graduated'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    idCardIssuedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    idCardExpiryDate: {
      type: String,
      default: () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        return d.toISOString().split('T')[0];
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

/**
 * Virtual: `name` alias for compatibility
 */
UserSchema.virtual('name').get(function () {
  return this.fullName;
});

/**
 * Pre-save middleware: Automatically hash password and PIN before saving if modified
 */
UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified('pin')) {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Instance Methods: Compare candidate password and PIN against stored bcrypt hashes
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.comparePin = async function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

// Export Mongoose Models
export const InstitutionSettings =
  mongoose.models.InstitutionSettings ||
  mongoose.model('InstitutionSettings', InstitutionSettingsSchema);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default {
  InstitutionSettings,
  User,
};
