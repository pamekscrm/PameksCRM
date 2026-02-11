/**
 * js/attachments.js - BOYUT VE TÜR KONTROLLÜ DOSYA TRANSFER MANTIĞI
 */

async function fetchDetailAttachments(customerId) {
    const container = document.getElementById('tab-attachments');
    if(!container) return;

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3 align-items-center">
            <h6 class="m-0 fw-bold text-dark">Müşteri Ekleri</h6>
            <button class="btn btn-sm btn-primary" onclick="openAttachmentModal()">
                <i class="fas fa-upload me-1"></i> Yeni Dosya Yükle
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle">
                <thead class="table-light small text-uppercase fw-bold">
                    <tr>
                        <th>Dosya</th>
                        <th>Etiket / Açıklama</th>
                        <th>Yükleyen / Tarih</th>
                        <th class="text-end">İşlem</th>
                    </tr>
                </thead>
                <tbody id="detailAttachmentBody">
                    <tr><td colspan="4" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>
                </tbody>
            </table>
        </div>`;

    try {
        const res = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "getAttachments", customerId: customerId }) 
        }).then(r => r.json());

        const tbody = document.getElementById('detailAttachmentBody');
        tbody.innerHTML = "";

        if(res.status === "success" && res.data.length > 0) {
            res.data.forEach(at => {
                const dateStr = new Date(at.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const icon = getFileIcon(at.type);
                
                tbody.innerHTML += `
                    <tr class="small">
                        <td>
                            <div class="d-flex align-items-center">
                                <i class="fas ${icon} fa-2x me-2 opacity-75"></i>
                                <div class="text-truncate" style="max-width: 200px;">
                                    <strong>${at.name}</strong><br>
                                    <small class="text-muted">${at.type.split('/')[1].toUpperCase()}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">${at.tag || 'Genel'}</span><br>
                            <small class="text-muted">${at.description || '-'}</small>
                        </td>
                        <td>
                            <small><strong>${at.user}</strong><br>${dateStr}</small>
                        </td>
                        <td class="text-end text-nowrap">
                            <a href="${at.url}" target="_blank" class="btn btn-sm btn-link text-primary me-2 p-0" title="Görüntüle"><i class="fas fa-external-link-alt"></i></a>
                            <button class="btn btn-sm btn-link text-danger p-0" title="Sil" onclick="deleteAttachmentFunc('${at.id}', '${customerId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        } else { 
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Henüz dosya eklenmemiş.</td></tr>'; 
        }
    } catch (err) {
        document.getElementById('detailAttachmentBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Ekler yüklenirken hata oluştu.</td></tr>';
    }
}

function openAttachmentModal() {
    document.getElementById('attachmentForm').reset();
    document.getElementById('uploadProgress').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('attachmentModal')).show();
}

function processFileUpload() {
    const fileInput = document.getElementById('attFile');
    const file = fileInput.files[0];
    const custId = document.getElementById('dashboardCustId').value;
    
    if(!file) return Swal.fire("Uyarı", "Lütfen bir dosya seçin.", "warning");

    // 1. BOYUT KONTROLÜ (3 MB)
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB in bytes
    if(file.size > MAX_SIZE) {
        return Swal.fire("Hata", "Dosya boyutu çok büyük! Maksimum 3 MB yükleyebilirsiniz.", "error");
    }

    // 2. TÜR KONTROLÜ
    const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 'image/png', 'image/gif',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
        'application/msword'
    ];
    if(!allowedTypes.includes(file.type)) {
        return Swal.fire("Hata", "Sadece PDF, Resim, Word ve Excel dosyaları kabul edilmektedir.", "error");
    }

    const reader = new FileReader();
    document.getElementById('uploadProgress').classList.remove('d-none');

    reader.onload = async function(e) {
        const payload = {
            action: "uploadFile",
            customerId: custId,
            fileName: file.name,
            fileData: e.target.result,
            tag: document.getElementById('attTag').value.trim(),
            description: document.getElementById('attDesc').value.trim(),
            currentUser: currentUser
        };

        try {
            const res = await fetch(API_URL, { 
                method: "POST", 
                body: JSON.stringify(payload) 
            }).then(r => r.json());

            document.getElementById('uploadProgress').classList.add('d-none');
            
            if(res.status === 'success') {
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('attachmentModal'));
                if(modalInstance) modalInstance.hide();
                fetchDetailAttachments(custId);
                Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire("Hata", res.message, "error");
            }
        } catch (err) {
            document.getElementById('uploadProgress').classList.add('d-none');
            Swal.fire("Hata", "Bağlantı sorunu oluştu.", "error");
        }
    };
    reader.readAsDataURL(file);
}

async function deleteAttachmentFunc(attId, customerId) {
    const r = await Swal.fire({ 
        title: 'Eki Sil?', 
        text: "Bu dosya kaydı CRM'den kaldırılacaktır!", 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'Vazgeç'
    });

    if (r.isConfirmed) {
        showLoading();
        try {
            const res = await fetch(API_URL, { 
                method: "POST", 
                body: JSON.stringify({ action: "deleteAttachment", attachmentId: attId }) 
            }).then(r => r.json());
            
            hideLoading();
            if(res.status === 'success') {
                fetchDetailAttachments(customerId);
                Swal.fire('Silindi!', res.message, 'success');
            }
        } catch (e) {
            hideLoading();
            Swal.fire('Hata!', 'İşlem başarısız.', 'error');
        }
    }
}

function getFileIcon(mimeType) {
    if(mimeType.includes('pdf')) return 'fa-file-pdf text-danger';
    if(mimeType.includes('image')) return 'fa-file-image text-success';
    if(mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return 'fa-file-excel text-success';
    if(mimeType.includes('word') || mimeType.includes('wordprocessingml')) return 'fa-file-word text-primary';
    return 'fa-file-alt text-secondary';
}
