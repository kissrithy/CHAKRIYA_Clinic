/**
 * CHAKRIYA Clinic System - Core Application JS
 * Supports PostgreSQL 18 Backend API (http://localhost:5000/api) with LocalStorage sync & fallback.
 */

const API_BASE_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  PATIENTS: 'chakriya_patients',
  APPOINTMENTS: 'chakriya_appointments',
  RECORDS: 'chakriya_records',
  INVOICES: 'chakriya_invoices',
  DOCTORS: 'chakriya_doctors'
};

const INITIAL_DOCTORS = [
  { id: 'DOC01', name: 'Dr. Chakriya Samreth', specialty: 'General Physician', phone: '+855 12 345 678', room: 'Cabinet 101' },
  { id: 'DOC02', name: 'Dr. Sarah Jenkins', specialty: 'Pediatrics', phone: '+855 16 888 999', room: 'Cabinet 102' },
  { id: 'DOC03', name: 'Dr. Alex Vance', specialty: 'Cardiology', phone: '+855 77 222 333', room: 'Cabinet 201' },
  { id: 'DOC04', name: 'Dr. Sophea Nguon', specialty: 'Dentistry', phone: '+855 92 555 444', room: 'Cabinet 105' }
];

class ClinicApp {
  constructor() {
    this.isBackendOnline = false;
    this.initStorage();
    this.checkBackendHealth();
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.database === 'connected') {
          this.isBackendOnline = true;
          console.log('✅ Connected to PostgreSQL 18 Backend!');
          await this.syncFromBackend();
          return;
        }
      }
    } catch (e) {
      console.log('ℹ️ Operating in Browser Storage mode. Backend offline or initializing.');
    }
    this.isBackendOnline = false;
  }

  async syncFromBackend() {
    try {
      const [patients, appointments, records, invoices, doctors] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`).then(r => r.json()),
        fetch(`${API_BASE_URL}/appointments`).then(r => r.json()),
        fetch(`${API_BASE_URL}/records`).then(r => r.json()),
        fetch(`${API_BASE_URL}/invoices`).then(r => r.json()),
        fetch(`${API_BASE_URL}/doctors`).then(r => r.json())
      ]);

      if (Array.isArray(patients)) this.savePatients(patients);
      if (Array.isArray(appointments)) this.saveAppointments(appointments);
      if (Array.isArray(records)) this.saveRecords(records);
      if (Array.isArray(invoices)) this.saveInvoices(invoices);
      if (Array.isArray(doctors) && doctors.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
      }
    } catch (err) {
      console.error('Error syncing from PostgreSQL backend:', err);
    }
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    }
  }

  clearAllData() {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
  }

  // Getters
  getPatients() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS)) || [];
  }

  getAppointments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
  }

  getDoctors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS)) || INITIAL_DOCTORS;
  }

  getRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
  }

  getInvoices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES)) || [];
  }

  // Save Helpers
  savePatients(patients) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  saveRecords(records) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }

  saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  // Patient CRUD
  addPatient(patientData) {
    const patients = this.getPatients();
    const newId = 'PAT-' + (1000 + patients.length + 1);
    const newPatient = {
      id: newId,
      ...patientData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    patients.unshift(newPatient);
    this.savePatients(patients);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      }).catch(err => console.error('PostgreSQL Patient save error:', err));
    }

    return newPatient;
  }

  deletePatient(id) {
    let patients = this.getPatients();
    patients = patients.filter(p => p.id !== id);
    this.savePatients(patients);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' })
        .catch(err => console.error('PostgreSQL Patient delete error:', err));
    }
  }

  // Appointment CRUD
  addAppointment(aptData) {
    const appointments = this.getAppointments();
    const newId = 'APT-' + (5000 + appointments.length + 1);
    const newApt = {
      id: newId,
      ...aptData,
      status: aptData.status || 'Confirmed'
    };
    appointments.unshift(newApt);
    this.saveAppointments(appointments);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptData)
      }).catch(err => console.error('PostgreSQL Appointment save error:', err));
    }

    return newApt;
  }

  updateAppointmentStatus(id, newStatus) {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      this.saveAppointments(appointments);
    }

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(err => console.error('PostgreSQL Appointment status error:', err));
    }
  }

  deleteAppointment(id) {
    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    this.saveAppointments(appointments);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' })
        .catch(err => console.error('PostgreSQL Appointment delete error:', err));
    }
  }

  // Medical Record & Invoice CRUD
  addRecord(recordData) {
    const records = this.getRecords();
    const newId = 'REC-' + (3000 + records.length + 1);
    const newRecord = {
      id: newId,
      ...recordData,
      date: new Date().toISOString().split('T')[0]
    };
    records.unshift(newRecord);
    this.saveRecords(records);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      }).catch(err => console.error('PostgreSQL Record save error:', err));
    }

    return newRecord;
  }

  addInvoice(invoiceData) {
    const invoices = this.getInvoices();
    const newId = 'INV-' + (8000 + invoices.length + 1);
    const newInvoice = {
      id: newId,
      ...invoiceData,
      date: new Date().toISOString().split('T')[0]
    };
    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      }).catch(err => console.error('PostgreSQL Invoice save error:', err));
    }

    return newInvoice;
  }

  updateInvoicePayment(id, status, method) {
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      inv.paymentStatus = status;
      if (method) inv.paymentMethod = method;
      this.saveInvoices(invoices);
    }

    if (this.isBackendOnline) {
      fetch(`${API_BASE_URL}/invoices/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, method })
      }).catch(err => console.error('PostgreSQL Invoice payment error:', err));
    }
  }
}

const clinicApp = new ClinicApp();

// Helper UI Toast Notification
function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i> <span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function triggerClearData() {
  if (confirm('Are you sure you want to clear all data and reset system records?')) {
    clinicApp.clearAllData();
    showToast('All system data cleared successfully!', 'error');
    setTimeout(() => location.reload(), 800);
  }
}
