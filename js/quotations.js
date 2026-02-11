/**
 * js/quotations.js - ÜÇLÜ FİYAT & PAZARLIK SİSTEMİ (GÜNCEL)
 */

/**
 * Yeni teklif modalını açar
 */
function openQuotationModal(mode) {
    document.getElementById('quotationForm').reset();
    document.getElementById('quoteId').value = "";
    document.getElementById('quoteModalTitle').innerText = "Yeni Teklif Girişi";
    
    // Varsayılan tarih olarak bugünü ata
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    
    const modal = new bootstrap.Modal(document.getElementById('quotationModal'));
    modal.show();
}

/**
 * Mevcut teklifi pazarlık/düzenleme için modala yükler
 */
function editQuotation(q) {
    // HTML Elementlerini Backend'den gelen verilerle doldurur
    document.getElementById('quoteId').value = q.id || "";
    document.getElementById('quoteNo').value = q.quoteNo || "";
    document.getElementById('quoteModelCode').value = q.modelCode || "";
    document.getElementById('quoteFabric').value = q.fabric || "";
    
    // Üçlü Fiyat Sistemi Eşleşmesi
    document.getElementById('quoteTargetPrice').value = q.targetPrice || 0;
    document.getElementById('quoteOfferedPrice').value = q.offeredPrice || 0;
    document.getElementById('quoteAgreedPrice').value = q.agreedPrice || 0;
    
    document.getElementById('quoteCurrency').value = q.currency || "EUR";
    document.getElementById('quoteResult').value = q.result || "Açık";
    document.getElementById('quoteDesc').value = q.description || "";

    // Tarih formatlarını düzelt (yyyy-mm-dd)
    if(q.date) document.getElementById('quoteDate').value = formatDateForInput(q.date);
    if(q.validUntil) document.getElementById('quoteValidUntil').value = formatDateForInput(q.validUntil);
    if(q.leadTime) document.getElementById('quoteLeadTime').value = formatDateForInput(q.leadTime);

    document.getElementById('quoteModalTitle').innerText = "Teklif Düzenle / Pazarlık";
    const modal = new bootstrap.Modal(document.getElementById('quotationModal'));
    modal.show();
}

/**
 * Teklif verilerini sunucuya kaydeder
 */
async function saveQuotationData() {
    const custId = document.getElementById('dashboardCustId').value;
    
    // Form verilerini backend'in beklediği formatta toplar
    const quotationObj = {
        id: document.getElementById('quoteId').value,
        customerId: custId,
        quoteNo: document.getElementById('quoteNo').value.trim(),
        modelCode: document.getElementById('quoteModelCode').value.trim(),
        fabric: document.getElementById('quoteFabric').value.trim(),
        targetPrice: document.getElementById('quoteTargetPrice').value,  // Talep
        offeredPrice: document.getElementById('quoteOfferedPrice').value, // Teklif
        agreedPrice: document.getElementById('quoteAgreedPrice').value,   // Onay
        currency: document.getElementById('quoteCurrency').value,
        date: document.getElementById('quoteDate').value,
        validUntil: document.getElementById('quoteValidUntil').value,
        leadTime: document.getElementById('quoteLeadTime').value,
        result: document.getElementById('quoteResult').value,
        description: document.getElementById('quoteDesc').value.trim()
    };

    // Temel Doğrulama
    if(!quotationObj.quoteNo) {
        return Swal.fire("Uyarı", "Teklif No alanı zorunludur.", "warning");
    }

    showLoading();
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveQuotation",
                quotationData: quotationObj,
                currentUser: currentUser.name // Sadece isim gönderilir
            })
        }).then(r => r.json());

        hideLoading();
        if(res.status === 'success') {
            const modalEl = document.getElementById('quotationModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();
            
            fetchDetailQuotations(custId); // Listeyi yenile
            Swal.fire({ icon: 'success', title: 'Başarılı', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire("Hata", res.message, "error");
        }
    } catch (e) {
        hideLoading();
        Swal.fire("Hata", "Bağlantı sorunu oluştu.", "error");
    }
}

/**
 * Teklifi siler
 */
async function deleteQuotationFunc(id, customerId) {
    const r = await Swal.fire({
        title: 'Teklifi Sil?',
        text: "Bu teklif kaydı kalıcı olarak silinecektir!",
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
                body: JSON.stringify({ action: "deleteQuotation", quotationId: id })
            }).then(r => r.json());
            
            hideLoading();
            if(res.status === 'success') {
                fetchDetailQuotations(customerId);
                Swal.fire('Silindi!', res.message, 'success');
            }
        } catch (e) {
            hideLoading();
            Swal.fire('Hata!', 'İşlem başarısız.', 'error');
        }
    }
}

/**
 * Tarih objesini inputun anlayacağı yyyy-mm-dd formatına çevirir
 */
function formatDateForInput(dateStr) {
    if(!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}
