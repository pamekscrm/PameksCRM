/**
 * js/notes.js - NOT YÖNETİM MANTIĞI (8 SÜTUN UYUMLU)
 */

async function fetchDetailNotes(customerId) {
    const container = document.getElementById('tab-notes');
    if(!container) return;

    // Arayüz iskeletini oluştur
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <h6 class="m-0 fw-bold text-dark">Müşteri Notları</h6>
            <button class="btn btn-sm btn-primary" onclick="openNoteModal('new')"><i class="fas fa-plus me-1"></i> Yeni Not</button>
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
                <thead class="table-light small text-uppercase fw-bold">
                    <tr>
                        <th>Tarih</th>
                        <th>Başlık</th>
                        <th>Ekleyen</th>
                        <th class="text-end">İşlem</th>
                    </tr>
                </thead>
                <tbody id="detailNoteBody">
                    <tr><td colspan="4" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>
                </tbody>
            </table>
        </div>`;

    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getNotes", customerId: customerId }) 
        }).then(r => r.json());

        const tbody = document.getElementById('detailNoteBody');
        tbody.innerHTML = "";

        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(n => {
                // Tarih formatla (Örn: 11.02.2026 14:00)
                let dateStr = n.date ? new Date(n.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
                
                tbody.innerHTML += `
                    <tr class="small">
                        <td class="text-nowrap">${dateStr}</td>
                        <td>
                            <strong>${n.title}</strong><br>
                            <small class="text-muted text-truncate d-inline-block" style="max-width:300px">${n.content || ''}</small>
                        </td>
                        <td><small class="text-secondary">${n.user || '-'}</small></td>
                        <td class="text-end text-nowrap">
                            <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Düzenle" onclick='editNote(${JSON.stringify(n)})'><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteNoteFunc('${n.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        } else { 
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Bu müşteriye ait not bulunamadı.</td></tr>'; 
        }
    } catch (err) {
        document.getElementById('detailNoteBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Notlar yüklenirken hata oluştu.</td></tr>';
    }
}

function openNoteModal(mode) {
    document.getElementById('noteForm').reset();
    document.getElementById('noteId').value = "";
    
    // Varsayılan olarak şu anki saati ata
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowISO = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    document.getElementById('noteDate').value = nowISO;

    const modal = new bootstrap.Modal(document.getElementById('noteModal'));
    modal.show();
}

function editNote(n) {
    document.getElementById('noteForm').reset();
    document.getElementById('noteId').value = n.id;
    document.getElementById('noteTitle').value = n.title;
    document.getElementById('noteContent').value = n.content;
    
    // datetime-local formatına çevir
    if(n.date) {
        const d = new Date(n.date);
        const pad = (num) => String(num).padStart(2, '0');
        const dISO = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        document.getElementById('noteDate').value = dISO;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('noteModal'));
    modal.show();
}

async function saveNoteData() {
    const custId = document.getElementById('dashboardCustId').value;
    const noteObj = {
        id: document.getElementById('noteId').value,
        customerId: custId,
        date: document.getElementById('noteDate').value,
        title: document.getElementById('noteTitle').value.trim(),
        content: document.getElementById('noteContent').value.trim()
    };

    if(!noteObj.title) return Swal.fire("Uyarı", "Not başlığı boş bırakılamaz.", "warning");

    showLoading();
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ 
                action: "saveNote", 
                noteData: noteObj, 
                currentUser: currentUser 
            }) 
        }).then(r => r.json());

        hideLoading();
        if(res.status === 'success') {
            const modalEl = document.getElementById('noteModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();
            
            fetchDetailNotes(custId);
            Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire("Hata", res.message, "error");
        }
    } catch (e) {
        hideLoading();
        Swal.fire("Hata", "Sunucu bağlantı sorunu.", "error");
    }
}

async function deleteNoteFunc(noteId, customerId) {
    const r = await Swal.fire({ 
        title: 'Notu Sil?', 
        text: "Bu not kalıcı olarak silinecektir!", 
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
                body: JSON.stringify({ action: "deleteNote", noteId: noteId }) 
            }).then(r => r.json());
            
            hideLoading();
            if(res.status === 'success') {
                fetchDetailNotes(customerId);
                Swal.fire('Silindi!', res.message, 'success');
            }
        } catch (e) {
            hideLoading();
            Swal.fire('Hata!', 'İşlem başarısız.', 'error');
        }
    }
}
