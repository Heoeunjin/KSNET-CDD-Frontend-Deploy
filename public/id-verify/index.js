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

function applyVerifiedName() {
    const kycData = KYC.loadStep();
    const verifiedName = String(kycData.auth_nm || kycData.name || '').trim();
    const rrnNameEl = document.getElementById('inputResidentName');
    const dlNameEl = document.getElementById('inputLicenseName');
    if (rrnNameEl) rrnNameEl.value = verifiedName;
    if (dlNameEl) dlNameEl.value = verifiedName;
}

/* --- RRN --- */
Validation.bindImeAwareInput(document.getElementById('inputResidentSsnFront'), function (el) {
    el.value = el.value.replace(/\D/g, '').slice(0, 6);
    if (el.value.length === 6) document.getElementById('inputResidentSsnBack').focus();
    checkNextBtn();
});
(function initResidentSsnBackMasking() {
    const inputEl = document.getElementById('inputResidentSsnBack');
    const realEl = document.getElementById('inputResidentSsnBackReal');
    if (!inputEl || !realEl) return;

    function renderFromReal() {
        const digits = String(realEl.value || '').replace(/\D/g, '').slice(0, 7);
        realEl.value = digits;
        if (!digits) {
            inputEl.value = '';
        } else {
            inputEl.value = '●'.repeat(Math.max(0, digits.length - 1)) + digits.charAt(digits.length - 1);
        }
        try {
            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
        } catch (e) {}
    }

    inputEl.addEventListener('beforeinput', function (e) {
        if (e.isComposing) return;

        const type = e.inputType || '';

        if (type === 'insertText') {
            const d = String(e.data || '');
            if (!/^\d$/.test(d)) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            if (realEl.value.length >= 7) return;
            realEl.value = (String(realEl.value || '') + d).slice(0, 7);
            renderFromReal();
            checkNextBtn();
            return;
        }

        if (type === 'deleteContentBackward') {
            e.preventDefault();
            realEl.value = String(realEl.value || '').slice(0, -1);
            renderFromReal();
            checkNextBtn();
            return;
        }

        if (type === 'insertFromPaste') {
            // paste handler에서 처리
            return;
        }

        // 그 외(드래그 드롭 등) 입력은 막고 현재 상태 유지
        e.preventDefault();
        renderFromReal();
        checkNextBtn();
    });

    inputEl.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = (e.clipboardData && e.clipboardData.getData('text')) ? e.clipboardData.getData('text') : '';
        const digits = String(text || '').replace(/\D/g, '').slice(0, 7);
        realEl.value = digits;
        renderFromReal();
        checkNextBtn();
    });

    inputEl.addEventListener('compositionend', function () {
        renderFromReal();
        checkNextBtn();
    });

    inputEl.addEventListener('focus', function () {
        renderFromReal();
    });

    inputEl.addEventListener('click', function () {
        try {
            inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
        } catch (e) {}
    });

    // 초기 렌더
    renderFromReal();
})();
Validation.bindImeAwareInput(document.getElementById('inputResidentIssueDate'), function (el) {
    el.value = KYC.formatDate(el.value);
    checkNextBtn();
});

/* --- DL --- */
Validation.bindImeAwareInput(document.getElementById('inputLicenseNo'), function (el) {
    let digits = el.value.replace(/[^0-9]/g, '').slice(0, 12);
    let val = digits;
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 12) val = val.slice(0, 12) + '-' + val.slice(12, 14);
    el.value = val;
    checkNextBtn();
});
Validation.bindImeAwareInput(document.getElementById('inputLicenseSerial'), function (el) {
    el.value = el.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    checkNextBtn();
});
['inputDlIssue'].forEach(id => {
    const node = document.getElementById(id);
    if (!node) return;
    Validation.bindImeAwareInput(node, function (el) {
        el.value = KYC.formatDate(el.value);
        checkNextBtn();
    });
});

function checkNextBtn() {
    const t = getSelIdType();
    let ok = false;

    if (t === 'RRN') {
        const ssnFront = document.getElementById('inputResidentSsnFront').value;
        const ssnBack = document.getElementById('inputResidentSsnBackReal').value;
        const issue = document.getElementById('inputResidentIssueDate').value;
        // KSNET 가이드: 주민등록증 검증은 발급일자 + 주민번호(13자리) 기준
        ok = ssnFront.length === 6 && ssnBack.length === 7 && issue.length === 10;
    } else if (t === 'DL') {
        const licenseNo = document.getElementById('inputLicenseNo').value;
        const serial = document.getElementById('inputLicenseSerial').value;
        const di = document.getElementById('inputDlIssue').value;
        // KSNET 가이드: 운전면허 검증은 면허번호(12자리) + 생년월일(yyyymmdd) + 암호값
        ok = licenseNo.replace(/\D/g, '').length === 12
            && digits10(document.getElementById('inputDlIssue')).length === 8
            && serial.length > 0;
    }

    document.getElementById('btnNext').disabled = !ok;
}

function buildIdFields(t) {
    if (t === 'RRN') {
        const rrnFront = document.getElementById('inputResidentSsnFront').value.replace(/\D/g, '').slice(0, 6);
        const rrnBack = document.getElementById('inputResidentSsnBackReal').value.replace(/\D/g, '').slice(0, 7);
        return {
            idRrnIssue: digits10(document.getElementById('inputResidentIssueDate')),
            idRrnNo: rrnFront + rrnBack
        };
    }
    if (t === 'DL') {
        return {
            idDlNo: document.getElementById('inputLicenseNo').value.replace(/\D/g, ''),
            idDlIssue: digits10(document.getElementById('inputDlIssue')),
            idDlSecureno: document.getElementById('inputLicenseSerial').value.trim()
        };
    }
    return { idRrnIssue: '', idRrnNo: '' };
}

function showIdErrorModal(message) {
    const desc = document.getElementById('modalIdErrorDesc');
    if (desc) {
        desc.textContent = message || '신분증 인증에 실패했습니다. 입력값을 확인해 주세요.';
    }
    KYC.openModal('modalIdError');
}

async function goNext() {
    const kycData = KYC.loadStep();
    const cerTrUky = kycData.cer_tr_uky;
    const acnCerTrUky = kycData.acn_cer_tr_uky;

    if (!cerTrUky || !acnCerTrUky) {
        KYC.showErrorModal(
            '인증 정보가 없습니다. 처음부터 다시 진행해주세요.',
            '안내',
            () => KYC.goTo('../basic-info/index.html')
        );
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
            uploadFileSize: '0'
        });

        const header = res.response_header || {};
        const data = res.response_data || {};

        if (header.result_code !== '0') {
            const msg = header.std_mesg_content || data.std_mesg_content || '신분증 인증에 실패했습니다.';
            showIdErrorModal(msg);
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
        showIdErrorModal('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        btn.disabled = false;
    }
}

onIdTypeChange();
applyVerifiedName();
checkNextBtn();
