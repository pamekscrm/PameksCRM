/**
 * js/customers.js - LİSTELEME YÖNETİMİ
 */
let globalSettings = { Musteri_Tipleri: [], Odeme_Sekilleri: [], Nakliye_Tipleri: [] };

function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

async function fetchSettings() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    if(res.status === 'success') globalSettings = res.data;
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
        <div class="bg-white p-3 rounded shadow-sm border-0">
            <div class="row g-2 mb-3 align-items-center">
                <div class="col-md-6"><input type="text" id="customerSearch" class="form-control" placeholder="🔍 Firma Adı ile Ara..."></div>
                <div class="col-md-6 text-end"><button class="btn btn-primary" onclick="openCustomerDetail('new')"><i class="fas fa-plus"></i> Yeni Müşteri</button></div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr><th>Firma Adı</th><th>Tip</th><th>Şehir</th><th>Durum</th><th class="text-end">İşlemler</th></tr>
                    </thead>
                    <tbody id="customerTableBody"></tbody>
                </table>
            </div>
        </div>`;
    fetchCustomers();
}

async function fetchCustomers() {
    const b = document.getElementById('customerTableBody');
    b.innerHTML = '<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>';
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getCustomers" }) }).then(r => r.json());
        b.innerHTML = "";
        if (res.status === "success" && res.data.length > 0) {
            res.data.forEach(c => {
                let badge = c.status === 'Aktif' ? 'success' : 'danger';
                b.innerHTML += `
                    <tr>
                        <td class="fw-bold">${c.name}</td>
                        <td><small class="badge bg-light text-dark border">${c.type || '-'}</small></td>
                        <td>${c.city || '-'}</td>
                        <td><span class="badge bg-${badge}">${c.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-info text-white me-1" title="Detay" onclick="showCustomerDashboard('${c.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-light border" title="Düzenle" onclick="openCustomerDetail('${c.id}')"><i class="fas fa-edit text-primary"></i></button>
                        </td>
                    </tr>`;
            });
        } else { b.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-4">Kayıt bulunamadı.</td></tr>'; }
    } catch (e) { b.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Bağlantı Hatası.</td></tr>'; }
}

async function openCustomerDetail(id) {
    const m = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    document.getElementById('customerForm').reset();
    populateSelect('custType', globalSettings.Musteri_Tipleri);
    if (id === 'new') {
        document.getElementById('custId').value = "";
        m.show();
    } else {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getCustomerDetail", id: id }) }).then(r => r.json());
        hideLoading();
        if(res.status === 'success') {
            const d = res.data;
            document.getElementById('custId').value = d.id;
            document.getElementById('custName').value = d.name;
            document.getElementById('custStatus').value = d.status;
            document.getElementById('custCountry').value = d.country;
            document.getElementById('custCity').value = d.city;
            document.getElementById('custPhone').value = d.phone;
            document.getElementById('custAddress').value = d.address;
            populateSelect('custType', globalSettings.Musteri_Tipleri, d.type);
            m.show();
        }
    }
}

async function saveCustomerData() {
    const n = document.getElementById('custName').value;
    if(!n) return;
    showLoading();
    const p = {
        action: "saveCustomer",
        id: document.getElementById('custId').value,
        name: n, type: document.getElementById('custType').value, status: document.getElementById('custStatus').value,
        country: document.getElementById('custCountry').value, city: document.getElementById('custCity').value,
        phone: document.getElementById('custPhone').value, address: document.getElementById('custAddress').value,
        user: currentUser.name
    };
    await fetch(API_URL, { method: "POST", body: JSON.stringify(p) });
    hideLoading();
    bootstrap.Modal.getInstance(document.getElementById('customerDetailModal')).hide();
    if(document.getElementById('customerDashboardHeader')) { showCustomerDashboard(p.id); } else { fetchCustomers(); }
}
