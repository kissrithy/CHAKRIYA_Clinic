/**
 * CHAKRIYA Clinic System - Core Application JS
 * Manages central state, localStorage persistence, and helper functions.
 */

const STORAGE_KEYS = {
  PATIENTS: 'chakriya_patients',
  APPOINTMENTS: 'chakriya_appointments',
  RECORDS: 'chakriya_records',
  INVOICES: 'chakriya_invoices',
  DOCTORS: 'chakriya_doctors'
};

// Available Doctors in CHAKRIYA Clinic
const INITIAL_DOCTORS = [
  { id: 'DOC01', name: 'Dr. Chakriya Samreth', specialty: 'General Physician', phone: '+855 12 345 678', room: 'Cabinet 101' },
  { id: 'DOC02', name: 'Dr. Sarah Jenkins', specialty: 'Pediatrics', phone: '+855 16 888 999', room: 'Cabinet 102' },
  { id: 'DOC03', name: 'Dr. Alex Vance', specialty: 'Cardiology', phone: '+855 77 222 333', room: 'Cabinet 201' },
  { id: 'DOC04', name: 'Dr. Sophea Nguon', specialty: 'Dentistry', phone: '+855 92 555 444', room: 'Cabinet 105' }
];

// Clean Slate Initial Data (No dummy/hardcoded patient records)
const INITIAL_PATIENTS = [];
const INITIAL_APPOINTMENTS = [];
const INITIAL_RECORDS = [];
const INITIAL_INVOICES = [];

// Clinic System App State Controller
class ClinicApp {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    }
  }

  // Clear all saved data completely from LocalStorage
  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    
    // Re-initialize empty storage
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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS)) || [];
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
    return newPatient;
  }

  deletePatient(id) {
    let patients = this.getPatients();
    patients = patients.filter(p => p.id !== id);
    this.savePatients(patients);
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
    return newApt;
  }

  updateAppointmentStatus(id, newStatus) {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      this.saveAppointments(appointments);
    }
  }

  deleteAppointment(id) {
    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    this.saveAppointments(appointments);
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
  }
}

const clinicApp = new ClinicApp();

// Automatically perform hard clear on application boot if requested
clinicApp.clearAllData();

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

// Global Modal Toggle Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function triggerClearData() {
  if (confirm('Are you sure you want to clear all hard data and reset system records?')) {
    clinicApp.clearAllData();
    showToast('All system data cleared successfully!', 'error');
    setTimeout(() => location.reload(), 800);
  }
}
