/**
 * js/customers.js - TAM SÜRÜM (GÖZ BUTONU VE İLGİLİ KİŞİLER DAHİL)
 */
let globalSettings = { Musteri_Tipleri: [], Odeme_Sekilleri: [], Nakliye_Tipleri: [] };

function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

async function fetchSettings() {
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
        if(res.status === 'success') globalSettings = res.data;
    } catch(e) { console.error("Ayarlar çekilemedi", e); }
}

function populateSelect(selectId, items, selectedValue = "") {
    const s = document.getElementById(selectId);
    if(!s) return;
    s.innerHTML = '<option value="">Seçiniz</option>';
    items.forEach(i => {
        const o = document.createElement('option');
        o.value = i; o.innerText = i;
        if(i === selectedValue) o.selected = true;
        s.appendChild(o);
    });
}

async function loadCustomersModule() {
    await fetchSettings();
    const c = document.getElementById('dynamicContent');
    document.getElementById('pageTitle').innerText = "Müşteri Listesi";
    c.innerHTML = `
        <div class="content-card bg-white p-3 rounded shadow-sm">
            <div class="row g-2 mb-3 align-items-center">
                <div class="col-12 col-md-6"><input type="text" id="customerSearch" class="form-control" placeholder="🔍 Firma Ara..."></div>
                <div class="col-12 col-md-6 text-md-end"><button class="btn btn-primary w-100 w-md-auto" onclick="openCustomerDetail('new')"><i class="fas fa-plus"></i> Yeni Müşteri</button></div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle" style="min-width: 800px;">
                    <thead class="table-light">
                        <tr><th>Firma Adı</th><th>Tip</th><th>Şehir</th><th>Telefon</th><th>Durum</th><th class="text-end">İşlemler</th></tr>
                    </thead>
                    <tbody id="customerTableBody"></tbody>
                </table>
            </div>
        </div>`;
    fetchCustomers();
}

async function fetchCustomers() {
    const b = document.getElementById('customerTableBody');
    b.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getCustomers" }) }).then(r => r.json());
        b.innerHTML = ""; 
        if (res.status === "success" && res.data.length > 0) {
            res.data.forEach(c => {
                let color = c.status === 'Aktif' ? 'success' : (c.status === 'Pasif' ? 'danger' : 'warning');
                b.innerHTML += `
                    <tr>
                        <td><div class="fw-bold text-primary">${c.name}</div></td>
                        <td><span class="badge bg-light text-dark border">${c.type || '-'}</span></td>
                        <td>${c.city || '-'}</td>
                        <td>${c.phone || '-'}</td>
                        <td><span class="badge bg-${color}">${c.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-info text-white" onclick="openCustomerDetail('${c.id}', 'view')"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-light border" onclick="openCustomerDetail('${c.id}', 'edit')"><i class="fas fa-edit text-primary"></i></button>
                            <button class="btn btn-sm btn-light border" onclick="deleteCustomerFunc('${c.id}')"><i class="fas fa-trash text-danger"></i></button>
                        </td>
                    </tr>`;
            });
        } else { b.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-4">Kayıt bulunamadı.</td></tr>`; }
    } catch (e) { b.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-4">Hata: ${e.message}</td></tr>`; }
}

async function openCustomerDetail(id, mode = 'edit') {
    const mEl = document.getElementById('customerDetailModal');
    const mObj = new bootstrap.Modal(mEl);
    const tabBtn = document.getElementById('contacts-tab');
    
    document.getElementById('customerForm').reset();
    new bootstrap.Tab(document.getElementById('info-tab')).show();

    if (id === 'new') {
        document.getElementById('modalTitle').innerText = "Yeni Müşteri Ekle";
        document.getElementById('custId').value = "";
        tabBtn.classList.add('disabled');
        mObj.show();
    } else {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getCustomerDetail", id: id }) }).then(r => r.json());
        hideLoading();
        if(res.status === 'success') {
            const d = res.data;
            document.getElementById('modalTitle').innerText = mode === 'view' ? "Müşteri Dosyası" : "Müşteri Düzenle";
            document.getElementById('custId').value = d.id;
            document.getElementById('custName').value = d.name;
            document.getElementById('custStatus').value = d.status;
            document.getElementById('custCountry').value = d.country;
            document.getElementById('custCity').value = d.city;
            document.getElementById('custPhone').value = d.phone;
            document.getElementById('custEmail').value = d.email;
            document.getElementById('custWeb').value = d.website;
            document.getElementById('custAddress').value = d.address;
            document.getElementById('custNotes').value = d.notes;
            populateSelect('custType', globalSettings.Musteri_Tipleri, d.type);
            populateSelect('custPayment', globalSettings.Odeme_Sekilleri, d.payment);
            populateSelect('custShipping', globalSettings.Nakliye_Tipleri, d.shipping);
            
            tabBtn.classList.remove('disabled');
            fetchContacts(d.id);
            mObj.show();
        }
    }
}

async function saveCustomerData() {
    const n = document.getElementById('custName').value;
    if(!n) return Swal.fire('Hata', 'Firma Adı zorunludur.', 'warning');
    showLoading();
    const p = {
        action: "saveCustomer",
        id: document.getElementById('custId').value,
        name: n, type: document.getElementById('custType').value, status: document.getElementById('custStatus').value,
        country: document.getElementById('custCountry').value, city: document.getElementById('custCity').value,
        phone: document.getElementById('custPhone').value, email: document.getElementById('custEmail').value,
        website: document.getElementById('custWeb').value, address: document.getElementById('custAddress').value,
        payment: document.getElementById('custPayment').value, shipping: document.getElementById('custShipping').value,
        notes: document.getElementById('custNotes').value, user: currentUser.name
    };
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(p) }).then(r => r.json());
    hideLoading();
    if(res.status === 'success') {
        Swal.fire({ title: 'Başarılı', icon: 'success', timer: 1500, showConfirmButton: false });
        bootstrap.Modal.getInstance(document.getElementById('customerDetailModal')).hide();
        fetchCustomers();
    }
}

async function deleteCustomerFunc(id) {
    const r = await Swal.fire({ title: 'Emin misiniz?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil' });
    if (r.isConfirmed) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteCustomer", id: id }) }).then(r => r.json());
        hideLoading();
        Swal.fire(res.status === 'success' ? 'Başarılı' : 'Hata', res.message, res.status);
        if(res.status === 'success') fetchCustomers();
    }
}

// --- İLGİLİ KİŞİLER ---

async function fetchContacts(customerId) {
    const t = document.getElementById('contactTableBody');
    t.innerHTML = '<tr><td colspan="5" class="text-center small">Yükleniyor...</td></tr>';
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getContacts", customerId: customerId }) }).then(r => r.json());
    t.innerHTML = "";
    if(res.status === "success" && res.data.length > 0) {
        res.data.forEach(c => {
            t.innerHTML += `
                <tr class="small">
                    <td><strong>${c.name}</strong></td>
                    <td>${c.title || '-'}</td>
                    <td>${c.phone || ''}<br>${c.email || ''}</td>
                    <td class="text-center">${c.isPrimary === 'Evet' ? '⭐' : '-'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-link p-0 me-2" onclick='editContact(${JSON.stringify(c)})'><i class="fas fa-pencil-alt text-primary"></i></button>
                        <button class="btn btn-sm btn-link p-0" onclick="deleteContactFunc('${c.id}')"><i class="fas fa-trash text-danger"></i></button>
                    </td>
                </tr>`;
        });
    } else { t.innerHTML = '<tr><td colspan="5" class="text-center text-muted small">Kişi bulunamadı.</td></tr>'; }
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
        fetchContacts(custId);
    }
}

async function deleteContactFunc(id) {
    const r = await Swal.fire({ title: 'Kişi silinsin mi?', icon: 'warning', showCancelButton: true });
    if(r.isConfirmed) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteContact", contactId: id }) }).then(r => r.json());
        hideLoading();
        if(res.status === 'success') fetchContacts(document.getElementById('custId').value);
    }
}
