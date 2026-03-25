/**
 * KYC 메인 — URL에서 callback 저장, 고객확인 시작 시 토큰 검증 후 이동
 */
(function initFromQuery() {
    if (typeof KYC !== 'undefined') KYC.captureCallbackFromUrl();
})();

(function initTermsAgreement() {
    const agreeAll = document.getElementById('termsAgreeAll');
    const termsPrivacy = document.getElementById('termsPrivacy');
    const termsUniqueId = document.getElementById('termsUniqueId');
    const btnStart = document.getElementById('btnStartKyc');
    if (!agreeAll || !termsPrivacy || !termsUniqueId || !btnStart) return;

    const STORAGE_PRIVACY = 'kyc_term_privacy_agreed';
    const STORAGE_UNIQUE = 'kyc_term_unique_agreed';

    function syncAgreeAllFromItems() {
        const both = termsPrivacy.checked && termsUniqueId.checked;
        agreeAll.indeterminate = false;
        agreeAll.checked = both;
    }

    function updateStartButton() {
        btnStart.disabled = !(termsPrivacy.checked && termsUniqueId.checked);
    }

    function persistTermStorage() {
        if (termsPrivacy.checked) {
            sessionStorage.setItem(STORAGE_PRIVACY, '1');
        } else {
            sessionStorage.removeItem(STORAGE_PRIVACY);
        }
        if (termsUniqueId.checked) {
            sessionStorage.setItem(STORAGE_UNIQUE, '1');
        } else {
            sessionStorage.removeItem(STORAGE_UNIQUE);
        }
    }

    function applyTermStorageToCheckboxes() {
        if (sessionStorage.getItem(STORAGE_PRIVACY) === '1') {
            termsPrivacy.checked = true;
        }
        if (sessionStorage.getItem(STORAGE_UNIQUE) === '1') {
            termsUniqueId.checked = true;
        }
    }

    function syncAllFromStorageAndUi() {
        applyTermStorageToCheckboxes();
        syncAgreeAllFromItems();
        updateStartButton();
    }

    agreeAll.addEventListener('change', () => {
        const on = agreeAll.checked;
        termsPrivacy.checked = on;
        termsUniqueId.checked = on;
        agreeAll.indeterminate = false;
        persistTermStorage();
        updateStartButton();
    });

    termsPrivacy.addEventListener('change', () => {
        syncAgreeAllFromItems();
        persistTermStorage();
        updateStartButton();
    });

    termsUniqueId.addEventListener('change', () => {
        syncAgreeAllFromItems();
        persistTermStorage();
        updateStartButton();
    });

    btnStart.addEventListener('click', () => startKyc());

    window.addEventListener('pageshow', () => {
        syncAllFromStorageAndUi();
    });

    syncAllFromStorageAndUi();
})();

async function startKyc() {
    try {
        const res = await KYC_API.verifyToken({});
        const h = res.response_header || {};
        if (h.result_code !== '0') {
            alert(h.std_mesg_content || '토큰 검증에 실패했습니다. 이용기관에서 다시 연결해 주세요.');
            return;
        }
    } catch (e) {
        console.warn('토큰 검증(프록시 미연결 시 무시될 수 있음):', e);
    }
    KYC.saveStep({ kyc_token_verified: true });
    KYC.goTo('basic-info/index.html');
}
