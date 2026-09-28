# 🏥 CHAKRIYA Clinic System - Complete Step-by-Step Deployment Guide

This document provides a comprehensive, start-to-finish guide for setting up, configuring, running locally, and deploying the **CHAKRIYA Clinic System** to **Vercel** with GitHub integration and PostgreSQL database connectivity.

---

## 📌 Table of Contents
1. [Project Overview & System Architecture](#1-project-overview--system-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Local Project Setup & Structure](#step-1-local-project-setup--structure)
4. [Step 2: PostgreSQL Database Configuration](#step-2-postgresql-database-configuration)
5. [Step 3: GitHub Repository Setup & Push](#step-3-github-repository-setup--push)
6. [Step 4: Deploying to Vercel (2 Methods)](#step-4-deploying-to-vercel-2-methods)
7. [Step 5: Cloud PostgreSQL for Vercel Deployment](#step-5-cloud-postgresql-for-vercel-deployment)
8. [Step 6: Testing & Continuous Deployment (CI/CD)](#step-6-testing--continuous-deployment-cicd)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 1. Project Overview & System Architecture

The **CHAKRIYA Clinic System** is a modern, responsive clinic management web application built with:
- **Frontend Pages (4 Pages)**:
  1. `index.html`: **Dashboard Overview** (KPI Metrics, Today's Queue, Quick Appointments).
  2. `patients.html`: **Patient Management** (Search, Filter, Full Medical Profile & Registration).
  3. `appointments.html`: **Appointment Scheduling** (Slotting, Status Filters, Rescheduling).
  4. `billing.html`: **Medical Records & Billing** (Vitals, Diagnosis, Medication, Printable PDF Invoices).
- **Backend**: Node.js + Express REST API (`server.js`).
- **Database**: PostgreSQL 18 (`chakriya_clinic`).
- **Frontend State Engine**: Hybrid Sync (`js/app.js` automatically talks to PostgreSQL REST API with graceful browser `localStorage` fallback).

---

## 2. Prerequisites

Ensure you have the following installed on your machine before starting:
- **Node.js**: v18 or higher (`node -v`)
- **Git CLI**: Installed & configured (`git --version`)
- **PostgreSQL 18**: Installed locally (`psql --version`)
- **GitHub Account**: Access to [github.com](https://github.com)
- **Vercel Account**: Access to [vercel.com](https://vercel.com)

---

## Step 1: Local Project Setup & Structure

### 1.1 Project Directory Structure
```
d:\Antigravity\Health System\
├── index.html            # Page 1: Dashboard
├── patients.html         # Page 2: Patient Directory
├── appointments.html     # Page 3: Consultations
├── billing.html          # Page 4: Records & Invoicing
├── package.json          # Node dependencies (express, pg, cors, dotenv)
├── server.js             # Express API backend server
├── vercel.json           # Vercel deployment routing config
├── .env                  # Database connection credentials
├── .gitignore            # Excluded files (node_modules, .env)
├── db/
│   ├── schema.sql        # Database schema script
│   └── init.js           # Automated DB initializer
├── css/
│   └── styles.css        # Responsive styling & design system
└── js/
    ├── app.js            # Central API sync & LocalStorage controller
    ├── dashboard.js      # Dashboard page scripts
    ├── patients.js       # Patient management scripts
    ├── appointments.js   # Appointment page scripts
    └── billing.js        # Records & invoice generator scripts
```

### 1.2 Installing Dependencies
In your terminal, run:
```bash
npm install
```

---

## Step 2: PostgreSQL Database Configuration

### 2.1 Environment File (`.env`)
Create a `.env` file in the root directory with your PostgreSQL connection parameters:
```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=chakriya_clinic

# Express Server Port
PORT=5000
```

### 2.2 Initialize Database & Tables
Run the automated initialization script to create the `chakriya_clinic` database and schema tables:
```bash
npm run init-db
```
*Expected Output:*
```
🔌 Connecting to PostgreSQL at localhost:5432...
✅ Connected to PostgreSQL Server!
📦 Database "chakriya_clinic" created successfully!
📜 Applying database tables and schema...
✨ All tables (doctors, patients, appointments, medical_records, invoices) are ready!
🚀 PostgreSQL Database Setup Complete!
```

### 2.3 Starting Local API Server
Start the Express API server locally:
```bash
npm start
```
The server will start at `http://localhost:5000`. Test connection status by navigating to:
`http://localhost:5000/api/health`

---

## Step 3: GitHub Repository Setup & Push

### 3.1 Configure `.gitignore`
Make sure `.gitignore` contains:
```gitignore
node_modules/
.env
*.log
```

### 3.2 Initialize & Push to GitHub
Run the following commands in PowerShell/Terminal:

```bash
# 1. Initialize Git Repository
git init

# 2. Add files to staging
git add .

# 3. Create initial commit
git commit -m "feat: CHAKRIYA Clinic System with PostgreSQL 18 backend"

# 4. Set main branch
git branch -M main

# 5. Add remote origin
git remote add origin https://github.com/kissrithy/CHAKRIYA_Clinic.git

# 6. Push to GitHub
git push -u origin main
```

---

## Step 4: Deploying to Vercel (2 Methods)

### Method A: Deploy via Vercel Dashboard (Recommended - 1 Click)

1. Log in to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** -> **Project**.
3. Under **Import Git Repository**, select **`kissrithy/CHAKRIYA_Clinic`**.
4. Configure Project Settings:
   - **Framework Preset**: Other / Standard HTML
   - **Root Directory**: `./`
5. **Environment Variables**: Add your production database credentials:
   - `DB_HOST`: Your cloud database host (e.g. `ep-xyz.neon.tech`)
   - `DB_PORT`: `5432`
   - `DB_USER`: `postgres`
   - `DB_PASSWORD`: Your password
   - `DB_NAME`: `chakriya_clinic`
6. Click **Deploy**.

---

### Method B: Deploy via Vercel CLI (Command Line)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Authenticate Vercel CLI**:
   ```bash
   vercel login
   ```
   Follow the prompt to authorize via your browser.

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```
   Confirm project root (`./`) and settings when prompted.

---

## Step 5: Cloud PostgreSQL for Vercel Deployment

> ⚠️ **Important Note on Localhost vs. Cloud Databases**:
> `localhost:5432` is only accessible on your local machine. When your app is deployed to Vercel in the cloud, Vercel cannot reach your personal `localhost`.
> To connect your live Vercel deployment to PostgreSQL, use a free Cloud PostgreSQL provider:

### Recommended Free Cloud PostgreSQL Providers:
1. **Neon.tech** ([neon.tech](https://neon.tech)) - Free serverless PostgreSQL.
2. **Supabase** ([supabase.com](https://supabase.com)) - Free managed PostgreSQL database.
3. **Render** ([render.com](https://render.com)) - Free managed PostgreSQL instance.

### Steps to Connect Cloud Database to Vercel:
1. Create a free database instance on **Neon.tech** or **Supabase**.
2. Run `db/schema.sql` on your cloud database query editor.
3. Copy the database connection string or credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
4. Go to **Vercel Project Settings** -> **Environment Variables**.
5. Add the production credentials and click **Redeploy**.

---

## Step 6: Testing & Continuous Deployment (CI/CD)

### Automatic CI/CD Pipeline
Every time you push code updates to GitHub:
```bash
git add .
git commit -m "updates for clinic system"
git push origin main
```
Vercel automatically detects the push, builds the project, and updates your live URL without manual intervention!

---

## Troubleshooting & FAQ

#### Q1: Why does the navbar show `LocalStorage Mode`?
- **Reason**: The frontend could not reach `http://localhost:5000/api/health`.
- **Fix**: Ensure `npm start` or `node server.js` is running in your terminal.

#### Q2: `password authentication failed for user "postgres"`
- **Reason**: Incorrect database password in `.env`.
- **Fix**: Open `.env` and update `DB_PASSWORD` to match your PostgreSQL installation password.

#### Q3: Database tables do not exist?
- **Fix**: Run `npm run init-db` to create tables automatically.

---

## 📜 Summary Checklist

| Step | Action | Status |
|---|---|---|
| 1 | Create project files (4 HTML pages, CSS, JS) | ✅ Completed |
| 2 | Configure PostgreSQL 18 & run `db/init.js` | ✅ Completed |
| 3 | Commit & Push repository to GitHub (`kissrithy/CHAKRIYA_Clinic`) | ✅ Completed |
| 4 | Configure `vercel.json` routing rules | ✅ Completed |
| 5 | Import repository into Vercel Dashboard | Ready for 1-Click |

---

*Documentation maintained for **CHAKRIYA Clinic System** (v1.0)*
