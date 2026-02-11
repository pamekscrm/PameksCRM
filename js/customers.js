/**
 * js/customers.js - TAM SÜRÜM (HİÇBİR ÖZELLİK EKSİLTİLMEDİ)
 */
let globalSettings = { Musteri_Tipleri: [], Odeme_Sekilleri: [], Nakliye_Tipleri: [] };

function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

async function fetchSettings() {
    const res = await fetch(API_URL, { 
        method: "POST", 
        body: JSON.stringify({ action: "getSettings" }) 
    }).then(r => r.json());
    if(res.status === 'success') globalSettings = res.data;
}

function populateSelect(selectId, items, selectedValue = "") {
    const select = document.getElementById(selectId);
    if(!select) return;
    select.innerHTML = '<option value="">Seçiniz</option>';
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.innerText = item;
        if(item === selectedValue) opt.selected = true;
        select.appendChild(opt);
    });
}

async function loadCustomersModule() {
    await fetchSettings();
    const contentDiv = document.getElementById('dynamicContent');
    document.getElementById('pageTitle').innerText = "Müşteri Listesi";
    
    contentDiv.innerHTML = `
        <div class="content-card bg-white p-3 rounded shadow-sm">
            <div class="row g-2 mb-3 align-items-center">
                <div class="col-12 col-md-6">
                    <input type="text" id="customerSearch" class="form-control" placeholder="🔍 Firma Ara..." onkeyup="filterCustomers()">
                </div>
                <div class="col-12 col-md-6 text-md-end">
                    <button class="btn btn-primary w-100 w-md-auto" onclick="openCustomerDetail('new')">
                        <i class="fas fa-plus"></i> Yeni Müşteri
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle" id="customerTable" style="min-width: 800px;">
                    <thead class="table-light">
                        <tr>
                            <th>Firma Adı</th>
                            <th>Tip</th>
                            <th>Ülke</th>
                            <th>Şehir</th>
                            <th>Durum</th>
                            <th class="text-end">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="customerTableBody"></tbody>
                </table>
            </div>
        </div>`;
    fetchCustomers();
}

async function fetchCustomers() {
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getCustomers" }) 
        }).then(r => r.json());

        tbody.innerHTML = ""; 
        if (res.status === "success" && res.data.length > 0) {
            res.data.forEach(cust => {
                let badgeColor = cust.status === 'Aktif' ? 'success' : (cust.status === 'Pasif' ? 'danger' : 'warning');
                tbody.innerHTML += `
                    <tr>
                        <td><div class="fw-bold text-primary">${cust.name}</div></td>
                        <td><span class="badge bg-light text-dark border">${cust.type || '-'}</span></td>
                        <td>${cust.country || '-'}</td>
                        <td>${cust.city || '-'}</td>
                        <td><span class="badge bg-${badgeColor}">${cust.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-info text-white me-1" title="Göz" onclick="showCustomerDashboard('${cust.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-light border me-1" title="Düzenle" onclick="openCustomerDetail('${cust.id}')"><i class="fas fa-edit text-primary"></i></button>
                            <button class="btn btn-sm btn-light border" title="Sil" onclick="deleteCustomerFunc('${cust.id}')"><i class="fas fa-trash text-danger"></i></button>
                        </td>
                    </tr>`;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-4">Kayıt bulunamadı.</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-4">Hata: ${error.message}</td></tr>`;
    }
}

// Orijinal Kodundaki Filtreleme Fonksiyonu
function filterCustomers() {
    const input = document.getElementById("customerSearch").value.toUpperCase();
    const tr = document.getElementById("customerTableBody").getElementsByTagName("tr");
    for (let i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().indexOf(input) > -1 ? "" : "none";
        }
    }
}

async function openCustomerDetail(id) {
    const modal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    document.getElementById('customerForm').reset();
    populateSelect('custType', globalSettings.Musteri_Tipleri);
    populateSelect('custPayment', globalSettings.Odeme_Sekilleri);
    populateSelect('custShipping', globalSettings.Nakliye_Tipleri);

    if (id === 'new') {
        document.getElementById('modalTitle').innerText = "Yeni Müşteri Ekle";
        document.getElementById('custId').value = "";
        modal.show();
    } else {
        document.getElementById('modalTitle').innerText = "Müşteri Düzenle";
        showLoading();
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getCustomerDetail", id: id })
        }).then(r => r.json());
        hideLoading();
        if(res.status === 'success') {
            const d = res.data;
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
            modal.show();
        }
    }
}

async function saveCustomerData() {
    const name = document.getElementById('custName').value;
    if(!name) return Swal.fire('Hata', 'Firma Adı zorunludur.', 'warning');
    showLoading();
    const payload = {
        action: "saveCustomer",
        id: document.getElementById('custId').value,
        name: name,
        type: document.getElementById('custType').value,
        status: document.getElementById('custStatus').value,
        country: document.getElementById('custCountry').value,
        city: document.getElementById('custCity').value,
        phone: document.getElementById('custPhone').value,
        email: document.getElementById('custEmail').value,
        website: document.getElementById('custWeb').value,
        address: document.getElementById('custAddress').value,
        payment: document.getElementById('custPayment').value,
        shipping: document.getElementById('custShipping').value,
        notes: document.getElementById('custNotes').value,
        user: currentUser.name
    };
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) }).then(r => r.json());
    hideLoading();
    if(res.status === 'success') {
        Swal.fire({ title: 'Başarılı', text: res.message, icon: 'success', timer: 2000, showConfirmButton: false });
        bootstrap.Modal.getInstance(document.getElementById('customerDetailModal')).hide();
        // Eğer dashboard üzerindeysek dashboard'u yenile, değilsek listeyi yenile
        if(document.getElementById('customerDashboardHeader')) { showCustomerDashboard(payload.id); } else { fetchCustomers(); }
    } else {
        Swal.fire('Hata', res.message, 'error');
    }
}

async function deleteCustomerFunc(id) {
    const result = await Swal.fire({ title: 'Emin misiniz?', text: "Müşteri silinecektir!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet, Sil', cancelButtonText: 'İptal' });
    if (result.isConfirmed) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteCustomer", id: id }) }).then(r => r.json());
        hideLoading();
        Swal.fire(res.status === 'success' ? 'Başarılı' : 'Hata', res.message, res.status);
        if(res.status === 'success') fetchCustomers();
    }
}
