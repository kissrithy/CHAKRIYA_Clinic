const fs = require('fs');
const path = require('path');
const docx = require('docx');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

// Helper function to read file content safely
function getFileContent(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  } catch (e) {
    return `[File ${filePath} not found]`;
  }
  return '';
}

// Format code lines into Word doc paragraphs
function createCodeBlockParagraphs(codeText) {
  const lines = codeText.split('\n');
  return lines.map(line => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line.length === 0 ? ' ' : line,
          font: 'Consolas',
          size: 18,
          color: '1E293B'
        })
      ],
      spacing: { line: 240, before: 20, after: 20 }
    });
  });
}

function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { before: 300, after: 120 }
  });
}

function createParagraph(text, bold = false, color = '334155') {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: bold,
        color: color,
        size: 22,
        font: 'Calibri'
      })
    ],
    spacing: { before: 80, after: 80 }
  });
}

function buildDocument() {
  const fileList = [
    { title: '1. index.html (Dashboard Overview Page)', path: 'index.html' },
    { title: '2. patients.html (Patient Management Page)', path: 'patients.html' },
    { title: '3. appointments.html (Appointment Scheduling Page)', path: 'appointments.html' },
    { title: '4. billing.html (Medical Records & Billing Page)', path: 'billing.html' },
    { title: '5. css/styles.css (Primary Stylesheet)', path: 'css/styles.css' },
    { title: '6. js/app.js (Core Application & PostgreSQL Sync Engine)', path: 'js/app.js' },
    { title: '7. js/dashboard.js (Dashboard Logic)', path: 'js/dashboard.js' },
    { title: '8. js/patients.js (Patient Directory Logic)', path: 'js/patients.js' },
    { title: '9. js/appointments.js (Appointment Scheduling Logic)', path: 'js/appointments.js' },
    { title: '10. js/billing.js (Medical Records & Invoice Logic)', path: 'js/billing.js' },
    { title: '11. server.js (Node.js Express REST API Backend)', path: 'server.js' },
    { title: '12. db/schema.sql (PostgreSQL 18 Database Schema)', path: 'db/schema.sql' },
    { title: '13. db/init.js (Automated DB Initializer)', path: 'db/init.js' },
    { title: '14. vercel.json (Vercel Deployment Configuration)', path: 'vercel.json' },
    { title: '15. package.json (Node Dependencies)', path: 'package.json' },
    { title: '16. .env (Database Configuration)', path: '.env' }
  ];

  const children = [];

  // Title Page Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'CHAKRIYA CLINIC SYSTEM',
          bold: true,
          size: 36,
          color: '0D9488',
          font: 'Calibri'
        })
      ],
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Complete Technical Documentation, Step-by-Step Vercel Deployment Guide & Source Code Manual',
          italic: true,
          size: 24,
          color: '64748B',
          font: 'Calibri'
        })
      ],
      spacing: { after: 400 }
    })
  );

  // Section 1: Overview
  children.push(
    createHeading('1. System Overview & Architecture', HeadingLevel.HEADING_1),
    createParagraph('The CHAKRIYA Clinic System is a comprehensive, modern clinic management web application built with a responsive 4-page UI frontend, Node.js + Express REST API backend, and PostgreSQL 18 database persistence.'),
    createParagraph('Core Pages:', true),
    createParagraph('• Dashboard Overview (index.html): Live stats, today\'s appointment queue, recent patients.'),
    createParagraph('• Patient Management (patients.html): Registration, search, blood group filters, medical profiles.'),
    createParagraph('• Appointment Scheduling (appointments.html): Consultation slotting, doctor assignment, status filters.'),
    createParagraph('• Medical Records & Billing (billing.html): Vital signs, diagnosis notes, prescriptions, printable PDF invoices.')
  );

  // Section 2: Step-by-Step Vercel Deployment Guide
  children.push(
    createHeading('2. Step-by-Step Deployment Guide (Vercel & PostgreSQL 18)', HeadingLevel.HEADING_1),
    createParagraph('Step 1: Local Setup & Dependencies', true),
    createParagraph('Run `npm install` in the project directory to install dependencies (express, pg, cors, dotenv).'),
    createParagraph('Step 2: PostgreSQL 18 Configuration', true),
    createParagraph('Set up `.env` with DB_HOST=localhost, DB_PORT=5432, DB_USER=postgres, DB_PASSWORD=1234, DB_NAME=chakriya_clinic. Then run `npm run init-db` to create tables automatically.'),
    createParagraph('Step 3: Push to GitHub', true),
    createParagraph('Run `git add .`, `git commit -m "initial commit"`, and `git push origin main` to push the repository to https://github.com/kissrithy/CHAKRIYA_Clinic.git.'),
    createParagraph('Step 4: Deploying to Vercel (1-Click Import)', true),
    createParagraph('1. Log in to https://vercel.com/dashboard.'),
    createParagraph('2. Click Add New... -> Project -> Import Repository `kissrithy/CHAKRIYA_Clinic`.'),
    createParagraph('3. Add Environment Variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) for production database.'),
    createParagraph('4. Click Deploy. Vercel automatically deploys future pushes on `git push origin main`.')
  );

  // Section 3: Complete Source Code Reference
  children.push(
    createHeading('3. Complete Source Code Reference', HeadingLevel.HEADING_1)
  );

  fileList.forEach(file => {
    children.push(createHeading(file.title, HeadingLevel.HEADING_2));
    const content = getFileContent(file.path);
    const codeParagraphs = createCodeBlockParagraphs(content);
    children.push(...codeParagraphs);
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  return doc;
}

async function generateDocx() {
  console.log('📝 Generating Word Document (.docx)...');
  const doc = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '..', 'CHAKRIYA_Clinic_Documentation_and_Source_Code.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Word Document successfully generated at: ${outputPath}`);
}

generateDocx();
