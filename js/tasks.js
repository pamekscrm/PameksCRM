/**
 * js/tasks.js - SAAT VE SERBEST METİN DESTEKLİ GÖREV YÖNETİMİ
 */

async function fetchDetailTasks(customerId) {
    const container = document.getElementById('tab-tasks');
    if(!container) return;

    // Arayüz iskeletini oluştur (Header güncellendi)
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <h6 class="m-0 fw-bold text-dark">Görevler</h6>
            <button class="btn btn-sm btn-primary" onclick="openTaskModal('new')"><i class="fas fa-plus me-1"></i> Yeni Görev</button>
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
                <thead class="table-light small text-uppercase fw-bold">
                    <tr>
                        <th>Görev</th>
                        <th>Sorumlu</th>
                        <th>Başlangıç / Bitiş</th>
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
                let pColor = t.priority === 'Yüksek' ? 'danger' : (t.priority === 'Orta' ? 'warning' : 'info');
                
                // Tarih ve Saat formatlama (Örn: 11.02.2026 10:30)
                const fmtDate = (date) => {
                    if(!date) return '-';
                    const d = new Date(date);
                    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
                };
                
                tbody.innerHTML += `
                    <tr class="small">
                        <td>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-${pColor} p-1 me-2" title="${t.priority} Öncelik"> </span>
                                <div><strong>${t.type}</strong><br><small class="text-muted text-truncate d-inline-block" style="max-width:150px">${t.desc || ''}</small></div>
                            </div>
                        </td>
                        <td>${t.assigned || '-'}</td>
                        <td><small>${fmtDate(t.start)}<br>${fmtDate(t.end)}</small></td>
                        <td><span class="badge bg-light text-dark border">${t.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Düzenle" onclick='editTask(${JSON.stringify(t)})'><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteTaskFunc('${t.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        } else { 
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Kayıtlı görev bulunamadı.</td></tr>'; 
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
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = t.id;
    document.getElementById('taskType').value = t.type;
    
    // datetime-local inputu için YYYY-MM-DDTHH:mm formatı gerekir
    const toLocalISO = (dateStr) => {
        if(!dateStr) return "";
        const date = new Date(dateStr);
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    document.getElementById('taskStart').value = toLocalISO(t.start);
    document.getElementById('taskEnd').value = toLocalISO(t.end);
    
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

    if(!taskObj.type) return Swal.fire("Uyarı", "Görev / Konu alanı boş bırakılamaz.", "warning");

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
            const modalEl = document.getElementById('taskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
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
