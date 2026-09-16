/**
 * StartSmart Tech Hub - Frontend Mock Email Notification Service
 *
 * Provides typed functions to trigger, fetch, and manage student mock email
 * notifications for course enrollments, certificate issuances, and academic notices.
 */

import { MockEmailNotification } from '../types';

export interface TriggerMockEmailPayload {
  to?: string;
  recipientName?: string;
  recipientIdNumber?: string;
  studentId?: string;
  category: 'course_enrollment' | 'certificate_awarded' | 'admission_approved' | 'system';
  subject: string;
  previewText?: string;
  bodyText?: string;
  bodyHtml?: string;
  metadata?: Record<string, any>;
}

const CACHE_KEY = 'ssth_mock_emails_cache';

function getLocalEmailCache(): MockEmailNotification[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return [];
}

function setLocalEmailCache(emails: MockEmailNotification[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(emails));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Fetch all mock email notifications for the current authenticated user
 * Resilient against transient network drops or server restarts
 */
export async function fetchMockEmails(token?: string): Promise<MockEmailNotification[]> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attempt fetch with a single retry on connection drop/server boot
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      const res = await fetch('/api/notifications/mock-emails', {
        headers,
        signal: controller?.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : Array.isArray((data as any)?.emails) ? (data as any).emails : [];
          if (list.length > 0) {
            setLocalEmailCache(list);
          }
          return list;
        }
      }
    } catch {
      // If first attempt failed (e.g. server booting up), wait briefly and retry once
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
    }
  }

  // Graceful fallback to cached emails or empty list
  const cached = getLocalEmailCache();
  return cached;
}

/**
 * Service function to trigger a mock email notification
 */
export async function triggerMockEmail(
  payload: TriggerMockEmailPayload,
  token?: string
): Promise<MockEmailNotification | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/notifications/mock-emails/trigger', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || '';
      let errorMsg = 'Failed to dispatch mock email notification';
      if (contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        errorMsg = errorData.error || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const data = await res.json();
    const created = data.email || data;
    if (created && created._id) {
      const current = getLocalEmailCache();
      setLocalEmailCache([created, ...current.filter((e) => e._id !== created._id)]);
    }
    return created;
  } catch (err) {
    console.warn('Could not dispatch mock email remotely, proceeding locally:', err);
    return null;
  }
}

/**
 * Convenience service function: Trigger a mock course enrollment notification
 */
export async function triggerCourseEnrollmentMockEmail(
  student: { _id?: string; name: string; fullName?: string; email: string; idNumber: string },
  course: { _id?: string; code: string; title: string; level?: number; credits?: number; facilitatorName?: string },
  token?: string
): Promise<MockEmailNotification | null> {
  return triggerMockEmail(
    {
      to: student.email,
      recipientName: student.fullName || student.name,
      recipientIdNumber: student.idNumber,
      studentId: student._id || student.idNumber,
      category: 'course_enrollment',
      subject: `🎓 [StartSmart Tech Hub] Course Enrollment Confirmed: ${course.code} - ${course.title}`,
      metadata: {
        courseId: course._id,
        courseCode: course.code,
        courseTitle: course.title,
        courseLevel: course.level || 100,
        credits: course.credits || 3,
        facilitatorName: course.facilitatorName || 'Engr. Sarah Jenkins',
      },
    },
    token
  );
}

/**
 * Convenience service function: Trigger a mock certificate awarded notification
 */
export async function triggerCertificateMockEmail(
  student: { _id?: string; name: string; fullName?: string; email: string; idNumber: string },
  course: { _id?: string; code: string; title: string },
  certDetails: { certificateId: string; grade?: string; score?: number; facilitatorName?: string; issuedAt?: string },
  token?: string
): Promise<MockEmailNotification | null> {
  return triggerMockEmail(
    {
      to: student.email,
      recipientName: student.fullName || student.name,
      recipientIdNumber: student.idNumber,
      studentId: student._id || student.idNumber,
      category: 'certificate_awarded',
      subject: `🏆 [Official Award] Verified Digital Certificate Issued - ${course.code} (${certDetails.certificateId})`,
      metadata: {
        courseId: course._id,
        courseCode: course.code,
        courseTitle: course.title,
        certificateId: certDetails.certificateId,
        grade: certDetails.grade || 'A',
        score: certDetails.score !== undefined ? certDetails.score : 92,
        facilitatorName: certDetails.facilitatorName || 'Engr. Sarah Jenkins',
        issuedAt: certDetails.issuedAt || new Date().toISOString(),
      },
    },
    token
  );
}

/**
 * Mark an email as read
 */
export async function markMockEmailRead(emailId: string, token?: string): Promise<boolean> {
  try {
    const current = getLocalEmailCache();
    setLocalEmailCache(current.map((e) => (e._id === emailId ? { ...e, read: true } : e)));

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/notifications/mock-emails/${emailId}/read`, {
      method: 'PATCH',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Delete a mock email
 */
export async function deleteMockEmail(emailId: string, token?: string): Promise<boolean> {
  try {
    const current = getLocalEmailCache();
    setLocalEmailCache(current.filter((e) => e._id !== emailId));

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/notifications/mock-emails/${emailId}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}
