/**
 * MÜŞTERİ YÖNETİMİ SCRIPTLERİ
 * customers.js
 */

// Müşteri Listesini Getir ve Tabloya Bas
function loadCustomersModule() {
    const contentDiv = document.getElementById('dynamicContent');
    const titleDiv = document.getElementById('pageTitle');
    
    titleDiv.innerText = "Müşteri Listesi";
    contentDiv.innerHTML = `
        <div class="content-card">
            <div class="d-flex justify-content-between mb-3">
                <input type="text" id="customerSearch" class="form-control w-25" placeholder="Firma Ara...">
                <button class="btn btn-primary" onclick="openCustomerDetail('new')">
                    <i class="fas fa-plus"></i> Yeni Müşteri
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle table-striped" id="customerTable">
                    <thead class="table-light">
                        <tr>
                            <th>Firma Adı</th>
                            <th>Tip</th>
                            <th>Ülke</th>
                            <th>Şehir</th>
                            <th>Telefon</th>
                            <th>E-posta</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="customerTableBody">
                        <tr>
                            <td colspan="8" class="text-center py-5 text-muted">
                                <div class="spinner-border text-primary" role="status"></div>
                                <div class="mt-2">Veriler Yükleniyor...</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
    
    fetchCustomers();
}

function fetchCustomers() {
    fetch(API_URL, {
        method: "POST",
        body: new URLSearchParams({ action: "getCustomers" })
    })
    .then(r => r.json())
    .then(response => {
        const tbody = document.getElementById('customerTableBody');
        tbody.innerHTML = ""; 

        if (response.status === "success" && response.data.length > 0) {
            response.data.forEach(cust => {
                let badgeColor = 'secondary';
                if(cust.status === 'Aktif') badgeColor = 'success';
                if(cust.status === 'Pasif') badgeColor = 'danger';
                if(cust.status === 'Aday') badgeColor = 'warning';

                const row = `
                    <tr>
                        <td class="fw-bold text-primary">${cust.name}</td>
                        <td>${cust.type || '-'}</td>
                        <td>${cust.country || '-'}</td>
                        <td>${cust.city || '-'}</td>
                        <td>${cust.phone || '-'}</td>
                        <td><small>${cust.email || '-'}</small></td>
                        <td><span class="badge bg-${badgeColor}">${cust.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-dark" onclick="openCustomerDetail('${cust.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomerFunc('${cust.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Kayıtlı müşteri bulunamadı.</td></tr>`;
        }
    })
    .catch(err => {
        document.getElementById('customerTableBody').innerHTML = `<tr><td colspan="8" class="text-center text-danger">Hata: ${err.message}</td></tr>`;
    });
}

function openCustomerDetail(id) {
    const modal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    document.getElementById('customerForm').reset();
    
    if (id === 'new') {
        document.getElementById('modalTitle').innerText = "Yeni Müşteri Ekle";
        document.getElementById('custId').value = "";
        modal.show();
    } else {
        document.getElementById('modalTitle').innerText = "Müşteri Düzenle";
        
        fetch(API_URL, {
            method: "POST",
            body: new URLSearchParams({ action: "getCustomerDetail", id: id })
        })
        .then(r => r.json())
        .then(res => {
            if(res.status === 'success') {
                const d = res.data;
                document.getElementById('custId').value = d.id;
                document.getElementById('custName').value = d.name;
                document.getElementById('custType').value = d.type;
                document.getElementById('custStatus').value = d.status;
                document.getElementById('custCountry').value = d.country;
                document.getElementById('custCity').value = d.city;
                document.getElementById('custPhone').value = d.phone;
                document.getElementById('custEmail').value = d.email;
                document.getElementById('custWeb').value = d.website;
                document.getElementById('custAddress').value = d.address;
                document.getElementById('custPayment').value = d.payment;
                document.getElementById('custShipping').value = d.shipping;
                document.getElementById('custNotes').value = d.notes;
                modal.show();
            }
        });
    }
}

function saveCustomerData() {
    const btn = document.querySelector('.modal-footer .btn-primary');
    btn.disabled = true;
    btn.innerText = "Kaydediliyor...";

    const currentUser = JSON.parse(sessionStorage.getItem('crmUser'));

    const payload = {
        action: "saveCustomer",
        id: document.getElementById('custId').value,
        name: document.getElementById('custName').value,
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
        alert(res.message);
        btn.disabled = false;
        btn.innerText = "Kaydet";
        
        const modalEl = document.getElementById('customerDetailModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        loadCustomersModule(); // Listeyi yenile
    });
}

function deleteCustomerFunc(id) {
    if(confirm("Bu müşteri kaydını silmek istediğinize emin misiniz?")) {
        fetch(API_URL, {
            method: "POST",
            body: new URLSearchParams({ action: "deleteCustomer", id: id })
        })
        .then(r => r.json())
        .then(res => {
            if (res.status === 'error') {
                alert("HATA: " + res.message);
            } else {
                alert(res.message);
                loadCustomersModule();
            }
        });
    }
}
