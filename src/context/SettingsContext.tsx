import React, { createContext, useContext, useState, useEffect } from 'react';
import { InstitutionSettings } from '../types';

interface SettingsContextType {
  settings: InstitutionSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<InstitutionSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  uploadLogo: (fileOrDataUrl: File | string) => Promise<{ success: boolean; logoUrl?: string; error?: string }>;
}

const DEFAULT_SETTINGS: InstitutionSettings = {
  name: 'StartSmart Tech Hub',
  tagline: 'Empowering Next-Gen Digital Leaders & Tech Innovators',
  logoUrl: '/logo.png',
  adminName: 'Academic Admissions Directorate',
  principalName: 'Mr. Seidu Mahamadu',
  location: 'Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH',
  contactEmail: 'registrar@startsmart.tech',
  contactPhone: '+234 (0) 800-STARTSMART / +1 (555) 019-2831',
  websiteUrl: 'https://startsmart.tech',
  adminSignatureUrl: '/admin-signature.png',
  principalSignatureUrl: '/signature.png',
  sealOrStampUrl: '/official-stamp.png',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  updateSettings: async () => false,
  refreshSettings: async () => {},
  uploadLogo: async () => ({ success: false, error: 'Context not initialized' }),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<InstitutionSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.logoUrl && data.logoUrl.includes('imgur.com')) {
          data.logoUrl = '/logo.png';
        }
        if (data.sealOrStampUrl && data.sealOrStampUrl.includes('imgur.com')) {
          data.sealOrStampUrl = '/official-stamp.png';
        }
        setSettings(data);
      }
    } catch (e) {
      console.warn('Using cached institution settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<InstitutionSettings>): Promise<boolean> => {
    try {
      const sanitized = { ...newSettings };
      if (sanitized.adminSignatureUrl && (sanitized.adminSignatureUrl.includes('E11Ybx5') || sanitized.adminSignatureUrl.includes('/admin-signature.png'))) {
        sanitized.adminSignatureUrl = '/admin-signature.png';
      }
      if (sanitized.sealOrStampUrl && (sanitized.sealOrStampUrl.includes('lXiJnGI') || sanitized.sealOrStampUrl.includes('J1pnjB4') || sanitized.sealOrStampUrl.includes('/official-stamp.png'))) {
        sanitized.sealOrStampUrl = '/official-stamp.png';
      }

      const token = localStorage.getItem('startsmart_token') || localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sanitized),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to update institution settings:', e);
      return false;
    }
  };

  /**
   * File upload handler that accepts a File or Base64 data URL,
   * uploads and persists it to the backend database, and updates
   * the application settings so the logo immediately renders across
   * the portal header, certificate templates, ID badges, and letterheads.
   */
  const uploadLogo = async (
    fileOrDataUrl: File | string
  ): Promise<{ success: boolean; logoUrl?: string; error?: string }> => {
    try {
      let logoData: string;

      if (typeof fileOrDataUrl === 'string') {
        logoData = fileOrDataUrl;
      } else if (fileOrDataUrl instanceof File) {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
        if (!validTypes.includes(fileOrDataUrl.type)) {
          return {
            success: false,
            error: 'Unsupported file format. Please upload a PNG, SVG, JPG, WebP, or GIF image.',
          };
        }

        // Validate file size (max 5MB)
        if (fileOrDataUrl.size > 5 * 1024 * 1024) {
          return {
            success: false,
            error: 'File size exceeds 5MB limit. Please upload an optimized school logo.',
          };
        }

        // Read File as Data URL
        logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to parse uploaded image.'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read image file.'));
          reader.readAsDataURL(fileOrDataUrl);
        });
      } else {
        return {
          success: false,
          error: 'Invalid file parameter provided. Expected a File object or image Data URL.',
        };
      }

      const token = localStorage.getItem('startsmart_token') || localStorage.getItem('token');

      // 1. Post to /api/upload-logo endpoint
      const uploadRes = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ logoData }),
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload school logo to server.');
      }

      const result = await uploadRes.json();
      const updatedLogoUrl = result.logoUrl || logoData;

      // 2. Also ensure updated in institution settings endpoint
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ logoUrl: updatedLogoUrl }),
      }).catch((err) => {
        console.warn('Settings synchronization note:', err);
      });

      // 3. Immediately update reactive state across the application
      setSettings(prev => ({
        ...prev,
        logoUrl: updatedLogoUrl,
      }));

      return {
        success: true,
        logoUrl: updatedLogoUrl,
      };
    } catch (e: any) {
      console.error('Failed to upload school logo:', e);
      return {
        success: false,
        error: e.message || 'Error uploading school logo.',
      };
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings, uploadLogo }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
