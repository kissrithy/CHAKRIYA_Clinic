const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL Pool Connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'chakriya_clinic'
});

// Auto initialize tables on server start
async function initTables() {
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sqlSchema);
      console.log('✅ PostgreSQL Tables initialized successfully!');
    }
  } catch (err) {
    console.warn('⚠️ Note: Database auto-init waiting for valid credentials:', err.message);
  }
}
initTables();

// --- API ROUTES ---

// 1. Health & Database Status
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'online', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'online', database: 'disconnected', error: err.message });
  }
});

// 2. Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Patients API
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    const formatted = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      dob: p.dob,
      phone: p.phone,
      email: p.email,
      bloodType: p.blood_type,
      address: p.address,
      allergies: p.allergies,
      createdAt: p.created_at ? p.created_at.toISOString().split('T')[0] : ''
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, gender, age, dob, phone, email, bloodType, address, allergies } = req.body;
    
    // Generate Patient ID
    const countRes = await pool.query('SELECT COUNT(*) FROM patients');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const newId = 'PAT-' + (1000 + nextNum);

    const insertQuery = `
      INSERT INTO patients (id, name, gender, age, dob, phone, email, blood_type, address, allergies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      newId, name, gender, age, dob || null, phone, email || 'N/A', bloodType || 'O+', address || 'N/A', allergies || 'None'
    ]);

    const p = result.rows[0];
    res.status(201).json({
      id: p.id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      dob: p.dob,
      phone: p.phone,
      email: p.email,
      bloodType: p.blood_type,
      address: p.address,
      allergies: p.allergies
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    res.json({ message: `Patient ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Appointments API
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
    const formatted = result.rows.map(a => ({
      id: a.id,
      patientId: a.patient_id,
      patientName: a.patient_name,
      doctorId: a.doctor_id,
      doctorName: a.doctor_name,
      specialty: a.specialty,
      date: a.appointment_date ? a.appointment_date.toISOString().split('T')[0] : '',
      time: a.appointment_time,
      reason: a.reason,
      status: a.status
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, specialty, date, time, reason, status } = req.body;
    
    const countRes = await pool.query('SELECT COUNT(*) FROM appointments');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const newId = 'APT-' + (5000 + nextNum);

    const query = `
      INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, specialty, appointment_date, appointment_time, reason, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      newId, patientId, patientName, doctorId, doctorName, specialty, date, time, reason, status || 'Confirmed'
    ]);

    const a = result.rows[0];
    res.status(201).json({
      id: a.id,
      patientId: a.patient_id,
      patientName: a.patient_name,
      doctorId: a.doctor_id,
      doctorName: a.doctor_name,
      specialty: a.specialty,
      date: a.appointment_date,
      time: a.appointment_time,
      reason: a.reason,
      status: a.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: `Appointment ${id} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    res.json({ message: `Appointment ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Medical Records API
app.get('/api/records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records ORDER BY created_at DESC');
    const formatted = result.rows.map(r => ({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      date: r.record_date ? r.record_date.toISOString().split('T')[0] : '',
      vitals: {
        bp: r.bp,
        temp: r.temp,
        heartRate: r.heart_rate,
        weight: r.weight
      },
      diagnosis: r.diagnosis,
      treatment: r.treatment,
      medications: r.medications || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, vitals, diagnosis, treatment, medications } = req.body;

    const countRes = await pool.query('SELECT COUNT(*) FROM medical_records');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const newId = 'REC-' + (3000 + nextNum);

    const query = `
      INSERT INTO medical_records (id, patient_id, patient_name, doctor_id, doctor_name, bp, temp, heart_rate, weight, diagnosis, treatment, medications)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      newId, patientId, patientName, doctorId, doctorName,
      vitals?.bp || 'N/A', vitals?.temp || 'N/A', vitals?.heartRate || 'N/A', vitals?.weight || 'N/A',
      diagnosis, treatment || 'Standard Care', JSON.stringify(medications || [])
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Invoices API
app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    const formatted = result.rows.map(i => ({
      id: i.id,
      patientId: i.patient_id,
      patientName: i.patient_name,
      date: i.invoice_date ? i.invoice_date.toISOString().split('T')[0] : '',
      items: i.items || [],
      subtotal: parseFloat(i.subtotal),
      discount: parseFloat(i.discount),
      total: parseFloat(i.total),
      paymentStatus: i.payment_status,
      paymentMethod: i.payment_method
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { patientId, patientName, items, subtotal, discount, total, paymentStatus, paymentMethod } = req.body;

    const countRes = await pool.query('SELECT COUNT(*) FROM invoices');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const newId = 'INV-' + (8000 + nextNum);

    const query = `
      INSERT INTO invoices (id, patient_id, patient_name, items, subtotal, discount, total, payment_status, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      newId, patientId, patientName, JSON.stringify(items || []), subtotal, discount || 0, total, paymentStatus || 'Pending', paymentMethod || 'Cash'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, method } = req.body;
    await pool.query('UPDATE invoices SET payment_status = $1, payment_method = COALESCE($2, payment_method) WHERE id = $3', [status, method, id]);
    res.json({ message: `Invoice ${id} payment updated` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🏥 CHAKRIYA Clinic PostgreSQL Backend Server running at http://localhost:${PORT}`);
});
