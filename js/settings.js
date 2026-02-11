/**
 * SETTINGS.JS - TAM SÜRÜM
 */
async function loadSettingsModule() {
    const contentDiv = document.getElementById('dynamicContent');
    document.getElementById('pageTitle').innerText = "Sistem Ayarları";
    
    // ROLÜ KÜÇÜK HARFE ÇEVİREREK KONTROL ET (Garantili yöntem)
    const userRole = (currentUser.role || "").toString().trim().toLowerCase();

    contentDiv.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-xl-6">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white fw-bold">Açılır Liste Yönetimi</div>
                    <div class="card-body">
                        ${['Musteri_Tipleri', 'Odeme_Sekilleri', 'Nakliye_Tipleri'].map(key => `
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-primary">${key.replace('_', ' ')}</label>
                                <div id="list-${key}" class="d-flex flex-wrap gap-2 mb-2"></div>
                                <div class="input-group input-group-sm">
                                    <input type="text" id="add-${key}" class="form-control" placeholder="Yeni ekle...">
                                    <button class="btn btn-success" onclick="addItem('${key}')"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
            <div class="col-12 col-xl-6" id="adminUserSection">
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                        Kullanıcı Yönetimi
                        <button class="btn btn-sm btn-primary" onclick="openUserModal('new')"><i class="fas fa-user-plus"></i> Yeni</button>
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
        </div>`;

    fetchAndRenderSettings();
    if (userRole === "admin") {
        fetchAndRenderUsers();
    } else {
        document.getElementById('adminUserSection').innerHTML = `
            <div class="card shadow-sm border-0 h-100 bg-light p-5 text-center text-muted">
                <i class="fas fa-lock fa-3x mb-3"></i>
                <h6>Kullanıcı yönetimi sadece Admin'e açıktır.</h6>
                <small>Mevcut Rolünüz: ${currentUser.role}</small>
            </div>`;
    }
}

async function fetchAndRenderSettings() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    if (res.status === "success") {
        Object.keys(res.data).forEach(key => {
            const div = document.getElementById("list-" + key);
            div.innerHTML = res.data[key].map(item => `
                <span class="badge bg-white text-dark border p-2 d-flex align-items-center shadow-sm">
                    <span>${item}</span>
                    <i class="fas fa-pencil-alt ms-2 text-primary pointer" style="cursor:pointer" onclick="editItem('${key}', '${item}')"></i>
                    <i class="fas fa-times ms-2 text-danger pointer" style="cursor:pointer" onclick="removeItem('${key}', '${item}')"></i>
                </span>
            `).join("");
        });
    }
}

async function editItem(key, oldVal) {
    const { value: newVal } = await Swal.fire({ title: 'Düzenle', input: 'text', inputValue: oldVal, showCancelButton: true });
    if (newVal && newVal !== oldVal) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
        const list = res.data[key].map(i => i === oldVal ? newVal : i);
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
        hideLoading(); fetchAndRenderSettings();
    }
}

async function removeItem(key, val) {
    const confirm = await Swal.fire({ title: 'Silinsin mi?', text: `"${val}" silinecek.`, icon: 'warning', showCancelButton: true });
    if (confirm.isConfirmed) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
        const list = res.data[key].filter(i => i !== val);
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
        hideLoading(); fetchAndRenderSettings();
    }
}

async function addItem(key) {
    const val = document.getElementById("add-" + key).value.trim();
    if (!val) return;
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
    const list = res.data[key]; list.push(val);
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
    document.getElementById("add-" + key).value = "";
    hideLoading(); fetchAndRenderSettings();
}

async function fetchAndRenderUsers() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getUsers", currentUser: currentUser }) }).then(r => r.json());
    if (res.status === "success") {
        document.getElementById("userTableBody").innerHTML = res.data.map(u => `
            <tr class="small">
                <td><strong>${u.name}</strong><br><small>${u.username}</small></td>
                <td>${u.role}</td>
                <td><span class="badge bg-${u.status === 'Aktif' ? 'success' : 'danger'}">${u.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="openUserModal('${u.id}', '${u.name}', '${u.username}', '${u.role}', '${u.status}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUserFunc('${u.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join("");
    }
}

async function deleteUserFunc(id) {
    const confirm = await Swal.fire({ title: 'Kullanıcı Silinsin mi?', icon: 'warning', showCancelButton: true });
    if (confirm.isConfirmed) {
        showLoading();
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteUser", userId: id, currentUser: currentUser }) }).then(r => r.json());
        hideLoading(); Swal.fire(res.status === "success" ? "Başarılı" : "Hata", res.message, res.status);
        if(res.status === "success") fetchAndRenderUsers();
    }
}

let userModalObj;
function openUserModal(id, name='', user='', role='personel', status='Aktif') {
    userModalObj = new bootstrap.Modal(document.getElementById('userModal'));
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = id === 'new' ? '' : id;
    if(id !== 'new') {
        document.getElementById("uName").value = name;
        document.getElementById("uUsername").value = user;
        document.getElementById("uRole").value = role;
        document.getElementById("uStatus").value = status;
    }
    userModalObj.show();
}

async function saveUserData() {
    const userData = { id: document.getElementById("userId").value, name: document.getElementById("uName").value, username: document.getElementById("uUsername").value, password: document.getElementById("uPassword").value, role: document.getElementById("uRole").value, status: document.getElementById("uStatus").value };
    showLoading();
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "saveUser", userData, currentUser }) }).then(r => r.json());
    hideLoading(); Swal.fire(res.status === "success" ? "Başarılı" : "Hata", res.message, res.status);
    if(res.status === "success") { userModalObj.hide(); fetchAndRenderUsers(); }
}
