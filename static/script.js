document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // DOM elements
    const patientForm = document.getElementById('patientForm');
    const patientTableBody = document.getElementById('patientTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const editForm = document.getElementById('editForm');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const mriSearchInput = document.getElementById('mriSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    // API endpoint
    const API_URL = 'https://' + window.location.host + '/api/patients';
    
    // Current patient ID for editing/deleting
    let currentPatientId = null;
    
    // Store all patients for local filtering
    let allPatients = [];
    
    // Load patients on page load
    loadPatients();
    
    // Event: Form submission for new patient
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientData = {
            mri: document.getElementById('mri').value,
            next_med_count: document.getElementById('medCount').value
        };
        
        createPatient(patientData);
    });
    
    // Event: Refresh button
    refreshBtn.addEventListener('click', function() {
        mriSearchInput.value = ''; // Clear search input
        loadPatients(); // Reload all patients
    });
    
    // Event: Save edit button
    saveEditBtn.addEventListener('click', function() {
        if (!editForm.checkValidity()) {
            editForm.reportValidity();
            return;
        }
        
        const patientData = {
            mri: document.getElementById('editMri').value,
            next_med_count: document.getElementById('editMedCount').value
        };
        
        updatePatient(currentPatientId, patientData);
    });
    
    // Event: Confirm delete button
    confirmDeleteBtn.addEventListener('click', function() {
        deletePatient(currentPatientId);
    });
    
    // Add event listener for search button
    searchBtn.addEventListener('click', function() {
        filterPatientsByMRI();
    });
    
    // Add event listener for Enter key in search input
    mriSearchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterPatientsByMRI();
        }
    });
    
    // Function: Load all patients
    function loadPatients() {
        fetch(API_URL)
            .then(response => response.json())
            .then(patients => {
                allPatients = patients; // Store all patients
                renderPatientTable(patients);
            })
            .catch(error => {
                console.error('Error loading patients:', error);
                showAlert('Error loading patients. Please try again later.', 'danger');
            });
    }
    
    // Function: Create new patient
    function createPatient(patientData) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Failed to create patient'); });
            }
            return response.json();
        })
        .then(data => {
            patientForm.reset();
            loadPatients();
            showAlert('Patient added successfully!', 'success');
        })
        .catch(error => {
            console.error('Error creating patient:', error);
            showAlert(error.message, 'danger');
        });
    }
    
    // Function: Update patient
    function updatePatient(patientId, patientData) {
        fetch(`${API_URL}/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Failed to update patient'); });
            }
            return response.json();
        })
        .then(data => {
            editModal.hide();
            loadPatients();
            showAlert('Patient updated successfully!', 'success');
        })
        .catch(error => {
            console.error('Error updating patient:', error);
            showAlert(error.message, 'danger');
        });
    }
    
    // Function: Delete patient
    function deletePatient(patientId) {
        fetch(`${API_URL}/${patientId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Failed to delete patient'); });
            }
            return response.json();
        })
        .then(data => {
            deleteModal.hide();
            loadPatients();
            showAlert('Patient deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error deleting patient:', error);
            showAlert(error.message, 'danger');
        });
    }
    
    // Function: Render patient table
    function renderPatientTable(patients) {
        patientTableBody.innerHTML = '';
        
        if (patients.length === 0) {
            patientTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">No patients found. Add a new patient above.</td>
                </tr>
            `;
            return;
        }
        
        patients.forEach(patient => {
            const medCountDate = new Date(patient.next_med_count).toISOString().split('T')[0];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${patient.mri}</td>
                <td>${medCountDate}</td>
                <td><span class="${patient.today_flag ? 'true-flag' : 'false-flag'}">${patient.today_flag ? 'TRUE' : 'FALSE'}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${patient.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${patient.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                        </svg>
                    </button>
                </td>
            `;
            
            patientTableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                openEditModal(patientId, patients);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                openDeleteModal(patientId);
            });
        });
    }
    
    // Function: Open edit modal with patient data
    function openEditModal(patientId, patients) {
        const patient = patients.find(p => p.id === parseInt(patientId));
        
        if (patient) {
            document.getElementById('editId').value = patient.id;
            document.getElementById('editMri').value = patient.mri;
            
            // Format date for input
            const date = new Date(patient.next_med_count);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('editMedCount').value = formattedDate;
            
            currentPatientId = patient.id;
            editModal.show();
        }
    }
    
    // Function: Open delete confirmation modal
    function openDeleteModal(patientId) {
        currentPatientId = parseInt(patientId);
        deleteModal.show();
    }
    
    // Function: Show alert message
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
    
    // Add a function to filter patients by MRI
    function filterPatientsByMRI() {
        const searchTerm = mriSearchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            // If search is empty, show all patients
            renderPatientTable(allPatients);
            return;
        }
        
        // Filter patients by MRI
        const filteredPatients = allPatients.filter(patient => 
            patient.mri.toLowerCase().includes(searchTerm)
        );
        
        if (filteredPatients.length === 0) {
            // Show message when no patients match the search
            patientTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">No patients found matching MRI# "${mriSearchInput.value}"</td>
                </tr>
            `;
        } else {
            // Render filtered patients
            renderPatientTable(filteredPatients);
        }
    }
});