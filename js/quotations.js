/**
 * js/quotations.js - TEKLİF VE PAZARLIK YÖNETİMİ MANTIĞI
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
    document.getElementById('quoteId').value = q.id;
    document.getElementById('quoteNo').value = q.quoteNo;
    document.getElementById('quoteModelCode').value = q.modelCode || "";
    document.getElementById('quoteFabric').value = q.fabric || "";
    document.getElementById('quoteQuantity').value = q.quantity || 0;
    document.getElementById('quoteUnitPrice').value = q.unitPrice || 0;
    document.getElementById('quoteCurrency').value = q.currency || "EUR";
    document.getElementById('quoteResult').value = q.result || "Açık";
    document.getElementById('quoteDesc').value = q.description || "";

    // Tarih formatlarını düzelt (yyyy-mm-dd formatına çevir)
    if(q.date) document.getElementById('quoteDate').value = new Date(q.date).toISOString().split('T')[0];
    if(q.validUntil) document.getElementById('quoteValidUntil').value = new Date(q.validUntil).toISOString().split('T')[0];
    if(q.leadTime) document.getElementById('quoteLeadTime').value = new Date(q.leadTime).toISOString().split('T')[0];

    document.getElementById('quoteModalTitle').innerText = "Teklif Düzenle / Pazarlık";
    const modal = new bootstrap.Modal(document.getElementById('quotationModal'));
    modal.show();
}

/**
 * Teklif verilerini sunucuya kaydeder (Pazarlık logu backend'de tutulur)
 */
async function saveQuotationData() {
    const custId = document.getElementById('dashboardCustId').value;
    const quotationObj = {
        id: document.getElementById('quoteId').value,
        customerId: custId,
        quoteNo: document.getElementById('quoteNo').value.trim(),
        modelCode: document.getElementById('quoteModelCode').value.trim(),
        fabric: document.getElementById('quoteFabric').value.trim(),
        quantity: document.getElementById('quoteQuantity').value,
        unitPrice: document.getElementById('quoteUnitPrice').value,
        currency: document.getElementById('quoteCurrency').value,
        date: document.getElementById('quoteDate').value,
        validUntil: document.getElementById('quoteValidUntil').value,
        leadTime: document.getElementById('quoteLeadTime').value,
        result: document.getElementById('quoteResult').value,
        description: document.getElementById('quoteDesc').value.trim()
    };

    if(!quotationObj.quoteNo || !quotationObj.unitPrice) {
        return Swal.fire("Uyarı", "Teklif No ve Birim Fiyat alanları zorunludur.", "warning");
    }

    showLoading();
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveQuotation",
                quotationData: quotationObj,
                currentUser: currentUser
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
