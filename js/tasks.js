/**
 * js/tasks.js - GÖREV YÖNETİM MANTIĞI
 */

async function fetchDetailTasks(customerId) {
    const container = document.getElementById('tab-tasks');
    if(!container) return;

    // Arayüz iskeletini oluştur
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <h6 class="m-0 fw-bold text-dark">Müşteri Görevleri</h6>
            <button class="btn btn-sm btn-primary" onclick="openTaskModal('new')"><i class="fas fa-plus me-1"></i> Yeni Görev</button>
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
                <thead class="table-light small text-uppercase fw-bold">
                    <tr>
                        <th>Tip/Konu</th>
                        <th>Sorumlu</th>
                        <th>Bitiş Tarihi</th>
                        <th>Durum</th>
                        <th class="text-end">İşlem</th>
                    </tr>
                </thead>
                <tbody id="detailTaskBody">
                    <tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>
                </tbody>
            </table>
        </div>`;

    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getTasks", customerId: customerId }) 
        }).then(r => r.json());

        const tbody = document.getElementById('detailTaskBody');
        tbody.innerHTML = "";

        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(t => {
                // Öncelik rengi
                let pColor = t.priority === 'Yüksek' ? 'danger' : (t.priority === 'Orta' ? 'warning' : 'info');
                
                // Tarih formatla
                let dateStr = t.end ? new Date(t.end).toLocaleDateString('tr-TR') : '-';
                
                tbody.innerHTML += `
                    <tr class="small">
                        <td>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-${pColor} p-1 me-2" title="${t.priority} Öncelik"> </span>
                                <div><strong>${t.type}</strong><br><small class="text-muted text-truncate d-inline-block" style="max-width:150px">${t.desc || ''}</small></div>
                            </div>
                        </td>
                        <td>${t.assigned || '-'}</td>
                        <td>${dateStr}</td>
                        <td><span class="badge bg-light text-dark border">${t.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Düzenle" onclick='editTask(${JSON.stringify(t)})'><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteTaskFunc('${t.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        } else { 
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Bu müşteriye ait aktif görev bulunamadı.</td></tr>'; 
        }
    } catch (err) {
        document.getElementById('detailTaskBody').innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Görevler yüklenirken hata oluştu.</td></tr>';
    }
}

function openTaskModal(mode) {
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = "";
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function editTask(t) {
    document.getElementById('taskId').value = t.id;
    document.getElementById('taskType').value = t.type;
    
    // HTML date input için YYYY-MM-DD formatı gerekir
    if(t.start) document.getElementById('taskStart').value = new Date(t.start).toISOString().split('T')[0];
    if(t.end) document.getElementById('taskEnd').value = new Date(t.end).toISOString().split('T')[0];
    
    document.getElementById('taskPriority').value = t.priority;
    document.getElementById('taskStatus').value = t.status;
    document.getElementById('taskAssigned').value = t.assigned;
    document.getElementById('taskDesc').value = t.desc;
    
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

async function saveTaskData() {
    const custId = document.getElementById('dashboardCustId').value;
    const taskObj = {
        id: document.getElementById('taskId').value,
        customerId: custId,
        type: document.getElementById('taskType').value,
        start: document.getElementById('taskStart').value,
        end: document.getElementById('taskEnd').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        assigned: document.getElementById('taskAssigned').value,
        desc: document.getElementById('taskDesc').value
    };

    showLoading();
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ 
                action: "saveTask", 
                taskData: taskObj, 
                currentUser: currentUser 
            }) 
        }).then(r => r.json());

        hideLoading();
        if(res.status === 'success') {
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
            if(modalInstance) modalInstance.hide();
            
            fetchDetailTasks(custId);
            Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire("Hata", res.message, "error");
        }
    } catch (e) {
        hideLoading();
        Swal.fire("Hata", "Bağlantı sorunu oluştu.", "error");
    }
}

async function deleteTaskFunc(taskId, customerId) {
    const r = await Swal.fire({ 
        title: 'Görevi Sil?', 
        text: "Bu görev kaydı kalıcı olarak silinecektir!", 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'Vazgeç'
    });

    if (r.isConfirmed) {
        showLoading();
        try {
            const res = await fetch(API_URL, { 
                method: "POST", 
                body: JSON.stringify({ action: "deleteTask", taskId: taskId }) 
            }).then(r => r.json());
            
            hideLoading();
            if(res.status === 'success') {
                fetchDetailTasks(customerId);
                Swal.fire('Silindi!', res.message, 'success');
            }
        } catch (e) {
            hideLoading();
            Swal.fire('Hata!', 'İşlem başarısız.', 'error');
        }
    }
}
