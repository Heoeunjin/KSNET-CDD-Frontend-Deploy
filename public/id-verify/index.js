/**
 * KSNET KYC - 신분증 (명세 selIdTypeVal: RRN / DL)
 */

function getSelIdType() {
    return document.getElementById('selIdType').value;
}

function selectIdType(value) {
    document.getElementById('selIdType').value = value;
    onIdTypeChange();
}

function onIdTypeChange() {
    const v = getSelIdType();
    document.querySelectorAll('.id-pane').forEach(p => {
        p.style.display = 'none';
    });
    const map = { RRN: 'paneRRN', DL: 'paneDL' };
    const id = map[v];
    if (id) document.getElementById(id).style.display = 'block';

    document.querySelectorAll('.id-type-tab').forEach(btn => {
        const on = btn.dataset.value === v;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    checkNextBtn();
}

function digits10(el) {
    return (el && el.value) ? el.value.replace(/\D/g, '') : '';
}

/* --- RRN --- */
document.getElementById('inputResidentName').addEventListener('input', function (e) {
    if (e.isComposing) return;
    this.value = this.value.replace(/[^가-힣]/g, '');
    checkNextBtn();
});
document.getElementById('inputResidentSsnFront').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
    if (this.value.length === 6) document.getElementById('inputResidentSsnBack').focus();
    checkNextBtn();
});
document.getElementById('inputResidentSsnBack').addEventListener('input', function () {
    const real = document.getElementById('inputResidentSsnBackReal');
    const digits = this.value.replace(/\D/g, '').slice(0, 1);
    real.value = digits;
    if (digits.length === 0) this.value = '';
    else {
        this.value = digits + '●'.repeat(6);
        try { this.setSelectionRange(1, 1); } catch (e) {}
    }
    checkNextBtn();
});
document.getElementById('inputResidentIssueDate').addEventListener('input', function () {
    this.value = KYC.formatDate(this.value);
    checkNextBtn();
});

/* --- DL --- */
document.getElementById('inputLicenseName').addEventListener('input', function (e) {
    if (e.isComposing) return;
    this.value = this.value.replace(/[^가-힣]/g, '');
    checkNextBtn();
});
document.getElementById('inputLicenseSsnFront').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
    if (this.value.length === 6) document.getElementById('inputLicenseSsnBack').focus();
    checkNextBtn();
});
document.getElementById('inputLicenseSsnBack').addEventListener('input', function () {
    const real = document.getElementById('inputLicenseSsnBackReal');
    const digits = this.value.replace(/\D/g, '').slice(0, 1);
    real.value = digits;
    if (digits.length === 0) this.value = '';
    else {
        this.value = digits + '●'.repeat(6);
        try { this.setSelectionRange(1, 1); } catch (e) {}
    }
    checkNextBtn();
});
document.getElementById('inputLicenseNo').addEventListener('input', function () {
    let val = this.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 12) val = val.slice(0, 12) + '-' + val.slice(12, 14);
    this.value = val;
    checkNextBtn();
});
document.getElementById('inputLicenseSerial').addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    checkNextBtn();
});
['inputDlIssue', 'inputDlExpire'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        this.value = KYC.formatDate(this.value);
        checkNextBtn();
    });
});
document.getElementById('inputDlArea').addEventListener('input', checkNextBtn);

function checkNextBtn() {
    const t = getSelIdType();
    let ok = false;

    if (t === 'RRN') {
        const name = document.getElementById('inputResidentName').value;
        const ssnFront = document.getElementById('inputResidentSsnFront').value;
        const ssnBack = document.getElementById('inputResidentSsnBackReal').value;
        const issue = document.getElementById('inputResidentIssueDate').value;
        ok = name.length > 0 && ssnFront.length === 6 && ssnBack.length === 1 && issue.length === 10;
    } else if (t === 'DL') {
        const name = document.getElementById('inputLicenseName').value;
        const ssnFront = document.getElementById('inputLicenseSsnFront').value;
        const ssnBack = document.getElementById('inputLicenseSsnBackReal').value;
        const licenseNo = document.getElementById('inputLicenseNo').value;
        const serial = document.getElementById('inputLicenseSerial').value;
        const di = document.getElementById('inputDlIssue').value;
        const de = document.getElementById('inputDlExpire').value;
        const area = document.getElementById('inputDlArea').value.trim();
        ok = name.length > 0 && ssnFront.length === 6 && ssnBack.length === 1
            && licenseNo.length >= 13 && serial.length > 0
            && di.length === 10 && de.length === 10 && area.length > 0;
    }

    document.getElementById('btnNext').disabled = !ok;
}

function buildIdFields(t) {
    if (t === 'RRN') {
        return {
            idRrnIssue: digits10(document.getElementById('inputResidentIssueDate')),
            idRrnNo: document.getElementById('inputResidentSsnFront').value
        };
    }
    if (t === 'DL') {
        return {
            idDlNo: document.getElementById('inputLicenseNo').value.replace(/\D/g, ''),
            idDlIssue: digits10(document.getElementById('inputDlIssue')),
            idDlExpire: digits10(document.getElementById('inputDlExpire')),
            idDlArea: document.getElementById('inputDlArea').value.trim()
        };
    }
    return { idRrnIssue: '', idRrnNo: '' };
}

async function goNext() {
    const kycData = KYC.loadStep();
    const cerTrUky = kycData.cer_tr_uky;
    const acnCerTrUky = kycData.acn_cer_tr_uky;

    if (!cerTrUky || !acnCerTrUky) {
        alert('인증 정보가 없습니다. 처음부터 다시 진행해주세요.');
        KYC.goTo('../basic-info/index.html');
        return;
    }

    const t = getSelIdType();
    const idFields = buildIdFields(t);
    const btn = document.getElementById('btnNext');
    btn.disabled = true;

    try {
        const res = await KYC_API.submitIdCard({
            cer_tr_uky: cerTrUky,
            acn_cer_tr_uky: acnCerTrUky,
            selIdTypeVal: t,
            idFields,
            uploadFileName: '',
            savedFileName: '',
            uploadFileSize: ''
        });

        const header = res.response_header || {};
        const data = res.response_data || {};

        if (header.result_code !== '0') {
            const msg = header.std_mesg_content || data.std_mesg_content || '신분증 인증에 실패했습니다.';
            alert(msg);
            btn.disabled = false;
            return;
        }

        KYC.saveStep({
            idType: t,
            ksnet_svc_tkn_frm: data.ksnet_svc_tkn_frm,
            card_no: data.card_no
        });
        KYC.goTo('../complete/index.html');
    } catch (err) {
        console.error('신분증 등록 오류:', err);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        btn.disabled = false;
    }
}

onIdTypeChange();
checkNextBtn();
