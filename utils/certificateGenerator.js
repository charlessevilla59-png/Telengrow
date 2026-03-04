/*
    Certificate Generator for Tellngrow
    Generates PDF certificates for perfect game scores
*/

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateCertificate(data) {
  const { userName, activityName, type, score, maxScore, date } = data;
  
  // Generate unique certificate ID
  const certificateId = generateCertificateId();
  
  return new Promise((resolve, reject) => {
    try {
      // Create certificates directory if it doesn't exist
      const certsDir = path.join(process.cwd(), 'public', 'certificates');
      if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
      }

      const fileName = `certificate_${certificateId}.pdf`;
      const filePath = path.join(certsDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate Design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Border
      doc.lineWidth(10);
      doc.strokeColor('#667eea');
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();

      doc.lineWidth(3);
      doc.strokeColor('#764ba2');
      doc.rect(40, 40, pageWidth - 80, pageHeight - 80).stroke();

      // Title
      doc.fontSize(48)
         .fillColor('#667eea')
         .font('Helvetica-Bold')
         .text('CERTIFICATE', 0, 100, { align: 'center' });

      doc.fontSize(24)
         .fillColor('#764ba2')
         .text('OF ACHIEVEMENT', 0, 160, { align: 'center' });

      // Decorative line
      doc.moveTo(pageWidth / 2 - 150, 200)
         .lineTo(pageWidth / 2 + 150, 200)
         .strokeColor('#667eea')
         .lineWidth(2)
         .stroke();

      // "This is to certify that"
      doc.fontSize(16)
         .fillColor('#333333')
         .font('Helvetica')
         .text('This is to certify that', 0, 240, { align: 'center' });

      // User Name
      doc.fontSize(36)
         .fillColor('#000000')
         .font('Helvetica-Bold')
         .text(userName, 0, 280, { align: 'center' });

      // Achievement text
      doc.fontSize(16)
         .fillColor('#333333')
         .font('Helvetica')
         .text('has successfully achieved a', 0, 340, { align: 'center' });

      // Perfect Score
      doc.fontSize(28)
         .fillColor('#667eea')
         .font('Helvetica-Bold')
         .text('PERFECT SCORE', 0, 375, { align: 'center' });

      // Activity name and type (games only)
      doc.fontSize(18)
         .fillColor('#333333')
         .font('Helvetica')
         .text(`in ${activityName} Game`, 0, 420, { align: 'center' });

      // Score
      doc.fontSize(24)
         .fillColor('#764ba2')
         .font('Helvetica-Bold')
         .text(`Score: ${score}/${maxScore}`, 0, 460, { align: 'center' });

      // Date
      doc.fontSize(14)
         .fillColor('#666666')
         .font('Helvetica')
         .text(`Date: ${new Date(date).toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         })}`, 0, 510, { align: 'center' });

      // Footer
      doc.fontSize(12)
         .fillColor('#999999')
         .text('Tellngrow Mental Wellness Platform', 0, pageHeight - 100, { align: 'center' });

      doc.fontSize(10)
         .text('🌱 Your journey to better mental health', 0, pageHeight - 80, { align: 'center' });

      // Certificate ID
      doc.fontSize(8)
         .fillColor('#cccccc')
         .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 50, { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({
          success: true,
          certificateId,
          fileName,
          filePath,
          url: `/certificates/${fileName}`
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

// Generate unique certificate ID
export function generateCertificateId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `CERT-${timestamp}-${random}`;
}
