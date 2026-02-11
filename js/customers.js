/**
 * js/customers.js - TAM KOD
 * Liste yükleme ve Creator (Olusturan) sütunu entegreli sürüm
 */

let globalSettings = { Musteri_Tipleri: [], Odeme_Sekilleri: [], Nakliye_Tipleri: [] };

function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

async function fetchSettings() {
    // Veriyi JSON olarak göndermek daha sağlıklıdır
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
    if (selectedValue && !items.includes(selectedValue)) {
        const opt = document.createElement('option');
        opt.value = selectedValue;
        opt.innerText = selectedValue + " (Arşiv)";
        opt.selected = true;
        select.appendChild(opt);
    }
}

async function loadCustomersModule() {
    await fetchSettings();
    const contentDiv = document.getElementById('dynamicContent');
    const titleDiv = document.getElementById('pageTitle');
    titleDiv.innerText = "Müşteri Listesi";
    
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
                            <th>Ülke</th>
                            <th>Şehir</th>
                            <th>Durum</th>
                            <th>Oluşturan</th>
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
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

    try {
        // Liste çekilirken hem JSON hem URLSearchParams desteği için:
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
                        <td><small class="text-muted">${cust.creator || 'Admin'}</small></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-light border" onclick="openCustomerDetail('${cust.id}')"><i class="fas fa-edit text-primary"></i></button>
                            <button class="btn btn-sm btn-light border" onclick="deleteCustomerFunc('${cust.id}')"><i class="fas fa-trash text-danger"></i></button>
                        </td>
                    </tr>`;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-4">Kayıt bulunamadı.</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger p-4">Veri çekme hatası: ${error.message}</td></tr>`;
    }
}

// Diğer fonksiyonlar (openCustomerDetail, saveCustomerData, deleteCustomerFunc) paylaştığınla aynı kalabilir.
// Ancak fetch işlemlerinde body: JSON.stringify({...}) kullanımına dikkat et.
