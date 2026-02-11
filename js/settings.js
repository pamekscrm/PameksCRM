/**
 * SETTINGS.JS - SİSTEM AYARLARI VE KULLANICI YÖNETİMİ
 */

async function loadSettingsModule() {
    const contentDiv = document.getElementById('dynamicContent');
    const titleDiv = document.getElementById('pageTitle');
    titleDiv.innerText = "Sistem Ayarları";

    // Kullanıcı rolünü kontrol et (Küçük harfe çevirerek kontrol ediyoruz ki hata olmasın)
    const userRole = currentUser.role ? currentUser.role.toLowerCase() : "";

    contentDiv.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-xl-6">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white fw-bold text-dark">Açılır Liste Yönetimi</div>
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
                        <button class="btn btn-sm btn-primary" onclick="openUserModal('new')"><i class="fas fa-user-plus"></i> Yeni Kullanıcı</button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="small bg-light">
                                    <tr><th>Ad Soyad</th><th>Rol</th><th>Durum</th><th class="text-end">İşlem</th></tr>
                                </thead>
                                <tbody id="userTableBody">
                                    <tr><td colspan="4" class="text-center p-4">Yükleniyor...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchAndRenderSettings();

    // Admin kontrolü
    if (userRole === "admin") {
        fetchAndRenderUsers();
    } else {
        document.getElementById('adminUserSection').innerHTML = `
            <div class="card shadow-sm border-0 h-100 bg-light">
                <div class="card-body d-flex flex-column align-items-center justify-content-center text-muted">
                    <i class="fas fa-lock fa-3x mb-3 text-secondary"></i>
                    <p class="fw-bold">Kullanıcı yönetimi sadece Admin'e açıktır.</p>
                    <small>Mevcut Rolünüz: ${currentUser.role}</small>
                </div>
            </div>`;
    }
}

async function fetchAndRenderSettings() {
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
        if (res.status === "success") {
            renderBadgeList("Musteri_Tipleri", res.data.Musteri_Tipleri);
            renderBadgeList("Odeme_Sekilleri", res.data.Odeme_Sekilleri);
            renderBadgeList("Nakliye_Tipleri", res.data.Nakliye_Tipleri);
        }
    } catch (e) {
        Swal.fire("Hata", "Ayarlar yüklenirken bir sorun oluştu.", "error");
    }
}

function renderBadgeList(key, items) {
    const div = document.getElementById("list-" + key);
    if(!div) return;
    div.innerHTML = items.map(item => `
        <span class="badge bg-white text-dark border p-2 d-flex align-items-center shadow-sm">
            ${item} <i class="fas fa-times ms-2 text-danger pointer" style="cursor:pointer" onclick="removeItem('${key}', '${item}')"></i>
        </span>
    `).join("");
}

async function addItem(key) {
    const input = document.getElementById("add-" + key);
    const val = input.value.trim();
    if (!val) return;

    showLoading();
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
        const list = res.data[key];
        if (!list.includes(val)) {
            list.push(val);
            const updateRes = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) }).then(r => r.json());
            if(updateRes.status === "success") {
                Swal.fire({ icon: 'success', title: 'Eklendi', timer: 1000, showConfirmButton: false });
            }
        }
        input.value = "";
        fetchAndRenderSettings();
    } catch (e) {
        Swal.fire("Hata", "Ekleme yapılamadı.", "error");
    } finally {
        hideLoading();
    }
}

async function removeItem(key, val) {
    const result = await Swal.fire({
        title: 'Emin misiniz?',
        text: `"${val}" öğesini listeden silmek istiyor musunuz?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
        showLoading();
        try {
            const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getSettings" }) }).then(r => r.json());
            const list = res.data[key].filter(i => i !== val);
            await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateSettings", column: key, list: list }) });
            fetchAndRenderSettings();
            Swal.fire({ icon: 'success', title: 'Silindi', timer: 1000, showConfirmButton: false });
        } catch (e) {
            Swal.fire("Hata", "Silme işlemi başarısız.", "error");
        } finally {
            hideLoading();
        }
    }
}

async function fetchAndRenderUsers() {
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getUsers", currentUser: currentUser }) }).then(r => r.json());
        const tbody = document.getElementById("userTableBody");
        if (res.status === "success") {
            tbody.innerHTML = res.data.map(u => `
                <tr class="small">
                    <td><strong>${u.name}</strong><br><small class="text-muted">${u.username}</small></td>
                    <td><span class="badge bg-info text-dark">${u.role}</span></td>
                    <td><span class="badge bg-${u.status === 'Aktif' ? 'success' : 'danger'}">${u.status}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="openUserModal('${u.id}', '${u.name}', '${u.username}', '${u.role}', '${u.status}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join("");
        }
    } catch (e) {
        console.error("Kullanıcı listesi hatası:", e);
    }
}

let userModalObj;
function openUserModal(id, name = '', username = '', role = 'personel', status = 'Aktif') {
    const modalEl = document.getElementById('userModal');
    userModalObj = new bootstrap.Modal(modalEl);
    
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = id === 'new' ? '' : id;
    
    if(id !== 'new') {
        document.getElementById("uName").value = name;
        document.getElementById("uUsername").value = username;
        document.getElementById("uRole").value = role;
        document.getElementById("uStatus").value = status;
        document.getElementById("userModalTitle").innerText = "Kullanıcı Düzenle";
    } else {
        document.getElementById("userModalTitle").innerText = "Yeni Kullanıcı Ekle";
    }
    
    userModalObj.show();
}

async function saveUserData() {
    const name = document.getElementById("uName").value;
    const username = document.getElementById("uUsername").value;
    
    if(!name || !username) {
        return Swal.fire("Uyarı", "Ad Soyad ve Kullanıcı Adı boş bırakılamaz.", "warning");
    }

    const userData = {
        id: document.getElementById("userId").value,
        name: name,
        username: username,
        password: document.getElementById("uPassword").value,
        role: document.getElementById("uRole").value,
        status: document.getElementById("uStatus").value
    };

    showLoading();
    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "saveUser", userData, currentUser }) 
        }).then(r => r.json());
        
        if(res.status === "success") {
            Swal.fire("Başarılı", res.message, "success");
            userModalObj.hide();
            fetchAndRenderUsers();
        } else {
            Swal.fire("Hata", res.message, "error");
        }
    } catch (e) {
        Swal.fire("Hata", "İşlem sırasında bir hata oluştu.", "error");
    } finally {
        hideLoading();
    }
}
