/**
 * js/customer_detail.js - TÜM SEKMELER VE PAZARLIK SİSTEMİ DAHİL TAM SÜRÜM
 */

async function showCustomerDashboard(id) {
    showLoading();
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getCustomerDetail", id: id })
        }).then(r => r.json());

        if (res.status !== 'success') return Swal.fire("Hata", "Veri alınamadı", "error");

        const d = res.data;
        const contentDiv = document.getElementById('dynamicContent');
        document.getElementById('pageTitle').innerText = "Müşteri Dosyası";

        contentDiv.innerHTML = `
            <div id="customerDashboardHeader" class="p-4 rounded-3 shadow-sm mb-4 text-white" style="background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h2 class="fw-bold mb-1"><i class="fas fa-building me-2"></i> ${d.name}</h2>
                        <p class="mb-0 opacity-75">${d.type || 'Sektör Belirtilmemiş'} • ${d.city || 'Konum Yok'}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-light btn-sm fw-bold" onclick="openCustomerDetail('${d.id}')"><i class="fas fa-edit me-1"></i> Düzenle</button>
                        <button class="btn btn-outline-light btn-sm fw-bold" onclick="loadModule('customers')"><i class="fas fa-arrow-left me-1"></i> Geri</button>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white fw-bold py-3"><i class="fas fa-info-circle text-primary me-2"></i> Genel Bilgiler</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Sektör/Tip:</span> <span class="fw-bold text-dark">${d.type || '-'}</span></div>
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Ödeme Şekli:</span> <span class="fw-bold text-muted">${d.payment || '-'}</span></div>
                            <div class="d-flex justify-content-between py-2"><span>Durum:</span> <span class="badge bg-success">${d.status}</span></div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white fw-bold py-3"><i class="fas fa-address-book text-primary me-2"></i> İletişim Bilgileri</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Telefon:</span> <span class="fw-bold text-dark">${d.phone || '-'}</span></div>
                            <div class="d-flex justify-content-between border-bottom py-2"><span>E-Posta:</span> <span class="fw-bold text-muted small">${d.email || '-'}</span></div>
                            <div class="d-flex justify-content-between py-2"><span>Şehir/Ülke:</span> <span class="fw-bold">${d.city || '-'}/${d.country || '-'}</span></div>
                        </div>
                    </div>
                </div>

                <div class="col-12 mt-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white p-0">
                            <ul class="nav nav-tabs border-bottom-0" id="detailTabs" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active py-3 px-4 fw-bold" id="contacts-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-contacts" onclick="fetchDetailContacts('${d.id}')">İlgili Kişiler</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-3 px-4 fw-bold" id="tasks-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-tasks" onclick="fetchDetailTasks('${d.id}')">Görevler</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-3 px-4 fw-bold" id="notes-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-notes" onclick="fetchDetailNotes('${d.id}')">Notlar</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-3 px-4 fw-bold" id="quotations-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-quotations" onclick="fetchDetailQuotations('${d.id}')">Teklifler</button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link py-3 px-4 fw-bold" id="attachments-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-attachments" onclick="fetchDetailAttachments('${d.id}')">Ekler</button>
                                </li>
                            </ul>
                        </div>
                        <div class="card-body p-4 tab-content">
                            <div class="tab-pane fade show active" id="tab-contacts">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">İletişim Kişileri</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openContactModal('new')"><i class="fas fa-user-plus me-1"></i> Yeni Kişi</button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover align-middle">
                                        <thead class="table-light small text-uppercase fw-bold">
                                            <tr>
                                                <th>Ad Soyad / Ünvan</th>
                                                <th>Departman</th>
                                                <th>İletişim</th>
                                                <th class="text-center">Birincil</th>
                                                <th class="text-end">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody id="detailContactBody"></tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="tab-tasks">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">Görevler ve Hatırlatıcılar</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openTaskModal('new')"><i class="fas fa-plus me-1"></i> Yeni Görev</button>
                                </div>
                                <div id="detailTaskContainer" class="row g-3"></div>
                            </div>

                            <div class="tab-pane fade" id="tab-notes">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">Özel Notlar</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openNoteModal('new')"><i class="fas fa-sticky-note me-1"></i> Not Ekle</button>
                                </div>
                                <div id="detailNoteContainer" class="row g-3"></div>
                            </div>

                            <div class="tab-pane fade" id="tab-quotations">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">Model Teklifleri & Pazarlık Masası</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openQuotationModal('new')"><i class="fas fa-plus me-1"></i> Yeni Teklif</button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover align-middle text-nowrap">
                                        <thead class="table-light small text-uppercase fw-bold">
                                            <tr>
                                                <th>No / Model</th>
                                                <th>Kumaş</th>
                                                <th class="text-primary">Talep (Target)</th>
                                                <th class="text-danger">Teklif (Offered)</th>
                                                <th class="text-success">Onay (Agreed)</th>
                                                <th>Sonuç</th>
                                                <th class="text-end">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody id="detailQuotationBody"></tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="tab-attachments">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">Dosyalar ve Dokümanlar</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openAttachmentModal()"><i class="fas fa-upload me-1"></i> Dosya Yükle</button>
                                </div>
                                <div id="detailAttachmentContainer" class="row g-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <input type="hidden" id="dashboardCustId" value="${d.id}">`;
        
        fetchDetailContacts(d.id);
    } catch (e) { console.error(e); } finally { hideLoading(); }
}

/**
 * 1. İLETİŞİM KİŞİLERİ (TAM SAHA)
 */
async function fetchDetailContacts(customerId) {
    const b = document.getElementById('detailContactBody');
    if(!b) return;
    b.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';
    
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getContacts", customerId: customerId }) 
        }).then(r => r.json());

        b.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(c => {
                const isPrimary = String(c.isPrimary).trim() === "Evet";
                const primaryTag = isPrimary 
                    ? '<span class="badge bg-warning text-dark"><i class="fas fa-star"></i></span>' 
                    : '<span class="text-muted small">Hayır</span>';
                
                b.innerHTML += `<tr>
                    <td><strong>${c.name}</strong><br><small class="text-muted">${c.title || '-'}</small></td>
                    <td>${c.department || '-'}</td>
                    <td><small><i class="fas fa-phone me-1 text-muted"></i>${c.phone || ''}<br><i class="fas fa-envelope me-1 text-muted"></i>${c.email || ''}</small></td>
                    <td class="text-center">${primaryTag}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Düzenle" onclick='editContact(${JSON.stringify(c)})'><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteContactFunc('${c.id}', '${c.customerId}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        } else { 
            b.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Kayıtlı kişi bulunamadı.</td></tr>'; 
        }
    } catch (err) { b.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Veri yükleme hatası.</td></tr>'; }
}

/**
 * 2. GÖREVLER (TAM SAHA)
 */
async function fetchDetailTasks(customerId) {
    const container = document.getElementById('detailTaskContainer');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';
    
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getTasks", customerId: customerId }) }).then(r => r.json());
        container.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(t => {
                const priorityClass = t.priority === "Yüksek" ? "danger" : (t.priority === "Orta" ? "warning" : "info");
                container.innerHTML += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 border-start border-4 border-${priorityClass} shadow-sm">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <h6 class="fw-bold text-dark">${t.type}</h6>
                                    <span class="badge bg-${priorityClass}">${t.priority}</span>
                                </div>
                                <p class="small text-muted mb-2">${t.description || 'Açıklama yok'}</p>
                                <div class="small"><i class="fas fa-user me-1"></i> ${t.assignedUser || '-'}</div>
                                <div class="small"><i class="fas fa-calendar-alt me-1"></i> Bitiş: ${t.endDate || '-'}</div>
                            </div>
                            <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <span class="badge bg-light text-dark border">${t.status}</span>
                                <div>
                                    <button class="btn btn-sm btn-link text-primary p-0 me-2" onclick='editTask(${JSON.stringify(t)})'><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteTaskFunc('${t.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
        } else { container.innerHTML = '<div class="col-12 text-center text-muted">Bekleyen görev bulunmuyor.</div>'; }
    } catch (e) { container.innerHTML = '<div class="col-12 text-danger">Hata oluştu.</div>'; }
}

/**
 * 3. TEKLİFLER (PAZARLIK MASASI)
 */
async function fetchDetailQuotations(customerId) {
    const tbody = document.getElementById('detailQuotationBody');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';
    
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getQuotations", customerId: customerId }) 
        }).then(r => r.json());

        tbody.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(q => {
                const statusBadge = getQuotationStatusBadge(q.result);
                tbody.innerHTML += `
                    <tr>
                        <td><span class="fw-bold text-primary">${q.quoteNo}</span><br><small>${q.modelCode || '-'}</small></td>
                        <td><small>${q.fabric || '-'}</small></td>
                        <td class="fw-bold text-primary">${q.targetPrice || '0'} ${q.currency}</td>
                        <td class="fw-bold text-danger">${q.offeredPrice || '0'} ${q.currency}</td>
                        <td class="fw-bold text-success">${q.agreedPrice || '0'} ${q.currency}</td>
                        <td>${statusBadge}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Pazarlık / Revize" onclick='editQuotation(${JSON.stringify(q)})'><i class="fas fa-handshake fa-lg"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteQuotationFunc('${q.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        } else { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Teklif kaydı bulunamadı.</td></tr>'; }
    } catch (err) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Yükleme hatası.</td></tr>'; }
}

/**
 * 4. NOTLAR VE EKLER
 */
async function fetchDetailNotes(customerId) {
    const container = document.getElementById('detailNoteContainer');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getNotes", customerId: customerId }) }).then(r => r.json());
        container.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(n => {
                container.innerHTML += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0 bg-light">
                            <div class="card-body">
                                <h6 class="fw-bold text-primary">${n.title}</h6>
                                <p class="small text-dark mb-2" style="white-space: pre-wrap;">${n.content || ''}</p>
                                <div class="text-end small text-muted border-top pt-2">${n.date || ''}</div>
                            </div>
                            <div class="card-footer bg-transparent border-0 text-end">
                                <button class="btn btn-sm btn-link text-primary p-0 me-2" onclick='editNote(${JSON.stringify(n)})'><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteNoteFunc('${n.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>`;
            });
        } else { container.innerHTML = '<div class="col-12 text-center text-muted">Henüz not eklenmemiş.</div>'; }
    } catch (e) { container.innerHTML = '<div class="col-12 text-danger text-center">Notlar alınamadı.</div>'; }
}

async function fetchDetailAttachments(customerId) {
    const container = document.getElementById('detailAttachmentContainer');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getAttachments", customerId: customerId }) }).then(r => r.json());
        container.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(a => {
                container.innerHTML += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body text-center">
                                <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                <h6 class="fw-bold mb-1">${a.tag || 'Dosya'}</h6>
                                <p class="small text-muted mb-3">${a.description || ''}</p>
                                <a href="${a.fileUrl}" target="_blank" class="btn btn-sm btn-outline-primary w-100 fw-bold"><i class="fas fa-download me-1"></i> Görüntüle</a>
                            </div>
                            <div class="card-footer bg-transparent border-0 text-end">
                                <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteAttachmentFunc('${a.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>`;
            });
        } else { container.innerHTML = '<div class="col-12 text-center text-muted">Yüklü dosya bulunmuyor.</div>'; }
    } catch (e) { container.innerHTML = '<div class="col-12 text-danger text-center">Ekler alınamadı.</div>'; }
}

/**
 * MODAL VE YARDIMCI FONKSİYONLAR (HATA GİDERİLMİŞ)
 */
function openContactModal(mode) { 
    document.getElementById('contactForm').reset(); 
    document.getElementById('contId').value = ""; 
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show(); 
}

function editContact(c) {
    document.getElementById('contId').value = c.id;
    document.getElementById('contName').value = c.name;
    document.getElementById('contDept').value = c.department || "";
    document.getElementById('contTitle').value = c.title || "";
    document.getElementById('contPhone').value = c.phone || "";
    document.getElementById('contEmail').value = c.email || "";
    document.getElementById('contPrimary').value = c.isPrimary || "Hayır";
    document.getElementById('contStatus').value = c.status || "Aktif";
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
}

async function saveContactData() {
    const custId = document.getElementById('dashboardCustId').value;
    const contactObj = {
        id: document.getElementById('contId').value,
        customerId: custId,
        name: document.getElementById('contName').value.trim(),
        department: document.getElementById('contDept').value.trim(),
        title: document.getElementById('contTitle').value.trim(),
        phone: document.getElementById('contPhone').value.trim(),
        email: document.getElementById('contEmail').value.trim(),
        isPrimary: document.getElementById('contPrimary').value,
        status: document.getElementById('contStatus').value
    };
    if(!contactObj.name) return Swal.fire("Uyarı", "Ad Soyad alanı boş bırakılamaz.", "warning");
    showLoading();
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "saveContact", contactData: contactObj, currentUser: currentUser.name }) 
        }).then(r => r.json());
        hideLoading();
        if(res.status === 'success') {
            bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
            fetchDetailContacts(custId);
            Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
        }
    } catch (e) { hideLoading(); Swal.fire("Hata", "Bağlantı sorunu.", "error"); }
}

async function deleteContactFunc(id, customerId) {
    const r = await Swal.fire({ title: 'Emin misiniz?', text: "Kişi kaydı silinecektir!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil', cancelButtonText: 'Vazgeç' });
    if (r.isConfirmed) {
        showLoading();
        try {
            await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteContact", contactId: id }) });
            hideLoading();
            fetchDetailContacts(customerId);
        } catch (e) { hideLoading(); Swal.fire('Hata!', 'İşlem başarısız.', 'error'); }
    }
}

// Diğer modül silme ve düzenleme fonksiyonları (editTask, editNote vb.) Quotations.js'dekine benzer şekilde çalışır.
