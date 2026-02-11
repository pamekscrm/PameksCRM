/**
 * js/customer_detail.js - MODERN DASHBOARD GÖRÜNÜMÜ
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
                        <div class="card-header bg-white fw-bold"><i class="fas fa-info-circle text-primary me-2"></i> Genel Bilgiler</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Sektör/Tip:</span> <span class="fw-bold">${d.type || '-'}</span></div>
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Ödeme Şekli:</span> <span class="fw-bold text-muted">${d.payment || '-'}</span></div>
                            <div class="d-flex justify-content-between py-2"><span>Durum:</span> <span class="badge bg-success">${d.status}</span></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white fw-bold"><i class="fas fa-phone text-primary me-2"></i> İletişim Bilgileri</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between border-bottom py-2"><span>Telefon:</span> <span class="fw-bold">${d.phone || '-'}</span></div>
                            <div class="d-flex justify-content-between border-bottom py-2"><span>E-Posta:</span> <span class="fw-bold text-muted">${d.email || '-'}</span></div>
                            <div class="d-flex justify-content-between py-2"><span>Şehir/Ülke:</span> <span class="fw-bold">${d.city || '-'}/${d.country || '-'}</span></div>
                        </div>
                    </div>
                </div>

                <div class="col-12 mt-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white p-0">
                            <ul class="nav nav-tabs border-bottom-0" id="detailTabs">
                                <li class="nav-item"><button class="nav-link active py-3 px-4 fw-bold" data-bs-toggle="tab" data-bs-target="#tab-contacts" onclick="fetchDetailContacts('${d.id}')">İlgili Kişiler</button></li>
                                <li class="nav-item"><button class="nav-link py-3 px-4 fw-bold" data-bs-toggle="tab" data-bs-target="#tab-tasks">Görevler</button></li>
                            </ul>
                        </div>
                        <div class="card-body p-4 tab-content">
                            <div class="tab-pane fade show active" id="tab-contacts">
                                <div class="d-flex justify-content-between mb-3 align-items-center">
                                    <h6 class="m-0 fw-bold">Kayıtlı İnsanlar</h6>
                                    <button class="btn btn-sm btn-primary" onclick="openContactModal('new')"><i class="fas fa-user-plus"></i> Yeni Kişi</button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover align-middle">
                                        <thead class="table-light">
                                            <tr><th>Ad Soyad</th><th>Departman</th><th>Ünvan</th><th>İletişim</th><th class="text-center">Birincil</th><th class="text-end">İşlem</th></tr>
                                        </thead>
                                        <tbody id="detailContactBody"></tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="tab-pane fade text-center py-5" id="tab-tasks">İşlem kayıtları buraya gelecek.</div>
                        </div>
                    </div>
                </div>
            </div>`;
        fetchDetailContacts(d.id);
    } catch (e) { console.error(e); } finally { hideLoading(); }
}

async function fetchDetailContacts(customerId) {
    const b = document.getElementById('detailContactBody');
    b.innerHTML = '<tr><td colspan="6" class="text-center py-3">Yükleniyor...</td></tr>';
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getContacts", customerId: customerId }) }).then(r => r.json());
    b.innerHTML = "";
    if(res.status === "success" && res.data.length > 0) {
        res.data.forEach(c => {
            b.innerHTML += `<tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.department || '-'}</td>
                <td>${c.title || '-'}</td>
                <td><small>${c.phone || ''}<br>${c.email || ''}</small></td>
                <td class="text-center">${c.isPrimary === 'Evet' ? '⭐' : '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-link me-1" onclick='editContact(${JSON.stringify(c)})'><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-sm btn-link text-danger" onclick="deleteContactFunc('${c.id}', '${c.customerId}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
    } else { b.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Kayıt yok.</td></tr>'; }
}

function openContactModal(mode) { 
    document.getElementById('contactForm').reset(); 
    document.getElementById('contId').value = ""; 
    new bootstrap.Modal(document.getElementById('contactModal')).show(); 
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
    new bootstrap.Modal(document.getElementById('contactModal')).show();
}

async function saveContactData() {
    const custId = document.getElementById('custId').value;
    const p = { 
        action: "saveContact", 
        currentUser: currentUser, 
        contactData: { 
            id: document.getElementById('contId').value, 
            customerId: custId, 
            name: document.getElementById('contName').value, 
            department: document.getElementById('contDept').value, 
            title: document.getElementById('contTitle').value, 
            phone: document.getElementById('contPhone').value, 
            email: document.getElementById('contEmail').value, 
            isPrimary: document.getElementById('contPrimary').value, 
            status: document.getElementById('contStatus').value 
        } 
    };
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(p) }).then(r => r.json());
    hideLoading();
    if(res.status === 'success') {
        bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
        fetchDetailContacts(custId);
    }
}

async function deleteContactFunc(id, customerId) {
    const r = await Swal.fire({ title: 'Silinsin mi?', text: "Bu kişi kaydı silinecektir!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil' });
    if (r.isConfirmed) {
        showLoading();
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteContact", contactId: id }) });
        hideLoading();
        fetchDetailContacts(customerId);
    }
}
