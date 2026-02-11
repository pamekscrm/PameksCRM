/**
 * SETTINGS.JS - SİSTEM AYARLARI VE KULLANICI YÖNETİMİ
 */

async function loadSettingsModule() {
    const contentDiv = document.getElementById('dynamicContent');
    const titleDiv = document.getElementById('pageTitle');
    titleDiv.innerText = "Sistem Ayarları";

    contentDiv.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-xl-6">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white fw-bold">Açılır Liste Yönetimi</div>
                    <div class="card-body">
                        <div class="mb-4">
                            <label class="form-label fw-bold small text-primary">Müşteri Tipleri</label>
                            <div id="list-Musteri_Tipleri" class="d-flex flex-wrap gap-2 mb-2"></div>
                            <div class="input-group input-group-sm">
                                <input type="text" id="add-Musteri_Tipleri" class="form-control" placeholder="Yeni ekle...">
                                <button class="btn btn-success" onclick="addItem('Musteri_Tipleri')"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="form-label fw-bold small text-primary">Ödeme Şekilleri</label>
                            <div id="list-Odeme_Sekilleri" class="d-flex flex-wrap gap-2 mb-2"></div>
                            <div class="input-group input-group-sm">
                                <input type="text" id="add-Odeme_Sekilleri" class="form-control" placeholder="Yeni ekle...">
                                <button class="btn btn-success" onclick="addItem('Odeme_Sekilleri')"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div>
                            <label class="form-label fw-bold small text-primary">Nakliye Tipleri</label>
                            <div id="list-Nakliye_Tipleri" class="d-flex flex-wrap gap-2 mb-2"></div>
                            <div class="input-group input-group-sm">
                                <input type="text" id="add-Nakliye_Tipleri" class="form-control" placeholder="Yeni ekle...">
                                <button class="btn btn-success" onclick="addItem('Nakliye_Tipleri')"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-xl-6" id="adminUserSection">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                        Kullanıcı Yönetimi
                        <button class="btn btn-sm btn-primary" onclick="openUserModal('new')"><i class="fas fa-user-plus"></i></button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="small bg-light">
                                    <tr><th>Ad Soyad</th><th>Rol</th><th>Durum</th><th class="text-end">İşlem</th></tr>
                                </thead>
                                <tbody id="userTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchAndRenderSettings();
    if (currentUser.role === "admin") {
        fetchAndRenderUsers();
    } else {
        document.getElementById('adminUserSection').innerHTML = `
            <div class="card shadow-sm border-0 h-100 bg-light">
                <div class="card-body d-flex align-items-center justify-content-center text-muted">
                    <i class="fas fa-lock me-2"></i> Kullanıcı yönetimi sadece Admin'e açıktır.
                </div>
            </div>`;
    }
}

// AYARLARI ÇEK VE LİSTELE
async function fetchAndRenderSettings() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    if (res.status === "success") {
        renderBadgeList("Musteri_Tipleri", res.data.Musteri_Tipleri);
        renderBadgeList("Odeme_Sekilleri", res.data.Odeme_Sekilleri);
        renderBadgeList("Nakliye_Tipleri", res.data.Nakliye_Tipleri);
    }
}

function renderBadgeList(key, items) {
    const div = document.getElementById("list-" + key);
    div.innerHTML = items.map(item => `
        <span class="badge bg-white text-dark border p-2 d-flex align-items-center">
            ${item} <i class="fas fa-times ms-2 text-danger pointer" style="cursor:pointer" onclick="removeItem('${key}', '${item}')"></i>
        </span>
    `).join("");
}

async function addItem(key) {
    const val = document.getElementById("add-" + key).value.trim();
    if (!val) return;
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    const list = res.data[key];
    if (!list.includes(val)) list.push(val);
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
    document.getElementById("add-" + key).value = "";
    hideLoading();
    fetchAndRenderSettings();
}

async function removeItem(key, val) {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    const list = res.data[key].filter(i => i !== val);
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
    hideLoading();
    fetchAndRenderSettings();
}

// KULLANICI YÖNETİMİ
async function fetchAndRenderUsers() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getUsers", currentUser: currentUser }) }).then(r => r.json());
    const tbody = document.getElementById("userTableBody");
    if (res.status === "success") {
        tbody.innerHTML = res.data.map(u => `
            <tr class="small">
                <td>${u.name}<br><small class="text-muted">${u.username}</small></td>
                <td><span class="badge bg-light text-dark">${u.role}</span></td>
                <td><span class="badge bg-${u.status === 'Aktif' ? 'success' : 'danger'}">${u.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="openUserModal('${u.id}')"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join("");
    }
}

let userModal;
function openUserModal(id) {
    userModal = new bootstrap.Modal(document.getElementById('userModal'));
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = id === 'new' ? '' : id;
    userModal.show();
}

async function saveUserData() {
    const userData = {
        id: document.getElementById("userId").value,
        name: document.getElementById("uName").value,
        username: document.getElementById("uUsername").value,
        password: document.getElementById("uPassword").value,
        role: document.getElementById("uRole").value,
        status: document.getElementById("uStatus").value
    };
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "saveUser", userData, currentUser }) }).then(r => r.json());
    hideLoading();
    Swal.fire(res.status === "success" ? "Başarılı" : "Hata", res.message, res.status);
    if(res.status === "success") { userModal.hide(); fetchAndRenderUsers(); }
}
