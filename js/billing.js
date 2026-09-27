/**
 * CHAKRIYA Clinic System - Medical Records & Billing Logic (billing.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();
  renderRecordsTable();
  renderInvoicesTable();

  // Check URL Params for pre-selected Patient ID
  const urlParams = new URLSearchParams(window.location.search);
  const paramPatientId = urlParams.get('patientId');
  if (paramPatientId) {
    const rSelect = document.getElementById('recPatientSelect');
    const iSelect = document.getElementById('invPatientSelect');
    if (rSelect) rSelect.value = paramPatientId;
    if (iSelect) iSelect.value = paramPatientId;
  }

  // Medical Record Form Submission
  const recForm = document.getElementById('recordForm');
  if (recForm) {
    recForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientId = document.getElementById('recPatientSelect').value;
      const patient = clinicApp.getPatients().find(p => p.id === patientId);
      const doctorId = document.getElementById('recDoctorSelect').value;
      const doctor = clinicApp.getDoctors().find(d => d.id === doctorId);

      const medText = document.getElementById('recMeds').value;
      const medsArray = medText ? [{ name: medText, dose: '', frequency: '', duration: '' }] : [];

      const newRecord = {
        patientId: patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        doctorId: doctorId,
        doctorName: doctor ? doctor.name : 'Unknown Doctor',
        vitals: {
          bp: document.getElementById('recBp').value || 'N/A',
          temp: document.getElementById('recTemp').value || 'N/A',
          heartRate: document.getElementById('recHr').value || 'N/A',
          weight: document.getElementById('recWeight').value || 'N/A'
        },
        diagnosis: document.getElementById('recDiagnosis').value,
        treatment: document.getElementById('recTreatment').value || 'Standard Care',
        medications: medsArray
      };

      clinicApp.addRecord(newRecord);
      showToast('Medical Record created successfully!');
      closeModal('addRecordModal');
      recForm.reset();
      renderRecordsTable();
    });
  }

  // Invoice Form Submission
  const invForm = document.getElementById('invoiceForm');
  if (invForm) {
    invForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientId = document.getElementById('invPatientSelect').value;
      const patient = clinicApp.getPatients().find(p => p.id === patientId);

      const consultFee = parseFloat(document.getElementById('invConsultFee').value) || 0;
      const medsFee = parseFloat(document.getElementById('invMedsFee').value) || 0;
      const labFee = parseFloat(document.getElementById('invLabFee').value) || 0;

      const items = [
        { description: 'Doctor Consultation & Examination', cost: consultFee },
        { description: 'Pharmacy & Prescribed Medication', cost: medsFee }
      ];
      if (labFee > 0) {
        items.push({ description: 'Laboratory Diagnostic Test', cost: labFee });
      }

      const total = consultFee + medsFee + labFee;

      const newInv = {
        patientId: patientId,
        patientName: patient ? patient.name : 'Unknown Patient',
        items: items,
        subtotal: total,
        discount: 0.00,
        total: total,
        paymentStatus: document.getElementById('invPaymentStatus').value,
        paymentMethod: document.getElementById('invPaymentMethod').value
      };

      const created = clinicApp.addInvoice(newInv);
      showToast(`Invoice ${created.id} generated!`);
      closeModal('createInvoiceModal');
      invForm.reset();
      renderInvoicesTable();
      viewInvoiceReceipt(created.id);
    });
  }
});

function switchBillingTab(tab) {
  const btnRecords = document.getElementById('tabBtnRecords');
  const btnInvoices = document.getElementById('tabBtnInvoices');
  const secRecords = document.getElementById('sectionRecords');
  const secInvoices = document.getElementById('sectionInvoices');

  if (tab === 'records') {
    btnRecords.style.borderBottomColor = 'var(--primary)';
    btnRecords.style.color = 'var(--primary)';
    btnRecords.style.fontWeight = '700';

    btnInvoices.style.borderBottomColor = 'transparent';
    btnInvoices.style.color = 'var(--text-muted)';
    btnInvoices.style.fontWeight = '600';

    secRecords.style.display = 'block';
    secInvoices.style.display = 'none';
  } else {
    btnInvoices.style.borderBottomColor = 'var(--primary)';
    btnInvoices.style.color = 'var(--primary)';
    btnInvoices.style.fontWeight = '700';

    btnRecords.style.borderBottomColor = 'transparent';
    btnRecords.style.color = 'var(--text-muted)';
    btnRecords.style.fontWeight = '600';

    secInvoices.style.display = 'block';
    secRecords.style.display = 'none';
  }
}

function renderRecordsTable() {
  const tbody = document.getElementById('recordsTableBody');
  if (!tbody) return;

  const records = clinicApp.getRecords();
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No medical records documented yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr>
      <td style="font-weight: 700; color: var(--primary);">${r.id}</td>
      <td>${r.date}</td>
      <td>
        <div style="font-weight: 600; color: var(--dark);">${r.patientName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${r.patientId}</div>
      </td>
      <td>${r.doctorName}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">
        BP: <strong>${r.vitals?.bp || 'N/A'}</strong> | Temp: <strong>${r.vitals?.temp || 'N/A'}</strong>
      </td>
      <td style="font-weight: 600; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${r.diagnosis}
      </td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" title="Print Prescription / Record" onclick="viewMedicalRecordSummary('${r.id}')">
            <i class="fas fa-file-medical-alt" style="color: var(--primary);"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;

  const invoices = clinicApp.getInvoices();
  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No invoices created yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const isPaid = inv.paymentStatus === 'Paid';
    return `
      <tr>
        <td style="font-weight: 700; color: var(--primary);">${inv.id}</td>
        <td>${inv.date}</td>
        <td>
          <div style="font-weight: 600; color: var(--dark);">${inv.patientName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${inv.patientId}</div>
        </td>
        <td style="font-weight: 700; font-size: 0.95rem;">$${(inv.total || 0).toFixed(2)}</td>
        <td>${inv.paymentMethod || 'Cash'}</td>
        <td>
          <span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${inv.paymentStatus}</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="icon-btn" title="View & Print Invoice Receipt" onclick="viewInvoiceReceipt('${inv.id}')">
              <i class="fas fa-receipt" style="color: var(--primary);"></i>
            </button>
            ${!isPaid ? `
              <button class="icon-btn" title="Mark as Paid" onclick="markPaid('${inv.id}')">
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function markPaid(id) {
  clinicApp.updateInvoicePayment(id, 'Paid');
  showToast(`Invoice ${id} marked as Paid!`);
  renderInvoicesTable();
}

function viewInvoiceReceipt(id) {
  const inv = clinicApp.getInvoices().find(i => i.id === id);
  if (!inv) return;

  const body = document.getElementById('invoiceReceiptBody');
  if (!body) return;

  body.innerHTML = `
    <div class="invoice-box">
      <div class="invoice-header">
        <div>
          <h2 style="color: var(--primary); font-size: 1.4rem;"><i class="fas fa-heartbeat"></i> CHAKRIYA CLINIC</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Healthcare Excellence Center</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Phnom Penh, Cambodia | Tel: +855 12 345 678</p>
        </div>
        <div style="text-align: right;">
          <h3 style="font-size: 1.1rem; color: var(--dark);">INVOICE</h3>
          <p style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">${inv.id}</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Date: ${inv.date}</p>
        </div>
      </div>

      <div class="invoice-details">
        <div>
          <strong>Billed To:</strong>
          <div>${inv.patientName} (${inv.patientId})</div>
        </div>
        <div style="text-align: right;">
          <strong>Payment Status:</strong>
          <div><span class="badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${inv.paymentStatus}</span> (${inv.paymentMethod})</div>
        </div>
      </div>

      <table class="table" style="margin-bottom: 1rem;">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: right; font-weight: 600;">$${item.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 1.1rem; font-weight: 700; color: var(--dark); padding-top: 0.75rem; border-top: 2px solid var(--border);">
        Total Amount: <span style="color: var(--primary);">$${(inv.total || 0).toFixed(2)}</span>
      </div>
    </div>
  `;

  openModal('printInvoiceModal');
}

function viewMedicalRecordSummary(id) {
  const record = clinicApp.getRecords().find(r => r.id === id);
  if (!record) return;

  const body = document.getElementById('invoiceReceiptBody');
  if (!body) return;

  body.innerHTML = `
    <div class="invoice-box">
      <div class="invoice-header">
        <div>
          <h2 style="color: var(--primary); font-size: 1.4rem;"><i class="fas fa-heartbeat"></i> CHAKRIYA CLINIC</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Official Medical Summary & Prescription</p>
        </div>
        <div style="text-align: right;">
          <h3 style="font-size: 1.1rem; color: var(--dark);">${record.id}</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Date: ${record.date}</p>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <p><strong>Patient:</strong> ${record.patientName} (${record.patientId})</p>
        <p><strong>Attending Physician:</strong> ${record.doctorName}</p>
        <p><strong>Vitals:</strong> BP: ${record.vitals?.bp} | Temp: ${record.vitals?.temp} | Heart Rate: ${record.vitals?.heartRate}</p>
      </div>

      <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem;">
        <h4 style="color: var(--dark); margin-bottom: 0.4rem;">Diagnosis Notes</h4>
        <p style="font-size: 0.9rem; color: var(--text-main);">${record.diagnosis}</p>
      </div>

      <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius);">
        <h4 style="color: var(--dark); margin-bottom: 0.4rem;">Treatment & Rx</h4>
        <p style="font-size: 0.9rem; color: var(--text-main);">${record.treatment}</p>
      </div>
    </div>
  `;

  openModal('printInvoiceModal');
}

function populateDropdowns() {
  const recPatientSelect = document.getElementById('recPatientSelect');
  const recDoctorSelect = document.getElementById('recDoctorSelect');
  const invPatientSelect = document.getElementById('invPatientSelect');

  const patients = clinicApp.getPatients();
  const doctors = clinicApp.getDoctors();

  if (recPatientSelect) {
    recPatientSelect.innerHTML = patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
  }
  if (invPatientSelect) {
    invPatientSelect.innerHTML = patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
  }
  if (recDoctorSelect) {
    recDoctorSelect.innerHTML = doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialty})</option>`).join('');
  }
}
