/**
 * ============================================================================
 * STARTSMART TECH HUB MOBILE LMS - EXPRESS API & RBAC MIDDLEWARE (server/routes.js)
 * ============================================================================
 * Production-ready Express router implementing:
 * - verifyToken & isAdmin RBAC JWT middlewares
 * - GET /api/settings (Public institution branding & signature/seal)
 * - PUT /api/settings (Admin-only institution branding updates)
 * - GET /api/users/me (Protected route fetching logged-in user's profile & ID details)
 * - GET /api/verify-id/:idNumber (Public verification endpoint validating active & unexpired credentials)
 * ============================================================================
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { InstitutionSettings, User } from './models.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'startsmart-super-secret-jwt-key-2025';

// ============================================================================
// RBAC MIDDLEWARE
// ============================================================================

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. Missing or invalid authorization token.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired session token. Please sign in again.',
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden. Administrator privileges are required to perform this action.',
    });
  }
  next();
};

// ============================================================================
// 1. INSTITUTION SETTINGS ENDPOINTS
// ============================================================================

router.get('/settings', async (req, res) => {
  try {
    let settings = await InstitutionSettings.findOne();
    if (!settings) {
      settings = await InstitutionSettings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error retrieving institution settings:', error);
    res.status(500).json({
      error: 'Failed to retrieve institution settings. Please try again later.',
    });
  }
});

router.put('/settings', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      tagline,
      logoUrl,
      location,
      contactEmail,
      contactPhone,
      websiteUrl,
      adminSignatureUrl,
      sealOrStampUrl,
    } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (tagline) updates.tagline = tagline.trim();
    if (logoUrl) updates.logoUrl = logoUrl;
    if (location) updates.location = location.trim();
    if (contactEmail) updates.contactEmail = contactEmail.trim().toLowerCase();
    if (contactPhone) updates.contactPhone = contactPhone.trim();
    if (websiteUrl) updates.websiteUrl = websiteUrl.trim();
    if (adminSignatureUrl) updates.adminSignatureUrl = adminSignatureUrl;
    if (sealOrStampUrl) updates.sealOrStampUrl = sealOrStampUrl;

    let settings = await InstitutionSettings.findOne();
    if (!settings) {
      settings = await InstitutionSettings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    res.status(200).json({
      message: 'Institution settings updated successfully.',
      settings,
    });
  } catch (error) {
    console.error('Error updating institution settings:', error);
    res.status(500).json({
      error: error.message || 'Failed to update institution settings.',
    });
  }
});

// ============================================================================
// 2. USER PROFILE & DIGITAL ID ENDPOINT
// ============================================================================

router.get('/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User profile not found. The account may have been removed.',
      });
    }

    const userData = user.toObject ? user.toObject() : user;
    userData.fullName = userData.fullName || userData.name;
    userData.idCardIssuedDate = userData.idCardIssuedDate || userData.issueDate;
    userData.idCardExpiryDate = userData.idCardExpiryDate || userData.expiryDate;

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile data.',
    });
  }
});

// ============================================================================
// 3. PUBLIC DIGITAL ID QR VERIFICATION ENDPOINT
// ============================================================================

router.get('/verify-id/:idNumber', async (req, res) => {
  try {
    const { idNumber } = req.params;

    const user = await User.findOne({
      $or: [
        { idNumber: idNumber.toUpperCase() },
        { idNumber: idNumber },
        { _id: idNumber.match(/^[0-9a-fA-F]{24}$/) ? idNumber : null },
      ],
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        verified: false,
        valid: false,
        active: false,
        unexpired: false,
        message: `Credential Not Found: ID #${idNumber} is not registered in the StartSmart Tech Hub registry.`,
      });
    }

    let settings = await InstitutionSettings.findOne();
    if (!settings) {
      settings = {
        name: 'StartSmart Tech Hub',
        tagline: 'Empowering Next-Gen Digital Leaders & Tech Innovators',
        logoUrl: '/icon.svg',
        location: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH',
        contactEmail: 'registrar@startsmart.tech',
        contactPhone: '+234 (0) 800-STARTSMART / +1 (555) 019-2831',
        websiteUrl: 'https://startsmart.tech',
        adminSignatureUrl: '',
        sealOrStampUrl: '',
      };
    }

    const expiryDateStr = user.idCardExpiryDate || user.expiryDate;
    const expiryTimestamp = expiryDateStr ? new Date(expiryDateStr).getTime() : Infinity;
    const now = Date.now();

    const isExpired = expiryTimestamp < now;
    const isActive = user.status === 'active';
    const isValid = isActive && !isExpired;

    let statusDescription = 'AUTHENTIC & ACTIVE';
    if (!isActive) {
      statusDescription = `INACTIVE (${user.status.toUpperCase()})`;
    } else if (isExpired) {
      statusDescription = 'EXPIRED CREDENTIAL';
    }

    res.status(200).json({
      verified: true,
      valid: isValid,
      active: isActive,
      unexpired: !isExpired,
      status: statusDescription,
      holder: {
        id: user._id,
        fullName: user.fullName || user.name,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role.toUpperCase(),
        idNumber: user.idNumber,
        department: user.department,
        avatarUrl: user.avatarUrl,
        signatureUrl: user.signatureUrl || null,
        idCardIssuedDate: user.idCardIssuedDate || user.issueDate,
        idCardExpiryDate: user.idCardExpiryDate || user.expiryDate,
        status: user.status,
      },
      institution: {
        name: settings.name,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl,
        location: settings.location,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        websiteUrl: settings.websiteUrl,
        adminSignatureUrl: settings.adminSignatureUrl,
        sealOrStampUrl: settings.sealOrStampUrl,
      },
      verifiedAt: new Date().toISOString(),
      securityHash: `SST-VERIFY-${Buffer.from(
        `${user.idNumber}:${user.fullName || user.name}:${user.status}`
      ).toString('base64')}`,
    });
  } catch (error) {
    console.error('Error during ID verification:', error);
    res.status(500).json({
      error: 'ID verification lookup service failed. Please try again.',
    });
  }
});

export default router;
