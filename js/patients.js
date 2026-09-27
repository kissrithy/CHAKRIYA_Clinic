/**
 * CHAKRIYA Clinic System - Patient Management Logic (patients.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderPatientsTable();

  // Search and Filter Listeners
  const searchInput = document.getElementById('patientSearchInput');
  const bloodFilter = document.getElementById('bloodGroupFilter');

  if (searchInput) searchInput.addEventListener('input', applyPatientFilters);
  if (bloodFilter) bloodFilter.addEventListener('change', applyPatientFilters);

  // Add Patient Form Submit
  const addForm = document.getElementById('addPatientForm');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const dobVal = document.getElementById('pDob').value;
      let calculatedAge = 30;
      if (dobVal) {
        const birthDate = new Date(dobVal);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      const newPatientData = {
        name: document.getElementById('pName').value,
        phone: document.getElementById('pPhone').value,
        gender: document.getElementById('pGender').value,
        dob: dobVal,
        age: calculatedAge,
        bloodType: document.getElementById('pBloodType').value,
        email: document.getElementById('pEmail').value || 'N/A',
        allergies: document.getElementById('pAllergies').value || 'None',
        address: document.getElementById('pAddress').value || 'N/A'
      };

      const created = clinicApp.addPatient(newPatientData);
      showToast(`Patient ${created.name} registered successfully!`);
      closeModal('addPatientModal');
      addForm.reset();
      renderPatientsTable();
    });
  }
});

function renderPatientsTable(filteredList = null) {
  const tbody = document.getElementById('patientsTableBody');
  const totalBadge = document.getElementById('totalPatientsBadge');
  if (!tbody) return;

  const patients = filteredList || clinicApp.getPatients();
  if (totalBadge) totalBadge.textContent = patients.length;

  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No patient records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = patients.map(p => `
    <tr>
      <td style="font-weight: 700; color: var(--primary);">${p.id}</td>
      <td>
        <div style="font-weight: 600; color: var(--dark);">${p.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Reg: ${p.createdAt || '2026-09-01'}</div>
      </td>
      <td>${p.gender}, ${p.age} yrs</td>
      <td>
        <div><i class="fas fa-phone-alt" style="font-size: 0.75rem; color: var(--primary);"></i> ${p.phone}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${p.email}</div>
      </td>
      <td><span class="badge badge-purple">${p.bloodType || 'O+'}</span></td>
      <td style="font-size: 0.85rem; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${p.allergies && p.allergies !== 'None' ? 'color: var(--danger); font-weight: 600;' : ''}">
        ${p.allergies || 'None'}
      </td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="View Patient Profile" onclick="viewPatientDetails('${p.id}')">
            <i class="fas fa-eye" style="color: var(--primary);"></i>
          </button>
          <a href="appointments.html?patientId=${p.id}" class="icon-btn" title="Book Appointment">
            <i class="fas fa-calendar-plus" style="color: var(--secondary);"></i>
          </a>
          <button class="icon-btn delete" title="Delete Patient" onclick="deletePatientRecord('${p.id}', '${p.name}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function applyPatientFilters() {
  const searchTerm = (document.getElementById('patientSearchInput')?.value || '').toLowerCase();
  const selectedBlood = document.getElementById('bloodGroupFilter')?.value || '';

  const allPatients = clinicApp.getPatients();

  const filtered = allPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                          p.id.toLowerCase().includes(searchTerm) ||
                          p.phone.includes(searchTerm);
    const matchesBlood = selectedBlood === '' || p.bloodType === selectedBlood;
    return matchesSearch && matchesBlood;
  });

  renderPatientsTable(filtered);
}

function viewPatientDetails(id) {
  const patient = clinicApp.getPatients().find(p => p.id === id);
  if (!patient) return;

  const records = clinicApp.getRecords().filter(r => r.patientId === id);
  const appointments = clinicApp.getAppointments().filter(a => a.patientId === id);

  const container = document.getElementById('patientDetailContent');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; align-items: center; background: var(--bg-main); padding: 1.25rem; border-radius: var(--radius-lg);">
      <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
        ${patient.name.charAt(0)}
      </div>
      <div>
        <h2 style="font-size: 1.25rem; color: var(--dark);">${patient.name} (${patient.id})</h2>
        <p style="font-size: 0.875rem; color: var(--text-muted);">${patient.gender}, ${patient.age} years old • DOB: ${patient.dob}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
          <i class="fas fa-phone-alt"></i> ${patient.phone} | <i class="fas fa-envelope"></i> ${patient.email}
        </p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
      <div style="background: white; border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius);">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">BLOOD GROUP</span>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${patient.bloodType}</div>
      </div>
      <div style="background: white; border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius);">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ALLERGIES</span>
        <div style="font-size: 0.95rem; font-weight: 600; color: ${patient.allergies !== 'None' ? 'var(--danger)' : 'var(--dark)'};">${patient.allergies}</div>
      </div>
      <div style="background: white; border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius);">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">VISITS COUNT</span>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--secondary);">${appointments.length} Visits</div>
      </div>
    </div>

    <h4 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--dark);"><i class="fas fa-notes-medical" style="color: var(--primary);"></i> Recent Medical Diagnosis</h4>
    ${records.length > 0 ? records.map(r => `
      <div style="background: white; border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius); margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem;">
          <span>Date: ${r.date}</span>
          <span>Doctor: ${r.doctorName}</span>
        </div>
        <div style="font-weight: 600; color: var(--dark);">${r.diagnosis}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">Treatment: ${r.treatment}</div>
      </div>
    `).join('') : '<p style="font-size: 0.85rem; color: var(--text-muted);">No recorded diagnosis history.</p>'}
  `;

  openModal('viewPatientModal');
}

function deletePatientRecord(id, name) {
  if (confirm(`Are you sure you want to remove patient "${name}" (${id})?`)) {
    clinicApp.deletePatient(id);
    showToast(`Patient ${name} deleted successfully`, 'error');
    renderPatientsTable();
  }
}
