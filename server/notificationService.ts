/**
 * StartSmart Tech Hub - Mock Email Notification Service
 *
 * Provides institutional email notification dispatch for students upon:
 *  1. Course Enrollment (Self-enrollment, Admin enrollment, or Admissions Auto-enrollment)
 *  2. Official Certificate Issuance (Facilitator Sign-off or Student Certificate Minting)
 *
 * Stores mock emails in the localStore and provides an authenticated API for
 * students and administrators to inspect their official digital email receipts.
 */

export interface MockEmailNotification {
  _id: string;
  to: string;
  recipientName: string;
  recipientIdNumber: string;
  studentId: string;
  from: string;
  subject: string;
  previewText: string;
  bodyText: string;
  bodyHtml: string;
  category: 'course_enrollment' | 'certificate_awarded' | 'admission_approved' | 'system';
  metadata?: {
    courseId?: string;
    courseCode?: string;
    courseTitle?: string;
    courseLevel?: number;
    credits?: number;
    certificateId?: string;
    grade?: string;
    score?: number;
    issuedAt?: string;
    facilitatorName?: string;
  };
  sentAt: string;
  status: 'delivered' | 'pending';
  read: boolean;
}

export interface TriggerEmailParams {
  to: string;
  recipientName: string;
  recipientIdNumber: string;
  studentId: string;
  category: 'course_enrollment' | 'certificate_awarded' | 'admission_approved' | 'system';
  subject: string;
  previewText: string;
  bodyText: string;
  bodyHtml: string;
  metadata?: Record<string, any>;
  from?: string;
}

// In-memory persistent email storage
const mockEmailStore: MockEmailNotification[] = [
  {
    _id: 'mail_seed_001',
    to: 'chinedu.okafor@startsmart.tech',
    recipientName: 'Chinedu Okafor',
    recipientIdNumber: 'SST-2026-004',
    studentId: 'usr_student_001',
    from: 'StartSmart Academic Registrar <registrar@startsmart.tech>',
    subject: '🎓 [StartSmart Tech Hub] Course Enrollment Confirmed: SST 101 - Introduction to Computer Systems & Digital Productivity',
    previewText: 'Welcome to SST 101! Your enrollment has been confirmed by the Academic Office for Level 100.',
    category: 'course_enrollment',
    metadata: {
      courseId: 'crs_101',
      courseCode: 'SST 101',
      courseTitle: 'Introduction to Computer Systems & Digital Productivity',
      courseLevel: 100,
      credits: 3,
      facilitatorName: 'Engr. Sarah Jenkins',
    },
    bodyText: `Dear Chinedu Okafor (ID: SST-2026-004),

We are pleased to inform you that your official enrollment in SST 101: Introduction to Computer Systems & Digital Productivity has been confirmed for the 2025/2026 Academic Term.

Course Details:
• Course Code: SST 101
• Title: Introduction to Computer Systems & Digital Productivity
• Academic Level: Level 100 (Foundation Track)
• Credit Units: 3.0 Credits
• Facilitator: Engr. Sarah Jenkins (SST-FAC-001)

Please log into your StartSmart Student Portal at https://startsmart.tech to review the course syllabus, download initial lecture notes, and connect with your cohort.

Sincerely,
Office of the Registrar & Academic Technologies
StartSmart Tech Hub, Lagos & Global Campus`,
    bodyHtml: generateCourseEnrollmentHtml({
      recipientName: 'Chinedu Okafor',
      recipientIdNumber: 'SST-2026-004',
      courseCode: 'SST 101',
      courseTitle: 'Introduction to Computer Systems & Digital Productivity',
      courseLevel: 100,
      credits: 3,
      facilitatorName: 'Engr. Sarah Jenkins',
      enrollmentDate: '2025-01-15T09:00:00.000Z',
    }),
    sentAt: '2025-01-15T09:00:00.000Z',
    status: 'delivered',
    read: true,
  },
  {
    _id: 'mail_seed_002',
    to: 'chinedu.okafor@startsmart.tech',
    recipientName: 'Chinedu Okafor',
    recipientIdNumber: 'SST-2026-004',
    studentId: 'usr_student_001',
    from: 'StartSmart Credentials & Awards Office <awards@startsmart.tech>',
    subject: '🏆 [Award Notification] Verified Digital Certificate Issued - SST 101',
    previewText: 'Congratulations! Your official certificate of completion for SST 101 (CERT-SST-SST101-STU-001) has been minted.',
    category: 'certificate_awarded',
    metadata: {
      courseId: 'crs_101',
      courseCode: 'SST 101',
      courseTitle: 'Introduction to Computer Systems & Digital Productivity',
      certificateId: 'CERT-SST-SST101-STU-001',
      grade: 'A',
      score: 94,
      issuedAt: '2025-02-28T14:30:00.000Z',
      facilitatorName: 'Engr. Sarah Jenkins',
    },
    bodyText: `Dear Chinedu Okafor (ID: SST-2026-004),

Hearty congratulations from StartSmart Tech Hub! You have successfully completed SST 101: Introduction to Computer Systems & Digital Productivity with an outstanding academic record.

Certificate Summary:
• Certificate ID: CERT-SST-SST101-STU-001
• Final Grade: Grade A (94% Academic Standing)
• Sign-Off Status: Dual-Endorsed (Executive Director & Lead Facilitator)
• Digital Verification: https://startsmart.tech/verify/CERT-SST-SST101-STU-001

Your official signed certificate is ready for download and verification in your student portal.

With warm regards,
Board of Academic Standards & Certifications
StartSmart Tech Hub`,
    bodyHtml: generateCertificateAwardedHtml({
      recipientName: 'Chinedu Okafor',
      recipientIdNumber: 'SST-2026-004',
      courseCode: 'SST 101',
      courseTitle: 'Introduction to Computer Systems & Digital Productivity',
      certificateId: 'CERT-SST-SST101-STU-001',
      grade: 'A',
      score: 94,
      facilitatorName: 'Engr. Sarah Jenkins',
      issuedDate: '2025-02-28T14:30:00.000Z',
    }),
    sentAt: '2025-02-28T14:30:00.000Z',
    status: 'delivered',
    read: false,
  },
];

/**
 * Core Service Function to trigger a mock email notification
 */
export async function triggerMockEmailNotification(params: TriggerEmailParams): Promise<MockEmailNotification> {
  const newEmail: MockEmailNotification = {
    _id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to: params.to,
    recipientName: params.recipientName,
    recipientIdNumber: params.recipientIdNumber,
    studentId: params.studentId,
    from: params.from || 'StartSmart Tech Hub <notifications@startsmart.tech>',
    subject: params.subject,
    previewText: params.previewText,
    bodyText: params.bodyText,
    bodyHtml: params.bodyHtml,
    category: params.category,
    metadata: params.metadata,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    read: false,
  };

  // Prepend to in-memory store so newest emails appear first
  mockEmailStore.unshift(newEmail);

  // Log mock dispatch output for terminal audit & developer inspection
  console.log(`\n======================================================`);
  console.log(`[MOCK EMAIL SERVICE] ✉️ NOTIFICATION DISPATCHED`);
  console.log(`To:       ${newEmail.recipientName} <${newEmail.to}> (${newEmail.recipientIdNumber})`);
  console.log(`From:     ${newEmail.from}`);
  console.log(`Category: ${newEmail.category.toUpperCase()}`);
  console.log(`Subject:  ${newEmail.subject}`);
  console.log(`Sent At:  ${newEmail.sentAt}`);
  console.log(`Status:   MOCK DELIVERED (250 OK)`);
  console.log(`======================================================\n`);

  return newEmail;
}

/**
 * Service function to trigger email specifically when a student is enrolled in a new course
 */
export async function triggerCourseEnrollmentEmail(
  student: any,
  course: any,
  options: { source?: string; enrolledAt?: string } = {}
): Promise<MockEmailNotification> {
  const studentName = student.fullName || student.name || 'Enrolled Student';
  const studentEmail = student.email || `${(studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@startsmart.tech`;
  const studentIdNumber = student.idNumber || 'SST-STD-001';
  const studentId = student._id?.toString() || student.id || studentIdNumber;

  const courseCode = course.code || 'SST 100';
  const courseTitle = course.title || 'Tech Hub Academic Course';
  const courseLevel = course.level || 100;
  const credits = course.credits || 3;
  const facilitatorName = course.facilitatorName || 'Engr. Sarah Jenkins';
  const enrollmentDate = options.enrolledAt || new Date().toISOString();

  const subject = `🎓 [StartSmart Tech Hub] Course Enrollment Confirmed: ${courseCode} - ${courseTitle}`;
  const previewText = `Welcome to ${courseCode}! Your enrollment has been confirmed for Level ${courseLevel}.`;

  const bodyText = `Dear ${studentName} (ID: ${studentIdNumber}),

We are pleased to confirm your enrollment in ${courseCode}: ${courseTitle} at StartSmart Tech Hub.

Academic Course Details:
• Course Code: ${courseCode}
• Course Title: ${courseTitle}
• Academic Level: Level ${courseLevel}
• Credits: ${credits} Units
• Lead Facilitator: ${facilitatorName}
• Enrollment Date: ${new Date(enrollmentDate).toLocaleDateString()}
${options.source ? `• Registration Type: ${options.source}` : ''}

Next Steps:
1. Log into your StartSmart workspace at https://startsmart.tech.
2. Review the syllabus, lecture recordings, and lab assignments.
3. Check the Course Announcements for upcoming live sessions.

Warm regards,
Office of the Registrar
StartSmart Tech Hub, Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH`;

  const bodyHtml = generateCourseEnrollmentHtml({
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    courseCode,
    courseTitle,
    courseLevel,
    credits,
    facilitatorName,
    enrollmentDate,
    source: options.source,
  });

  return triggerMockEmailNotification({
    to: studentEmail,
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    studentId,
    category: 'course_enrollment',
    subject,
    previewText,
    bodyText,
    bodyHtml,
    from: 'StartSmart Academic Office <registrar@startsmart.tech>',
    metadata: {
      courseId: course._id?.toString() || course.id,
      courseCode,
      courseTitle,
      courseLevel,
      credits,
      facilitatorName,
      enrollmentDate,
    },
  });
}

/**
 * Service function to trigger email specifically when a student receives an official certificate
 */
export async function triggerCertificateAwardedEmail(
  student: any,
  course: any,
  certDetails: {
    certificateId: string;
    grade?: string;
    score?: number;
    issuedAt?: string;
    facilitatorName?: string;
  },
  options: { source?: string } = {}
): Promise<MockEmailNotification> {
  const studentName = student.fullName || student.name || 'Honored Graduate';
  const studentEmail = student.email || `${(studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@startsmart.tech`;
  const studentIdNumber = student.idNumber || 'SST-STD-001';
  const studentId = student._id?.toString() || student.id || studentIdNumber;

  const courseCode = course.code || 'SST 100';
  const courseTitle = course.title || 'Tech Hub Academic Course';
  const certId = certDetails.certificateId || `CERT-SST-${courseCode.replace(/\s+/g, '')}-${studentIdNumber}`;
  const grade = certDetails.grade || 'A';
  const score = certDetails.score !== undefined ? certDetails.score : 92;
  const issuedDate = certDetails.issuedAt || new Date().toISOString();
  const facilitatorName = certDetails.facilitatorName || course.facilitatorName || 'Engr. Sarah Jenkins';

  const subject = `🏆 [Official Award] Verified Digital Certificate Issued - ${courseCode} (${certId})`;
  const previewText = `Congratulations ${studentName}! Your official certificate for ${courseCode} has been minted and signed.`;

  const bodyText = `Dear ${studentName} (ID: ${studentIdNumber}),

Congratulations on successfully completing ${courseCode}: ${courseTitle}!

Your official digital certificate of achievement has been endorsed and minted into our institutional registry.

Official Award Summary:
• Certificate ID: ${certId}
• Academic Program: ${courseCode} - ${courseTitle}
• Final Grade: Grade ${grade} (${score}%)
• Lead Facilitator: ${facilitatorName}
• Issue Date: ${new Date(issuedDate).toLocaleDateString()}
• Online Verification: https://startsmart.tech/verify/${certId}

You can view, print, or download your high-resolution certificate directly from your StartSmart student workspace.

Congratulations on this academic milestone!

Board of Academic Standards & Executive Directorate
StartSmart Tech Hub`;

  const bodyHtml = generateCertificateAwardedHtml({
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    courseCode,
    courseTitle,
    certificateId: certId,
    grade,
    score,
    facilitatorName,
    issuedDate,
  });

  return triggerMockEmailNotification({
    to: studentEmail,
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    studentId,
    category: 'certificate_awarded',
    subject,
    previewText,
    bodyText,
    bodyHtml,
    from: 'StartSmart Awards & Certifications <credentials@startsmart.tech>',
    metadata: {
      courseId: course._id?.toString() || course.id,
      courseCode,
      courseTitle,
      certificateId: certId,
      grade,
      score,
      issuedAt: issuedDate,
      facilitatorName,
    },
  });
}

/**
 * Service function to dispatch official admission letter and login credentials dossier
 */
export async function triggerAdmissionLetterEmail(
  student: any,
  letterData: any,
  settings: any
): Promise<MockEmailNotification> {
  const studentName = letterData.studentName || student.fullName || student.name || 'Admitted Student Scholar';
  const studentEmail = letterData.studentEmail || student.email || 'student@startsmart.tech';
  const studentIdNumber = letterData.studentId || student.idNumber || 'SST-STD-001';
  const studentId = student._id?.toString() || student.id || studentIdNumber;

  const programTitle = letterData.programTitle || student.programTrack || 'Applied Information Technology Diploma';
  const programLevel = letterData.programLevel || student.programLevel || 100;
  const tempPassword = letterData.tempPassword || 'StartSmart2026!';
  const tempPin = letterData.tempPin || '72914';
  const portalUrl = letterData.portalUrl || settings?.websiteUrl || 'https://portal.startsmart.tech';
  const letterRef = letterData.letterNumber || `SST/REG/ADM/2026/F-${studentIdNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '0042'}`;
  const formalDate = 'September 13, 2026';

  const subject = `📜 [StartSmart Tech Hub] Official Offer of Provisional Admission & Login Credentials Dossier (Ref: ${letterRef})`;
  const previewText = `Dear Student Scholar, your official admission letter and Student Portal Login Dossier (Date: ${formalDate}) are enclosed.`;

  const bodyText = `Dear Student Scholar (${studentName}),

On behalf of the Academic Council and the Office of the Academic Registrar of StartSmart Tech Hub, we are honored to confer upon you our official offer of PROVISIONAL ADMISSION into Level ${programLevel}: ${programTitle} for the 2026/2027 Academic Session.

OFFICIAL STUDENT PORTAL CREDENTIALS DOSSIER:
======================================================================
Confidential.
Portal URL: ${portalUrl}
Username / Student ID: ${studentIdNumber}

Default Temporary Password: ${tempPassword}
(Mandatory password update required upon first login.)

Dual-Factor 5-Digit Security PIN: ${tempPin}
(Second-factor PIN for terminal unlocking & ID verification.)
======================================================================

ATTESTED & CONFERRED BY:

Mr. Seidu Mahamadu
Chief Executive Officer (CEO) & Academic Administrator
StartSmart Tech Hub
Date: ${formalDate}

Prof. Seidu Mahamadu
Lead Facilitator & Academic Dean
Office of Academic Affairs
Date: ${formalDate}

Central Academic Seal • Republic of Ghana • StartSmart Tech Hub`;

  const bodyHtml = generateAdmissionLetterHtml({
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    studentEmail,
    programTitle,
    programLevel,
    tempPassword,
    tempPin,
    portalUrl,
    letterRef,
    formalDate,
  });

  return triggerMockEmailNotification({
    to: studentEmail,
    recipientName: studentName,
    recipientIdNumber: studentIdNumber,
    studentId,
    category: 'admission_approved',
    subject,
    previewText,
    bodyText,
    bodyHtml,
    from: 'StartSmart Academic Admissions <admissions@startsmart.tech>',
    metadata: {
      letterNumber: letterRef,
      programTitle,
      programLevel,
      issuedAt: formalDate,
      portalUrl,
    },
  });
}

/**
 * Retrieves mock emails filtered by user or admin privileges
 */
export function getMockEmails(filter: { userId?: string; userEmail?: string; role?: string }): MockEmailNotification[] {
  if (filter.role === 'admin') {
    return [...mockEmailStore];
  }

  return mockEmailStore.filter((m) => {
    const matchesId = filter.userId && (m.studentId === filter.userId || m.recipientIdNumber === filter.userId);
    const matchesEmail = filter.userEmail && m.to.toLowerCase() === filter.userEmail.toLowerCase();
    return matchesId || matchesEmail;
  });
}

/**
 * Mark a mock email as read
 */
export function markMockEmailAsRead(emailId: string): boolean {
  const email = mockEmailStore.find((e) => e._id === emailId);
  if (email) {
    email.read = true;
    return true;
  }
  return false;
}

/**
 * Delete a mock email from store
 */
export function deleteMockEmail(emailId: string): boolean {
  const idx = mockEmailStore.findIndex((e) => e._id === emailId);
  if (idx !== -1) {
    mockEmailStore.splice(idx, 1);
    return true;
  }
  return false;
}

// ============================================================================
// Institutional HTML Email Template Builders (50% Green, 30% White, 10% Gold, 10% Blue)
// ============================================================================

function generateCourseEnrollmentHtml(data: {
  recipientName: string;
  recipientIdNumber: string;
  courseCode: string;
  courseTitle: string;
  courseLevel: number;
  credits: number;
  facilitatorName: string;
  enrollmentDate: string;
  source?: string;
}): string {
  const dateFormatted = new Date(data.enrollmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Enrollment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8faf9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card: White Canvas (30%) with Crisp Borders -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.08);">
          
          <!-- Top Institutional Header: Dominant Green (50%) -->
          <tr>
            <td style="background-color: #059669; padding: 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24;">
                      Academic Registrar Notification
                    </div>
                    <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      StartSmart Tech Hub LMS
                    </h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; font-size: 11px; color: #ffffff; font-family: monospace; font-weight: 700;">
                      ${data.recipientIdNumber}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold & Blue Accent Strip: 10% Gold + 10% Blue -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #f59e0b 0%, #0284c7 100%);"></td>
          </tr>

          <!-- Body Content: Crisp White & Slate -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Dear <strong style="color: #0f172a;">${data.recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Your official enrollment in <strong style="color: #059669;">${data.courseCode}</strong> has been approved and recorded into the institutional directory. You are formally authorized to access all course syllabus materials, live workshops, and assignments.
              </p>

              <!-- Course Info Highlight Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; margin: 20px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #047857; letter-spacing: 1px; margin-bottom: 8px;">
                      Course Registration Overview
                    </div>
                    <div style="font-size: 18px; font-weight: 800; color: #064e3b; margin-bottom: 12px;">
                      ${data.courseCode}: ${data.courseTitle}
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #1e293b;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 140px;">Academic Level:</td>
                        <td style="padding: 4px 0; font-weight: 600;">Level ${data.courseLevel} (Foundation)</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Credit Load:</td>
                        <td style="padding: 4px 0; font-weight: 600;">${data.credits}.0 Academic Credits</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Lead Facilitator:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #059669;">${data.facilitatorName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Effective Date:</td>
                        <td style="padding: 4px 0; font-weight: 600;">${dateFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Steps for Student -->
              <div style="margin: 24px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                <strong style="color: #0f172a; display: block; margin-bottom: 8px;">Next Steps for Immediate Orientation:</strong>
                <ol style="margin: 0; padding-left: 20px; color: #334155;">
                  <li style="margin-bottom: 6px;">Sign in to your StartSmart Student Portal using your Student ID (<span style="font-family: monospace; font-weight: 700; color: #0284c7;">${data.recipientIdNumber}</span>).</li>
                  <li style="margin-bottom: 6px;">Review the weekly syllabus breakdown and required tools.</li>
                  <li style="margin-bottom: 6px;">Submit practical deliverables on time for facilitator assessment and dual-certified graduation.</li>
                </ol>
              </div>

              <!-- Action Button: Dominant Green -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #059669;">
                    <a href="https://startsmart.tech" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Access Course in StartSmart LMS &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Official Institutional Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; font-size: 11px; line-height: 1.5; color: #64748b; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #0f172a;">StartSmart Tech Hub • Institutional LMS</div>
                    <div>Africa, Ghana, Tamale Northern Region, Post Office Box SSTH23 CEO OF SSTH</div>
                    <div style="margin-top: 4px;">Direct Helpdesk: <a href="mailto:support@startsmart.tech" style="color: #0284c7; text-decoration: none;">support@startsmart.tech</a></div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 4px 8px; background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; border-radius: 6px; font-weight: 700; font-size: 10px;">
                      OFFICIAL NOTICE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateCertificateAwardedHtml(data: {
  recipientName: string;
  recipientIdNumber: string;
  courseCode: string;
  courseTitle: string;
  certificateId: string;
  grade: string;
  score: number;
  facilitatorName: string;
  issuedDate: string;
}): string {
  const dateFormatted = new Date(data.issuedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Certificate Award</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8faf9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8faf9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card: White Canvas (30%) with Gold & Green Trim -->
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.12);">
          
          <!-- Top Header: Deep Green with Gold Banner (50% Green + 10% Gold) -->
          <tr>
            <td style="background-color: #047857; padding: 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 10px; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                      ★ Official Academic Credential
                    </div>
                    <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Certificate of Academic Completion
                    </h1>
                  </td>
                  <td align="right">
                    <div style="font-size: 32px;">🏆</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold Accent Ribbon -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #0284c7 100%);"></td>
          </tr>

          <!-- Body Content: Crisp White & Slate -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Dear <strong style="color: #0f172a;">${data.recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                The Board of Academic Governance and Faculty of StartSmart Tech Hub take immense pride in confirming that you have successfully satisfied all requirements for <strong style="color: #047857;">${data.courseCode}: ${data.courseTitle}</strong>.
              </p>

              <!-- Certificate Credential Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 2px solid #fde68a; border-radius: 16px; margin: 20px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400e; letter-spacing: 1.5px; margin-bottom: 6px;">
                      Verified Digital Credential
                    </div>
                    <div style="font-size: 16px; font-family: monospace; font-weight: 700; color: #0284c7; margin-bottom: 16px;">
                      ${data.certificateId}
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #fef3c7; padding-top: 16px;">
                      <tr>
                        <td align="center" style="padding: 4px 12px;">
                          <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 700;">Final Grade</div>
                          <div style="font-size: 22px; font-weight: 900; color: #047857;">${data.grade} (${data.score}%)</div>
                        </td>
                        <td align="center" style="padding: 4px 12px; border-left: 1px solid #fde68a; border-right: 1px solid #fde68a;">
                          <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 700;">Sign-Off</div>
                          <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Dual Verified</div>
                        </td>
                        <td align="center" style="padding: 4px 12px;">
                          <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 700;">Issued On</div>
                          <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${new Date(data.issuedDate).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                This certificate carries official cryptographic seal verification, verifiable worldwide through our public verification ledger using your unique certificate code.
              </p>

              <!-- Dual Action Buttons: Green View + Blue Verify -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td style="border-radius: 12px; background-color: #059669; padding-right: 12px;">
                    <a href="https://startsmart.tech" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      View in Student Portal &rarr;
                    </a>
                  </td>
                  <td style="border-radius: 12px; background-color: #0284c7;">
                    <a href="https://startsmart.tech/verify/${data.certificateId}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Verify Credential &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; font-size: 11px; line-height: 1.5; color: #64748b; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #0f172a;">StartSmart Tech Hub • Office of Academic Standards</div>
                    <div>Principal: Mr. Seidu Mahamadu • Lead Instructor: ${data.facilitatorName}</div>
                    <div style="margin-top: 4px;">Verification registry: <span style="color: #0284c7; font-family: monospace;">registry.startsmart.tech</span></div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 4px 8px; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 6px; font-weight: 700; font-size: 10px;">
                      SEALED &amp; RECORDED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateAdmissionLetterHtml(data: {
  recipientName: string;
  recipientIdNumber: string;
  studentEmail: string;
  programTitle: string;
  programLevel: number;
  tempPassword: string;
  tempPin: string;
  portalUrl: string;
  letterRef: string;
  formalDate: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Admission Letter - StartSmart Tech Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="640" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0284c7; padding: 32px 36px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #bae6fd;">Republic of Ghana • Technical Higher Education</div>
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">StartSmart Tech Hub</div>
                    <div style="font-size: 13px; color: #e0f2fe; margin-top: 4px;">Directorate of Academic Admissions &amp; Registry • Office of the Academic Registrar</div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 6px 12px; background-color: #ffffff; color: #0284c7; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase;">OFFICIAL ADMISSION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata Ribbon -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 12px 36px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td><strong>Reference:</strong> ${data.letterRef}</td>
                  <td align="center"><strong>Date:</strong> ${data.formalDate}</td>
                  <td align="right"><strong>Matriculation ID:</strong> <span style="font-family: monospace; color: #0284c7; font-weight: 700;">${data.recipientIdNumber}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                Dear Student Scholar,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
                On behalf of the Academic Council and the Office of the Academic Registrar of <strong>StartSmart Tech Hub</strong>, we have the distinct honor to convey to you our official offer of <strong>PROVISIONAL ADMISSION</strong> into the <strong>Level ${data.programLevel}: ${data.programTitle}</strong> program for the 2026/2027 Academic Session.
              </p>

              <!-- Credentials Dossier Box -->
              <div style="background-color: #f8fafc; border: 2px solid #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
                  <tr>
                    <td>
                      <span style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">Official Student Portal Credentials Dossier</span>
                    </td>
                    <td align="right">
                      <span style="background-color: #0f172a; color: #ffffff; padding: 3px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 4px;">Confidential.</span>
                    </td>
                  </tr>
                </table>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                  <tr>
                    <td style="padding: 8px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Official Student Portal</div>
                      <div style="font-size: 13px; font-weight: 700; color: #0284c7; font-family: monospace; margin-top: 2px;">${data.portalUrl}</div>
                    </td>
                  </tr>
                </table>

                <table width="100%" border="0" cellspacing="0" cellpadding="6">
                  <tr>
                    <td width="50%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; vertical-align: top;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Username / Matriculation Number</div>
                      <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 4px;">${data.recipientIdNumber}</div>
                    </td>
                    <td width="50%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; vertical-align: top;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Default Temporary Password</div>
                      <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #166534; margin-top: 4px;">${data.tempPassword}</div>
                      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Mandatory password update required upon first login.</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; vertical-align: top;">
                      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Dual-Factor 5-Digit Security PIN</div>
                      <div style="font-size: 16px; font-weight: 800; font-family: monospace; color: #581c87; letter-spacing: 2px; margin-top: 4px;">${data.tempPin}</div>
                      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Second-factor PIN for terminal unlocking &amp; ID verification.</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Signatories -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; border-top: 2px solid #0f172a; padding-top: 20px;">
                <tr>
                  <td width="45%" style="vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Mr. Seidu Mahamadu</div>
                    <div style="font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px;">Chief Executive Officer (CEO) &amp; Administrator</div>
                    <div style="font-size: 10px; color: #64748b; font-style: italic;">Office of the Chief Executive</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Date: ${data.formalDate}</div>
                  </td>
                  <td width="10%" align="center" style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 800; color: #0284c7;">[SEAL]</div>
                  </td>
                  <td width="45%" align="right" style="vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Prof. Seidu Mahamadu</div>
                    <div style="font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px;">Lead Facilitator &amp; Academic Dean</div>
                    <div style="font-size: 10px; color: #64748b; font-style: italic;">Office of Academic Affairs</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Date: ${data.formalDate}</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; font-size: 11px; color: #64748b; text-align: center;">
              StartSmart Tech Hub • Tamale Northern Region, Ghana • Official Academic Board Document
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
