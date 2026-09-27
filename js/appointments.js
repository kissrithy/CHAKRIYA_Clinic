/**
 * CHAKRIYA Clinic System - Appointment Scheduling Logic (appointments.js)
 */

let currentFilterStatus = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
  populateModalDropdowns();
  renderAppointmentsTable();

  // Check URL Params for pre-selected Patient ID
  const urlParams = new URLSearchParams(window.location.search);
  const paramPatientId = urlParams.get('patientId');
  if (paramPatientId) {
    const pSelect = document.getElementById('aptModalPatient');
    if (pSelect) pSelect.value = paramPatientId;
    openModal('appointmentModal');
  }

  // Set default date picker to today
  const dateInput = document.getElementById('aptModalDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // Tab Filter Handling
  const tabs = document.querySelectorAll('.apt-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = '';
        t.style.color = '';
      });
      tab.classList.add('active');
      tab.style.background = 'var(--primary)';
      tab.style.color = 'white';
      currentFilterStatus = tab.dataset.status;
      renderAppointmentsTable();
    });
  });

  // Search input filter
  const searchInput = document.getElementById('aptSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderAppointmentsTable());
  }

  // Form Submit
  const form = document.getElementById('appointmentForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const patientId = document.getElementById('aptModalPatient').value;
      const patient = clinicApp.getPatients().find(p => p.id === patientId);

      const doctorId = document.getElementById('aptModalDoctor').value;
      const doctor = clinicApp.getDoctors().find(d => d.id === doctorId);

      const newApt = {
        patientId: patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        doctorId: doctorId,
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        specialty: doctor ? doctor.specialty : 'General',
        date: document.getElementById('aptModalDate').value,
        time: document.getElementById('aptModalTime').value,
        status: document.getElementById('aptModalStatus').value,
        reason: document.getElementById('aptModalReason').value
      };

      clinicApp.addAppointment(newApt);
      showToast('Appointment scheduled successfully!');
      closeModal('appointmentModal');
      form.reset();
      renderAppointmentsTable();
    });
  }
});

function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  const searchVal = (document.getElementById('aptSearchInput')?.value || '').toLowerCase();
  let appointments = clinicApp.getAppointments();

  // Apply Status Filter
  if (currentFilterStatus !== 'ALL') {
    appointments = appointments.filter(a => a.status === currentFilterStatus);
  }

  // Apply Search
  if (searchVal) {
    appointments = appointments.filter(a =>
      a.patientName.toLowerCase().includes(searchVal) ||
      a.doctorName.toLowerCase().includes(searchVal) ||
      a.reason.toLowerCase().includes(searchVal) ||
      a.id.toLowerCase().includes(searchVal)
    );
  }

  if (appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No appointments found for this view.</td></tr>`;
    return;
  }

  tbody.innerHTML = appointments.map(apt => {
    let badgeClass = 'badge-info';
    if (apt.status === 'Completed') badgeClass = 'badge-success';
    if (apt.status === 'In Progress') badgeClass = 'badge-warning';
    if (apt.status === 'Cancelled') badgeClass = 'badge-danger';

    return `
      <tr>
        <td style="font-weight: 700; color: var(--primary);">${apt.id}</td>
        <td>
          <div style="font-weight: 600; color: var(--dark);">${apt.patientName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${apt.patientId}</div>
        </td>
        <td>${apt.doctorName}</td>
        <td><span class="badge badge-purple">${apt.specialty}</span></td>
        <td>
          <div style="font-weight: 600;">${apt.date}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${apt.time}</div>
        </td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${apt.reason}</td>
        <td><span class="badge ${badgeClass}">${apt.status}</span></td>
        <td>
          <div class="action-btns">
            ${apt.status !== 'Completed' ? `
              <button class="icon-btn" title="Mark Completed" onclick="changeStatus('${apt.id}', 'Completed')">
                <i class="fas fa-check-double" style="color: var(--success);"></i>
              </button>
            ` : ''}
            ${apt.status !== 'Cancelled' ? `
              <button class="icon-btn" title="Cancel Appointment" onclick="changeStatus('${apt.id}', 'Cancelled')">
                <i class="fas fa-ban" style="color: var(--danger);"></i>
              </button>
            ` : ''}
            <a href="billing.html?patientId=${apt.patientId}" class="icon-btn" title="Create Medical Record / Invoice">
              <i class="fas fa-notes-medical" style="color: var(--primary);"></i>
            </a>
            <button class="icon-btn delete" title="Delete" onclick="deleteApt('${apt.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function changeStatus(id, newStatus) {
  clinicApp.updateAppointmentStatus(id, newStatus);
  showToast(`Appointment status updated to ${newStatus}`);
  renderAppointmentsTable();
}

function deleteApt(id) {
  if (confirm(`Are you sure you want to cancel & remove appointment ${id}?`)) {
    clinicApp.deleteAppointment(id);
    showToast(`Appointment ${id} removed`, 'error');
    renderAppointmentsTable();
  }
}

function populateModalDropdowns() {
  const pSelect = document.getElementById('aptModalPatient');
  const dSelect = document.getElementById('aptModalDoctor');

  if (pSelect) {
    const patients = clinicApp.getPatients();
    pSelect.innerHTML = patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
  }

  if (dSelect) {
    const doctors = clinicApp.getDoctors();
    dSelect.innerHTML = doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialty})</option>`).join('');
  }
}
