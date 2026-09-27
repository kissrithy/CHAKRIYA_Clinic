-- CHAKRIYA Clinic System - PostgreSQL Schema

-- Create Database if not exists (Execute manually or via init script)
-- CREATE DATABASE chakriya_clinic;

-- 1. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  room VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  age INTEGER NOT NULL,
  dob DATE,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  blood_type VARCHAR(10),
  address TEXT,
  allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(100) NOT NULL,
  doctor_id VARCHAR(20) REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(100) NOT NULL,
  doctor_id VARCHAR(20) REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name VARCHAR(100) NOT NULL,
  record_date DATE DEFAULT CURRENT_DATE,
  bp VARCHAR(20),
  temp VARCHAR(20),
  heart_rate VARCHAR(20),
  weight VARCHAR(20),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  medications JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(100) NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'Pending',
  payment_method VARCHAR(50) DEFAULT 'Cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Doctors Table if empty
INSERT INTO doctors (id, name, specialty, phone, room) VALUES
('DOC01', 'Dr. Chakriya Samreth', 'General Physician', '+855 12 345 678', 'Cabinet 101'),
('DOC02', 'Dr. Sarah Jenkins', 'Pediatrics', '+855 16 888 999', 'Cabinet 102'),
('DOC03', 'Dr. Alex Vance', 'Cardiology', '+855 77 222 333', 'Cabinet 201'),
('DOC04', 'Dr. Sophea Nguon', 'Dentistry', '+855 92 555 444', 'Cabinet 105')
ON CONFLICT (id) DO NOTHING;
