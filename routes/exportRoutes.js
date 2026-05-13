/*
    Export Routes - PDF and Word Document Generation
    Generates properly formatted student profile documents
*/

import express from "express";
import PDFDocument from "pdfkit";
import { isAuthenticated } from "../middleware/auth.js";
import { isCounselor } from "../middleware/counselorAuth.js";
import { User } from "../models/userModel.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Helper function to format date
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Helper function to capitalize text
function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ===== PDF EXPORT ROUTE =====
router.post('/api/export-student-pdf', isAuthenticated, isCounselor, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 30
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${student.name}_Student_Profile.pdf"`);

    // Pipe the document to response
    doc.pipe(res);

    // Header with logo
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.jpg');
    
    // Add header text
    doc.fontSize(14).font('Helvetica-Bold').text('TELL \'N GROW', 50, 30);
    doc.fontSize(12).font('Helvetica-Bold').text('STUDENT INFORMATION RECORD', 50, 50);
    doc.fontSize(10).font('Helvetica').text('Counselor View - Complete Student Profile', 50, 68);

    // Add horizontal line
    doc.moveTo(30, 90).lineTo(565, 90).stroke();

    // Student picture section
    if (student.profilePicture) {
      try {
        const imagePath = path.join(process.cwd(), 'public', student.profilePicture);
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, 470, 30, { width: 70, height: 70 });
        }
      } catch (e) {
        console.log('Could not add student image');
      }
    }

    let yPosition = 120;

    // Function to add section
    function addSection(title, items) {
      yPosition += 15;
      doc.fontSize(11).font('Helvetica-Bold').text(title, 30, yPosition);
      yPosition += 18;
      
      doc.moveTo(30, yPosition - 5).lineTo(565, yPosition - 5).stroke();
      yPosition += 10;

      items.forEach(([label, value]) => {
        if (yPosition > 750) {
          doc.addPage();
          yPosition = 30;
        }

        doc.fontSize(10).font('Helvetica-Bold').text(label + ':', 30, yPosition);
        doc.fontSize(10).font('Helvetica').text(String(value || 'N/A'), 150, yPosition);
        yPosition += 20;
      });
    }

    // Personal Information
    addSection('PERSONAL INFORMATION', [
      ['Name', student.name],
      ['Nickname', student.nickname],
      ['Age', student.age],
      ['Date of Birth', formatDate(student.dateOfBirth)],
      ['Place of Birth', student.placeOfBirth],
      ['Nationality', student.nationality],
      ['Sex', capitalize(student.sex || '')],
      ['Civil Status', student.civilStatus],
      ['Religion', student.religion],
    ]);

    // Contact Information
    addSection('CONTACT INFORMATION', [
      ['Current Address', student.currentAddress],
      ['Permanent Address', student.permanentAddress],
      ['Contact Number', student.contactNumber],
      ['Email', student.email],
    ]);

    // Family Information
    addSection('FAMILY INFORMATION', [
      ['Father\'s Name', student.fatherName],
      ['Father\'s Occupation', student.fatherOccupation],
      ['Mother\'s Name', student.motherName],
      ['Mother\'s Occupation', student.motherOccupation],
    ]);

    // Health Information
    addSection('HEALTH INFORMATION', [
      ['Vision', student.visionDetails],
      ['Hearing', student.hearingDetails],
      ['Health Problems', student.healthProblems],
    ]);

    // Special Information
    addSection('SPECIAL INFORMATION', [
      ['LGBTQIA+ Status', student.lgbtqia_status],
      ['Indigenous Group Member', student.indigenous_status],
      ['Person with Disability', student.disability_status],
    ]);

    // Account Information
    addSection('ACCOUNT INFORMATION', [
      ['User ID', student.id],
      ['Account Status', capitalize(student.status || '')],
      ['Member Since', formatDate(student.createdAt)],
      ['Last Updated', formatDate(student.updatedAt)],
    ]);

    // Footer
    yPosition += 20;
    doc.fontSize(9).font('Helvetica').text('Counselor Access - Confidential Student Information', 30, yPosition, {
      align: 'center',
      width: 535
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// ===== WORD EXPORT ROUTE =====
router.post('/api/export-student-word', isAuthenticated, isCounselor, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    console.log('📄 Word export requested for student:', studentId);
    
    const student = await User.findByPk(studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Helper function to format arrays
    const formatArray = (arr) => {
      if (!arr) return '';
      if (Array.isArray(arr)) return arr.join(', ');
      return arr.toString();
    };

    // Generate simple HTML that Word can handle
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Student Profile</title>
<style>
body { 
  font-family: Arial, sans-serif; 
  font-size: 11pt; 
  margin: 1in; 
  line-height: 1.5;
}
h1 { 
  font-size: 14pt; 
  text-align: center; 
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
}
h2 { 
  font-size: 12pt; 
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  margin-top: 15px;
}
p { margin: 6px 0; }
table { 
  width: 100%; 
  border-collapse: collapse; 
  margin: 10px 0; 
  font-size: 10pt;
}
table td, table th { 
  border: 1px solid #000; 
  padding: 5px;
}
table th { 
  background: #e0e0e0;
}
.label { 
  font-weight: bold;
  display: inline-block;
  width: 140px;
}
</style>
</head>
<body>

<h1>TELL 'N GROW - STUDENT PROFILE</h1>
<p style="text-align: center; color: #666; font-size: 9pt;">Counselor Access | ${new Date().toLocaleDateString()}</p>

<h2>Personal Information</h2>
<p><strong>${student.name || ''}</strong></p>
<p><span class="label">Nickname:</span> ${student.nickname || ''}</p>
<p><span class="label">Age:</span> ${student.age || ''}</p>
<p><span class="label">Date of Birth:</span> ${formatDate(student.dateOfBirth) || ''}</p>
<p><span class="label">Place of Birth:</span> ${student.placeOfBirth || ''}</p>
<p><span class="label">Nationality:</span> ${student.nationality || ''}</p>
<p><span class="label">Sex:</span> ${capitalize(student.sex || '')}</p>
<p><span class="label">Civil Status:</span> ${student.civilStatus || ''}</p>
<p><span class="label">Religion:</span> ${student.religion || ''}</p>

<h2>Contact Information</h2>
<p><span class="label">Current Address:</span> ${student.currentAddress || ''}</p>
<p><span class="label">Permanent Address:</span> ${student.permanentAddress || ''}</p>
<p><span class="label">Contact Number:</span> ${student.contactNumber || ''}</p>
<p><span class="label">Email:</span> ${student.email || ''}</p>
<p><span class="label">Alternate Email:</span> ${student.emailAlternate || ''}</p>

<h2>Academic Information</h2>
<p><span class="label">Course:</span> ${student.course || ''}</p>
<p><span class="label">Year Level:</span> ${student.year || ''}</p>
<p><span class="label">Section:</span> ${student.section || ''}</p>

<h2>Family Information</h2>
<p><span class="label">Father's Name:</span> ${student.fatherName || ''}</p>
<p><span class="label">Father's Occupation:</span> ${student.fatherOccupation || ''}</p>
<p><span class="label">Mother's Name:</span> ${student.motherName || ''}</p>
<p><span class="label">Mother's Occupation:</span> ${student.motherOccupation || ''}</p>
<p><span class="label">Parents Status:</span> ${formatArray(student.parentsStatus) || ''}</p>
<p><span class="label">Family Income:</span> ${formatArray(student.familyIncome) || ''}</p>

<h2>Educational Background</h2>
<table>
  <tr>
    <th>Level</th>
    <th>School</th>
    <th>Dates</th>
    <th>Honors</th>
  </tr>
  <tr>
    <td>Elementary</td>
    <td>${student.elementarySchool || ''}</td>
    <td>${student.elementaryDates || ''}</td>
    <td>${student.elementaryHonors || ''}</td>
  </tr>
  <tr>
    <td>Junior High</td>
    <td>${student.juniorHighSchool || ''}</td>
    <td>${student.juniorDates || ''}</td>
    <td>${student.juniorHonors || ''}</td>
  </tr>
  <tr>
    <td>Senior High</td>
    <td>${student.seniorHighSchool || ''}</td>
    <td>${student.seniorHighDates || ''}</td>
    <td>${student.seniorHighHonors || ''}</td>
  </tr>
  <tr>
    <td>College</td>
    <td>${student.collegeName || ''}</td>
    <td>${student.collegeDates || ''}</td>
    <td>${student.collegeHonors || ''}</td>
  </tr>
</table>

<h2>Emergency Contact</h2>
<p><span class="label">Name:</span> ${student.emergencyContactName || ''}</p>
<p><span class="label">Relationship:</span> ${student.emergencyContactRelation || ''}</p>
<p><span class="label">Contact Number:</span> ${student.emergencyContactNumber || ''}</p>
<p><span class="label">Address:</span> ${student.emergencyContactAddress || ''}</p>
<p><span class="label">Email:</span> ${student.emergencyContactEmail || ''}</p>

<h2>Health Information</h2>
<p><span class="label">Health Concerns:</span> ${formatArray(student.healthConcerns) || ''}</p>
<p><span class="label">Vision:</span> ${student.vision || ''}</p>
<p><span class="label">Hearing:</span> ${student.hearing || ''}</p>
<p><span class="label">Medicines:</span> ${student.medicines || ''}</p>

<h2>Special Information</h2>
<p><span class="label">LGBTQIA+:</span> ${student.lgbtqia || ''}</p>
<p><span class="label">Indigenous Group:</span> ${student.indigenousGroup || ''}</p>
<p><span class="label">Person with Disability:</span> ${student.personWithDisability || ''}</p>

<h2>Account Information</h2>
<p><span class="label">User ID:</span> ${student.id || ''}</p>
<p><span class="label">Member Since:</span> ${formatDate(student.createdAt)}</p>

<div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 8pt;">
  <p>Counselor Access - Confidential Student Information</p>
</div>

</body>
</html>`;

    console.log('✅ HTML generated, size:', htmlContent.length, 'bytes');

    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', `attachment; filename="${student.name.replace(/[^a-z0-9]/gi, '_')}_Profile.doc"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.send(htmlContent);

  } catch (error) {
    console.error('❌ Word Export Error:', error);
    res.status(500).json({ error: 'Failed to generate Word document', details: error.message });
  }
});

export default router;
