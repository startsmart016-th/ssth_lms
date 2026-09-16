/**
 * ============================================================================
 * STARTSMART TECH HUB MOBILE LMS - MONGOOSE MODELS (server/models.js)
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
    adminName: {
      type: String,
      default: 'Mr. Seidu Mahamadu',
    },
    adminSignatureUrl: {
      type: String,
      default: '/admin-signature.png',
    },
    sealOrStampUrl: {
      type: String,
      default: 'https://i.imgur.com/BrpD2i3.png',
    },
  },
  {
    timestamps: true,
  }
);

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
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
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

UserSchema.virtual('name').get(function () {
  return this.fullName;
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const InstitutionSettings =
  mongoose.models.InstitutionSettings ||
  mongoose.model('InstitutionSettings', InstitutionSettingsSchema);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default {
  InstitutionSettings,
  User,
};
