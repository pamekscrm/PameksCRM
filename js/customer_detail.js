/**
 * js/customer_detail.js - BİRİNCİL SÜTUNU VE KULLANICI ADI DÜZELTİLMİŞ TAM SÜRÜM
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
                                <li class="nav-item"><button class="nav-link active py-3 px-4 fw-bold" id="contacts-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-contacts" onclick="fetchDetailContacts('${d.id}')">İlgili Kişiler</button></li>
                                <li class="nav-item"><button class="nav-link py-3 px-4 fw-bold" id="tasks-tab-btn" data-bs-toggle="tab" data-bs-target="#tab-tasks">Görevler</button></li>
                            </ul>
                        </div>
                        <div class="card-body p-4 tab-content">
                            <div class="tab-pane fade show active" id="tab-contacts">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold text-dark">Kayıtlı Kişiler</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openContactModal('new')"><i class="fas fa-user-plus me-1"></i> Yeni Kişi</button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover align-middle">
                                        <thead class="table-light small text-uppercase fw-bold">
                                            <tr>
                                                <th>Ad Soyad</th>
                                                <th>Departman</th>
                                                <th>Ünvan</th>
                                                <th>İletişim</th>
                                                <th class="text-center">Birincil</th>
                                                <th class="text-end">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody id="detailContactBody"></tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="tab-pane fade text-center py-5 text-muted" id="tab-tasks">İşlem kayıtları buraya gelecek.</div>
                        </div>
                    </div>
                </div>
            </div>
            <input type="hidden" id="dashboardCustId" value="${d.id}">`;
        
        fetchDetailContacts(d.id);
    } catch (e) { console.error(e); } finally { hideLoading(); }
}

async function fetchDetailContacts(customerId) {
    const b = document.getElementById('detailContactBody');
    if(!b) return;
    b.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';
    
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getContacts", customerId: customerId }) 
        }).then(r => r.json());

        b.innerHTML = "";
        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(c => {
                // EŞLEŞME KONTROLÜ: Sayfadaki değeri 'Evet' ise yıldız koyuyoruz
                const isPrimary = String(c.isPrimary).trim() === "Evet";
                const primaryTag = isPrimary 
                    ? '<span class="badge bg-warning text-dark"><i class="fas fa-star me-1"></i>Evet</span>' 
                    : '<span class="text-muted">Hayır</span>';
                
                b.innerHTML += `<tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.department || '-'}</td>
                    <td>${c.title || '-'}</td>
                    <td><small><i class="fas fa-phone me-1 text-muted"></i>${c.phone || ''}<br><i class="fas fa-envelope me-1 text-muted"></i>${c.email || ''}</small></td>
                    <td class="text-center">${primaryTag}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-link text-primary me-2 p-0" title="Düzenle" onclick='editContact(${JSON.stringify(c)})'><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteContactFunc('${c.id}', '${c.customerId}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        } else { 
            b.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Kayıtlı ilgili kişi bulunamadı.</td></tr>'; 
        }
    } catch (err) {
        b.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Veri yükleme hatası.</td></tr>';
    }
}

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
            body: JSON.stringify({ 
                action: "saveContact", 
                contactData: contactObj, 
                currentUser: currentUser // Nesne olarak gönderiyoruz, Main.gs name'i ayıklayacak
            }) 
        }).then(r => r.json());

        hideLoading();
        if(res.status === 'success') {
            const modalEl = document.getElementById('contactModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();
            
            fetchDetailContacts(custId);
            Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire("Hata", res.message, "error");
        }
    } catch (e) {
        hideLoading();
        Swal.fire("Hata", "Sunucuya bağlanılamadı.", "error");
    }
}

async function deleteContactFunc(id, customerId) {
    const r = await Swal.fire({ 
        title: 'Emin misiniz?', 
        text: "Kişi kaydı silinecektir!", 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'Vazgeç'
    });

    if (r.isConfirmed) {
        showLoading();
        try {
            await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteContact", contactId: id }) });
            hideLoading();
            fetchDetailContacts(customerId);
        } catch (e) {
            hideLoading();
            Swal.fire('Hata!', 'İşlem başarısız.', 'error');
        }
    }
}
