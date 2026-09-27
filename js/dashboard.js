/**
 * CHAKRIYA Clinic System - Dashboard Logic (dashboard.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderDashboardStats();
  renderTodayAppointments();
  renderRecentPatients();
  populateAppointmentDropdowns();

  // Handle Quick Appointment Form Submission
  const form = document.getElementById('quickAppointmentForm');
  if (form) {
    // Set default date to today
    document.getElementById('aptDate').value = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientId = document.getElementById('aptPatientSelect').value;
      const patient = clinicApp.getPatients().find(p => p.id === patientId);
      const doctorId = document.getElementById('aptDoctorSelect').value;
      const doctor = clinicApp.getDoctors().find(d => d.id === doctorId);

      const newApt = {
        patientId: patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        doctorId: doctorId,
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        specialty: doctor ? doctor.specialty : 'General',
        date: document.getElementById('aptDate').value,
        time: document.getElementById('aptTime').value,
        status: document.getElementById('aptStatus').value,
        reason: document.getElementById('aptReason').value
      };

      clinicApp.addAppointment(newApt);
      closeModal('quickAppointmentModal');
      form.reset();
      showToast('Appointment successfully scheduled!');
      
      // Refresh Dashboard
      renderDashboardStats();
      renderTodayAppointments();
    });
  }

  // Dashboard search filter
  const searchInput = document.getElementById('dashboardSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      filterDashboardAppointments(term);
    });
  }
});

function renderDashboardStats() {
  const patients = clinicApp.getPatients();
  const appointments = clinicApp.getAppointments();
  const doctors = clinicApp.getDoctors();
  const invoices = clinicApp.getInvoices();

  const totalRevenue = invoices
    .filter(inv => inv.paymentStatus === 'Paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  document.getElementById('statPatientsCount').textContent = patients.length;
  document.getElementById('statAppointmentsCount').textContent = appointments.length;
  document.getElementById('statDoctorsCount').textContent = doctors.length;
  document.getElementById('statRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

function renderTodayAppointments(filterTerm = '') {
  const tbody = document.getElementById('dashboardAppointmentTable');
  if (!tbody) return;

  let appointments = clinicApp.getAppointments();
  
  if (filterTerm) {
    appointments = appointments.filter(a => 
      a.patientName.toLowerCase().includes(filterTerm) ||
      a.doctorName.toLowerCase().includes(filterTerm) ||
      a.reason.toLowerCase().includes(filterTerm)
    );
  }

  if (appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No appointments found.</td></tr>`;
    return;
  }

  tbody.innerHTML = appointments.map(apt => {
    let badgeClass = 'badge-info';
    if (apt.status === 'Completed') badgeClass = 'badge-success';
    if (apt.status === 'In Progress') badgeClass = 'badge-warning';
    if (apt.status === 'Cancelled') badgeClass = 'badge-danger';

    return `
      <tr>
        <td style="font-weight: 600;">${apt.time}</td>
        <td>
          <div style="font-weight: 600; color: var(--dark);">${apt.patientName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${apt.patientId}</div>
        </td>
        <td>${apt.doctorName}</td>
        <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${apt.reason}</td>
        <td><span class="badge ${badgeClass}">${apt.status}</span></td>
        <td>
          <div class="action-btns">
            ${apt.status !== 'Completed' ? `
              <button class="icon-btn" title="Mark Completed" onclick="quickUpdateStatus('${apt.id}', 'Completed')">
                <i class="fas fa-check" style="color: var(--success);"></i>
              </button>
            ` : ''}
            <a href="billing.html?patientId=${apt.patientId}" class="icon-btn" title="Create Invoice">
              <i class="fas fa-file-invoice" style="color: var(--primary);"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function quickUpdateStatus(id, status) {
  clinicApp.updateAppointmentStatus(id, status);
  showToast(`Appointment status updated to ${status}`);
  renderDashboardStats();
  renderTodayAppointments();
}

function renderRecentPatients() {
  const listEl = document.getElementById('recentPatientsList');
  if (!listEl) return;

  const patients = clinicApp.getPatients().slice(0, 4);

  listEl.innerHTML = patients.map(p => `
    <li style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
          ${p.name.charAt(0)}
        </div>
        <div>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--dark);">${p.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${p.phone} • Blood: <span style="font-weight: 600; color: var(--primary);">${p.bloodType}</span></div>
        </div>
      </div>
      <a href="patients.html" class="icon-btn" title="View Patient"><i class="fas fa-chevron-right"></i></a>
    </li>
  `).join('');
}

function populateAppointmentDropdowns() {
  const patientSelect = document.getElementById('aptPatientSelect');
  const doctorSelect = document.getElementById('aptDoctorSelect');

  if (patientSelect) {
    const patients = clinicApp.getPatients();
    patientSelect.innerHTML = patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
  }

  if (doctorSelect) {
    const doctors = clinicApp.getDoctors();
    doctorSelect.innerHTML = doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('');
  }
}

function filterDashboardAppointments(term) {
  renderTodayAppointments(term);
}
