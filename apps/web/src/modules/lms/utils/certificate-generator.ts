import { Assignment, Course } from '../types';

export interface CertificateData {
  assignmentId: string;
  courseName: string;
  learnerName: string;
  completionDate: Date;
  score?: number;
  instructorName?: string;
  organizationName?: string;
  certificateId?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type: 'completion' | 'achievement' | 'participation';
  layout: 'landscape' | 'portrait';
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  logoUrl?: string;
  signatureUrl?: string;
  customFields?: Array<{
    key: string;
    label: string;
    value: string;
    position: { x: number; y: number };
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    alignment: 'left' | 'center' | 'right';
  }>;
}

export class CertificateGenerator {
  private static readonly DEFAULT_TEMPLATE: CertificateTemplate = {
    id: 'default',
    name: 'Default Certificate',
    type: 'completion',
    layout: 'landscape',
    backgroundColor: '#ffffff',
    borderColor: '#d4af37',
    textColor: '#333333',
    customFields: [
      {
        key: 'title',
        label: 'Certificate Title',
        value: 'Certificate of Completion',
        position: { x: 50, y: 25 },
        fontSize: 32,
        fontWeight: 'bold',
        alignment: 'center'
      },
      {
        key: 'learner_name',
        label: 'Learner Name',
        value: '{learner_name}',
        position: { x: 50, y: 45 },
        fontSize: 24,
        fontWeight: 'normal',
        alignment: 'center'
      },
      {
        key: 'completion_text',
        label: 'Completion Text',
        value: 'has successfully completed the course',
        position: { x: 50, y: 55 },
        fontSize: 16,
        fontWeight: 'normal',
        alignment: 'center'
      },
      {
        key: 'course_name',
        label: 'Course Name',
        value: '{course_name}',
        position: { x: 50, y: 65 },
        fontSize: 20,
        fontWeight: 'bold',
        alignment: 'center'
      },
      {
        key: 'completion_date',
        label: 'Completion Date',
        value: '{completion_date}',
        position: { x: 50, y: 75 },
        fontSize: 14,
        fontWeight: 'normal',
        alignment: 'center'
      }
    ]
  };

  /**
   * Generate a certificate as HTML string
   */
  static generateHTML(
    data: CertificateData,
    template: CertificateTemplate = this.DEFAULT_TEMPLATE
  ): string {
    const variables = this.prepareVariables(data);
    const processedFields = this.processTemplateFields(template.customFields || [], variables);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate - ${data.courseName}</title>
        <style>
          @page {
            size: ${template.layout === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
            margin: 0;
          }

          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 0;
            background-color: ${template.backgroundColor};
            color: ${template.textColor};
            width: ${template.layout === 'landscape' ? '297mm' : '210mm'};
            height: ${template.layout === 'landscape' ? '210mm' : '297mm'};
            position: relative;
            overflow: hidden;
          }

          .certificate-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 8px solid ${template.borderColor};
            border-radius: 10px;
          }

          .certificate-inner-border {
            position: absolute;
            top: 35px;
            left: 35px;
            right: 35px;
            bottom: 35px;
            border: 2px solid ${template.borderColor};
            border-radius: 5px;
          }

          .certificate-content {
            position: absolute;
            top: 50px;
            left: 50px;
            right: 50px;
            bottom: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .logo {
            position: absolute;
            top: 60px;
            left: 60px;
            max-width: 100px;
            max-height: 80px;
          }

          .signature {
            position: absolute;
            bottom: 80px;
            right: 120px;
            max-width: 150px;
            max-height: 60px;
          }

          .signature-line {
            position: absolute;
            bottom: 60px;
            right: 80px;
            width: 200px;
            border-top: 1px solid ${template.textColor};
            text-align: center;
            padding-top: 5px;
            font-size: 12px;
          }

          .certificate-id {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 10px;
            color: #666;
          }

          .qr-code {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            background: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <div class="certificate-border"></div>
        <div class="certificate-inner-border"></div>

        ${template.logoUrl ? `<img src="${template.logoUrl}" alt="Logo" class="logo">` : ''}

        <div class="certificate-content">
          ${this.renderFields(processedFields)}
        </div>

        ${template.signatureUrl ? `
          <img src="${template.signatureUrl}" alt="Signature" class="signature">
          <div class="signature-line">Instructor Signature</div>
        ` : ''}

        ${data.certificateId ? `
          <div class="certificate-id">Certificate ID: ${data.certificateId}</div>
        ` : ''}

        <div class="qr-code">
          QR Code<br>
          (Verify)
        </div>

        <script>
          // Automatically print when loaded (for PDF generation)
          window.onload = function() {
            if (window.location.search.includes('print=true')) {
              window.print();
            }
          };
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Generate certificate URL (would typically be handled by backend)
   */
  static generateCertificateUrl(assignmentId: string): string {
    // In a real implementation, this would:
    // 1. Generate a unique certificate ID
    // 2. Store certificate data in database
    // 3. Return URL to certificate endpoint
    return `/api/certificates/${assignmentId}`;
  }

  /**
   * Validate certificate requirements
   */
  static validateCertificateRequirements(
    assignment: Assignment,
    course: Course,
    passingScore: number = 70
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if assignment is completed
    if (assignment.status !== 'completed') {
      errors.push('Assignment must be completed');
    }

    // Check completion percentage
    if (assignment.progressPct < 100) {
      errors.push('All required lessons must be completed');
    }

    // Check passing score if quiz scores exist
    if (assignment.score !== undefined && assignment.score < passingScore) {
      errors.push(`Minimum score of ${passingScore}% required`);
    }

    // Check if course is active
    if (!course.active) {
      errors.push('Certificate cannot be issued for inactive courses');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create shareable certificate data
   */
  static createShareableData(data: CertificateData): {
    title: string;
    description: string;
    url: string;
    image?: string;
    metadata: Record<string, any>;
  } {
    return {
      title: `Certificate of Completion - ${data.courseName}`,
      description: `${data.learnerName} has successfully completed ${data.courseName}${
        data.score ? ` with a score of ${data.score}%` : ''
      }`,
      url: this.generateCertificateUrl(data.assignmentId),
      metadata: {
        learner: data.learnerName,
        course: data.courseName,
        completionDate: data.completionDate.toISOString(),
        score: data.score,
        certificateId: data.certificateId
      }
    };
  }

  /**
   * Generate certificate verification data
   */
  static generateVerificationData(data: CertificateData): {
    certificateId: string;
    verificationUrl: string;
    qrCodeData: string;
  } {
    const certificateId = data.certificateId || this.generateCertificateId();
    const verificationUrl = `/verify-certificate/${certificateId}`;

    const qrCodeData = JSON.stringify({
      certificateId,
      assignmentId: data.assignmentId,
      learnerName: data.learnerName,
      courseName: data.courseName,
      completionDate: data.completionDate.toISOString(),
      verificationUrl: `${window.location.origin}${verificationUrl}`
    });

    return {
      certificateId,
      verificationUrl,
      qrCodeData
    };
  }

  // Private helper methods

  private static prepareVariables(data: CertificateData): Record<string, string> {
    return {
      learner_name: data.learnerName,
      course_name: data.courseName,
      completion_date: data.completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      score: data.score ? `${data.score}%` : '',
      instructor_name: data.instructorName || '',
      organization_name: data.organizationName || '',
      certificate_id: data.certificateId || this.generateCertificateId()
    };
  }

  private static processTemplateFields(
    fields: CertificateTemplate['customFields'],
    variables: Record<string, string>
  ) {
    return fields?.map(field => ({
      ...field,
      value: this.replaceVariables(field.value, variables)
    })) || [];
  }

  private static replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{([^}]+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private static renderFields(fields: any[]): string {
    return fields.map(field => `
      <div style="
        position: absolute;
        top: ${field.position.y}%;
        left: ${field.position.x}%;
        transform: translateX(-50%);
        font-size: ${field.fontSize}px;
        font-weight: ${field.fontWeight};
        text-align: ${field.alignment};
        white-space: nowrap;
      ">
        ${field.value}
      </div>
    `).join('');
  }

  private static generateCertificateId(): string {
    return 'CERT-' + Date.now().toString(36).toUpperCase() + '-' +
           Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Certificate templates
export const CertificateTemplates = {
  completion: {
    ...CertificateGenerator['DEFAULT_TEMPLATE'],
    type: 'completion' as const,
    name: 'Course Completion Certificate'
  },

  achievement: {
    ...CertificateGenerator['DEFAULT_TEMPLATE'],
    id: 'achievement',
    type: 'achievement' as const,
    name: 'Achievement Certificate',
    borderColor: '#c0392b',
    customFields: [
      {
        key: 'title',
        label: 'Certificate Title',
        value: 'Certificate of Achievement',
        position: { x: 50, y: 25 },
        fontSize: 32,
        fontWeight: 'bold' as const,
        alignment: 'center' as const
      },
      // ... other fields
    ]
  },

  participation: {
    ...CertificateGenerator['DEFAULT_TEMPLATE'],
    id: 'participation',
    type: 'participation' as const,
    name: 'Participation Certificate',
    borderColor: '#2980b9',
    customFields: [
      {
        key: 'title',
        label: 'Certificate Title',
        value: 'Certificate of Participation',
        position: { x: 50, y: 25 },
        fontSize: 32,
        fontWeight: 'bold' as const,
        alignment: 'center' as const
      },
      // ... other fields
    ]
  }
};