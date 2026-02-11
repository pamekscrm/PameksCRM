/**
 * MÜŞTERİ YÖNETİMİ - MODERN & MOBİL UYUMLU (v2)
 */

// YÜKLEME EKRANI KONTROLLERİ
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay) overlay.style.display = 'none';
}

// Müşteri Listesini Yükle
function loadCustomersModule() {
    const contentDiv = document.getElementById('dynamicContent');
    const titleDiv = document.getElementById('pageTitle');
    
    if(titleDiv) titleDiv.innerText = "Müşteri Listesi";
    
    // Mobil uyumlu kart tasarımı ve tablo
    contentDiv.innerHTML = `
        <div class="content-card bg-white p-3 rounded shadow-sm">
            <div class="row g-2 mb-3 align-items-center">
                <div class="col-12 col-md-6">
                    <input type="text" id="customerSearch" class="form-control" placeholder="🔍 Firma Ara...">
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
                            <th>Şehir</th>
                            <th>Telefon</th>
                            <th>Durum</th>
                            <th class="text-end">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="customerTableBody">
                        <tr>
                            <td colspan="6" class="text-center py-5 text-muted">
                                Veriler Yükleniyor...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
    
    fetchCustomers();
}

function fetchCustomers() {
    const tbody = document.getElementById('customerTableBody');
    // Tablo içi spinner
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

    fetch(API_URL, {
        method: "POST",
        body: new URLSearchParams({ action: "getCustomers" })
    })
    .then(r => r.json())
    .then(response => {
        tbody.innerHTML = ""; 

        if (response.status === "success" && response.data.length > 0) {
            response.data.forEach(cust => {
                let badgeColor = 'secondary';
                if(cust.status === 'Aktif') badgeColor = 'success';
                if(cust.status === 'Pasif') badgeColor = 'danger';
                if(cust.status === 'Aday') badgeColor = 'warning';

                const row = `
                    <tr>
                        <td>
                            <div class="fw-bold text-primary">${cust.name}</div>
                            <small class="text-muted d-block d-md-none">${cust.city || ''}</small>
                        </td>
                        <td><span class="badge bg-light text-dark border">${cust.type || '-'}</span></td>
                        <td>${cust.city || '-'}</td>
                        <td>${cust.phone || '-'}</td>
                        <td><span class="badge bg-${badgeColor}">${cust.status}</span></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-light border" onclick="openCustomerDetail('${cust.id}')">
                                <i class="fas fa-edit text-primary"></i>
                            </button>
                            <button class="btn btn-sm btn-light border" onclick="deleteCustomerFunc('${cust.id}')">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-4">Hiç kayıt bulunamadı.</td></tr>`;
        }
    })
    .catch(err => {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Bağlantı Hatası!</td></tr>`;
    });
}

function openCustomerDetail(id) {
    const modalElement = document.getElementById('customerDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    document.getElementById('customerForm').reset();
    
    if (id === 'new') {
        document.getElementById('modalTitle').innerText = "Yeni Müşteri Ekle";
        document.getElementById('custId').value = "";
        modal.show();
    } else {
        document.getElementById('modalTitle').innerText = "Müşteri Düzenle";
        showLoading(); // EKRANI KİLİTLE (SPINNER)
        
        fetch(API_URL, {
            method: "POST",
            body: new URLSearchParams({ action: "getCustomerDetail", id: id })
        })
        .then(r => r.json())
        .then(res => {
            hideLoading(); // SPINNER KAPAT
            if(res.status === 'success') {
                const d = res.data;
                document.getElementById('custId').value = d.id;
                document.getElementById('custName').value = d.name;
                
                ensureOptionExists('custType', d.type);
                document.getElementById('custType').value = d.type;

                document.getElementById('custStatus').value = d.status;
                document.getElementById('custCountry').value = d.country;
                document.getElementById('custCity').value = d.city;
                document.getElementById('custPhone').value = d.phone;
                document.getElementById('custEmail').value = d.email;
                document.getElementById('custWeb').value = d.website;
                document.getElementById('custAddress').value = d.address;

                ensureOptionExists('custPayment', d.payment);
                document.getElementById('custPayment').value = d.payment;

                ensureOptionExists('custShipping', d.shipping);
                document.getElementById('custShipping').value = d.shipping;

                document.getElementById('custNotes').value = d.notes;
                modal.show();
            } else {
                Swal.fire('Hata', 'Müşteri verisi alınamadı', 'error');
            }
        });
    }
}

function saveCustomerData() {
    const name = document.getElementById('custName').value;
    if(!name) {
        Swal.fire('Eksik Bilgi', 'Lütfen Firma Adını giriniz.', 'warning');
        return;
    }

    showLoading(); // EKRANI KİLİTLE (SPINNER)

    const currentUser = JSON.parse(sessionStorage.getItem('crmUser'));

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
        user: currentUser ? currentUser.name : 'Admin'
    };

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
        hideLoading(); // SPINNER KAPAT

        if(res.status === 'success') {
            // MODERN BAŞARI MESAJI (SweetAlert2)
            Swal.fire({
                title: 'Başarılı!',
                text: res.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            const modalEl = document.getElementById('customerDetailModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            fetchCustomers(); 
        } else {
            Swal.fire('Hata', res.message, 'error');
        }
    })
    .catch(err => {
        hideLoading();
        Swal.fire('Bağlantı Hatası', 'Sunucuya ulaşılamadı.', 'error');
    });
}

function deleteCustomerFunc(id) {
    Swal.fire({
        title: 'Emin misiniz?',
        text: "Bu müşteri kaydı silinecek! Bu işlem geri alınamaz.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Evet, Sil!',
        cancelButtonText: 'Vazgeç'
    }).then((result) => {
        if (result.isConfirmed) {
            showLoading(); // SPINNER AÇ

            fetch(API_URL, {
                method: "POST",
                body: new URLSearchParams({ action: "deleteCustomer", id: id })
            })
            .then(r => r.json())
            .then(res => {
                hideLoading(); // SPINNER KAPAT

                if (res.status === 'success') {
                    Swal.fire('Silindi!', res.message, 'success');
                    fetchCustomers();
                } else {
                    Swal.fire('Silinemedi!', res.message, 'error');
                }
            })
            .catch(err => {
                hideLoading();
                Swal.fire('Hata', 'Bağlantı hatası oluştu.', 'error');
            });
        }
    });
}

// --- DİNAMİK DROPDOWN YÖNETİMİ ---
function addNewOption(selectId, title) {
    Swal.fire({
        title: title,
        input: 'text',
        inputPlaceholder: 'Yeni değer yazın...',
        showCancelButton: true,
        confirmButtonText: 'Ekle',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (!value) return 'Bir değer yazmalısınız!';
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            const select = document.getElementById(selectId);
            const newValue = result.value;
            ensureOptionExists(selectId, newValue);
            select.value = newValue;
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            Toast.fire({ icon: 'success', title: 'Listeye eklendi' });
        }
    });
}

function ensureOptionExists(selectId, value) {
    if(!value) return;
    const select = document.getElementById(selectId);
    let exists = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.innerText = value;
        select.appendChild(opt);
    }
}
