/**
 * KSNET KYC - 추가정보 입력 (gubun=5 명세 필드 반영)
 */

let ownerStatus = 'yes';

function initCustomSelect(boxId, displayId, hiddenId, onChange) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const display = document.getElementById(displayId);
    const hidden = document.getElementById(hiddenId);
    const dropdown = box.querySelector('.custom-select-dropdown');
    const options = box.querySelectorAll('.custom-select-option');

    function ensureDropdownVisibleBelow() {
        const body = document.querySelector('.kyc-body');
        if (!body || !dropdown) return;

        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const bottomPadding = 12;
        const dropdownRect = dropdown.getBoundingClientRect();

        const overflow = dropdownRect.bottom + bottomPadding - viewportHeight;
        if (overflow > 0) {
            body.scrollTop += overflow;
        }
    }

    box.addEventListener('click', function (e) {
        const isOpen = box.classList.contains('is-open');
        document.querySelectorAll('.custom-select.is-open').forEach(el => {
            if (el !== box) el.classList.remove('is-open');
        });
        const willOpen = !isOpen;
        box.classList.toggle('is-open', willOpen);
        if (willOpen) requestAnimationFrame(ensureDropdownVisibleBelow);
    });

    dropdown.addEventListener('click', function (e) {
        e.stopPropagation();
        const opt = e.target.closest('.custom-select-option');
        if (!opt) return;
        const value = opt.dataset.value;
        const label = opt.textContent.trim();

        hidden.value = value;
        display.textContent = label;
        display.classList.add('is-selected');

        options.forEach(o => o.classList.toggle('is-selected', o === opt));
        box.classList.remove('is-open');
        if (typeof onChange === 'function') onChange(value);
        checkNextBtn();
    });

    window.addEventListener('resize', function () {
        if (!box.classList.contains('is-open')) return;
        requestAnimationFrame(ensureDropdownVisibleBelow);
    });
}

initCustomSelect('occupationBox', 'occupationDisplay', 'selectOccupation');
initCustomSelect('fundSourceBox', 'fundSourceDisplay', 'selectFundSource', onFundSourceChange);
initCustomSelect('txPurposeBox', 'txPurposeDisplay', 'selectTxPurpose');
initCustomSelect('annIncmBox', 'annIncmDisplay', 'selectAnnIncm');
initCustomSelect('pepBox', 'pepDisplay', 'selectPep');
initCustomSelect('realOwnRltnBox', 'realOwnRltnDisplay', 'selectRealOwnRltn');

document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.is-open').forEach(el => el.classList.remove('is-open'));
    }
});

function onFundSourceChange() {
    const v = document.getElementById('selectFundSource').value;
    const fund = FUND_MAP[v];
    const block = document.getElementById('fundEtcBlock');
    if (block) block.style.display = fund && fund.etc === 'Y' ? 'block' : 'none';
}

function toggleLiveAddress() {
    const on = document.getElementById('chkLiveDifferent').checked;
    document.getElementById('liveAddressBlock').style.display = on ? 'block' : 'none';
    const ownerSection = document.getElementById('ownerSection');
    if (ownerSection) {
        ownerSection.classList.toggle('after-live-address', on);
    }
    checkNextBtn();
}

/**
 * 실거주 주소 검색 — 행안부 도로명주소 팝업
 * opener.jusoCallBack (인자 25개, jusoPopup.jsp 동일 순서)
 */
function searchAddressLive() {
    const width = 500;
    const height = 600;
    const left = Math.round((window.screen.width - width) / 2);
    const top = Math.round((window.screen.height - height) / 2);
    const base = window.location.origin;
    const popupUrl = base + '/juso-popup.html';
    KYC.openJusoPopup(
        popupUrl,
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes'
    );
}

window.jusoCallBack = function (
    roadFullAddr,
    roadAddrPart1,
    addrDetail,
    roadAddrPart2,
    engAddr,
    jibunAddr,
    zipNo
) {
    var p1 = (roadAddrPart1 || '').trim();
    var p2 = (roadAddrPart2 || '').trim();
    var mainAddr = p1 ? [p1, p2].filter(Boolean).join(' ').trim() : (roadFullAddr || '').trim();
    var zone = String(zipNo != null ? zipNo : '').replace(/\D/g, '');
    var detail = (addrDetail != null ? String(addrDetail) : '').trim();

    document.getElementById('inputLiveZip').value = zone;
    document.getElementById('inputLiveAddr1').value = mainAddr;
    document.getElementById('inputLiveAddr2').value = detail;
    document.getElementById('inputLiveAddr2').focus();
    checkNextBtn();
    KYC.closeJusoPopup();
};

['inputCompNm', 'inputDeptNm', 'inputLiveZip', 'inputLiveAddr1', 'inputLiveAddr2',
    'inputFrgnRegNo', 'inputRsdncCntry', 'inputFundEtcCntn', 'inputRealOwnNm'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', checkNextBtn);
});

function selectOwner(value) {
    ownerStatus = value;
    document.getElementById('ownerYes').classList.toggle('is-selected', value === 'yes');
    document.getElementById('ownerNo').classList.toggle('is-selected', value === 'no');

    const realBlock = document.getElementById('realOwnerBlock');
    if (realBlock) realBlock.style.display = 'none';

    if (value === 'no') {
        const btn = document.getElementById('btnNext');
        if (btn) btn.disabled = true;
        KYC.openModal('modalNotOwner');
    }

    checkNextBtn();
}

function closeNotOwnerModal() {
    KYC.closeModal('modalNotOwner');
    document.getElementById('btnNext').disabled = true;
}

function checkNextBtn() {
    const occupation = document.getElementById('selectOccupation').value;
    const fundSource = document.getElementById('selectFundSource').value;
    const txPurpose = document.getElementById('selectTxPurpose').value;
    const annIncm = document.getElementById('selectAnnIncm').value;
    const pep = document.getElementById('selectPep').value;

    let ok = occupation !== '' && fundSource !== '' && txPurpose !== '' && annIncm !== '' && pep !== '';

    const liveDiff = document.getElementById('chkLiveDifferent').checked;
    if (liveDiff) {
        const z = document.getElementById('inputLiveZip').value.trim();
        const a1 = document.getElementById('inputLiveAddr1').value.trim();
        const a2 = document.getElementById('inputLiveAddr2').value.trim();
        ok = ok && z.length >= 5 && a1.length > 0 && a2.length > 0;
    }

    const kyc = KYC.loadStep();
    if ((kyc.nationality || 'KR').toUpperCase() !== 'KR') {
        const fr = document.getElementById('inputFrgnRegNo').value.trim();
        const rc = document.getElementById('inputRsdncCntry').value.trim();
        ok = ok && fr.length > 0 && rc.length > 0;
    }

    const fund = FUND_MAP[fundSource];
    if (fund && fund.etc === 'Y') {
        const etc = document.getElementById('inputFundEtcCntn').value.trim();
        ok = ok && etc.length > 0;
    }

    if (ownerStatus === 'no') ok = false;
    else ok = ok && ownerStatus === 'yes';

    document.getElementById('btnNext').disabled = !ok;
}

const OCCP_MAP = {
    employee: 'EMPLOYEE', executive: 'EMPLOYEE', self_employed: 'SELF',
    unemployed: 'OTHER', student: 'STUDENT', housewife: 'HOUSEWIFE',
    retired: 'RETIRED', public_official: 'PUBLIC', professional: 'PROFESSIONAL'
};
const FUND_MAP = {
    salary: { slry: 'Y', bsns: 'N', invt: 'N', inht: 'N', real: 'N', etc: 'N' },
    retirement: { slry: 'Y', bsns: 'N', invt: 'N', inht: 'Y', real: 'N', etc: 'N' },
    loan: { slry: 'N', bsns: 'N', invt: 'N', inht: 'N', real: 'N', etc: 'Y' },
    allowance: { slry: 'N', bsns: 'N', invt: 'N', inht: 'N', real: 'N', etc: 'Y' },
    inheritance: { slry: 'N', bsns: 'N', invt: 'N', inht: 'Y', real: 'N', etc: 'N' },
    property_sale: { slry: 'N', bsns: 'N', invt: 'N', inht: 'N', real: 'Y', etc: 'N' },
    business: { slry: 'N', bsns: 'Y', invt: 'N', inht: 'N', real: 'N', etc: 'N' },
    rental: { slry: 'N', bsns: 'N', invt: 'N', inht: 'N', real: 'Y', etc: 'N' },
    capital_gain: { slry: 'N', bsns: 'N', invt: 'Y', inht: 'N', real: 'N', etc: 'N' },
    financial: { slry: 'N', bsns: 'N', invt: 'Y', inht: 'N', real: 'N', etc: 'N' }
};
const TXPURPOSE_MAP = {
    shopping: 'OTHER', investment: 'INVEST', business: 'TRADE',
    living: 'SAVE', online_shopping: 'OTHER'
};

function setCustomSelectByValue(boxId, displayId, hiddenId, value) {
    if (value == null || value === '') return;
    const box = document.getElementById(boxId);
    const display = document.getElementById(displayId);
    const hidden = document.getElementById(hiddenId);
    if (!box || !display || !hidden) return;
    const options = box.querySelectorAll('.custom-select-option');
    let chosen = null;
    options.forEach(function (o) {
        if (o.dataset.value === value) chosen = o;
    });
    if (!chosen) return;
    hidden.value = value;
    display.textContent = chosen.textContent.trim();
    display.classList.add('is-selected');
    options.forEach(function (o) {
        o.classList.toggle('is-selected', o === chosen);
    });
}

function inferFundSourceFromSession(k) {
    if (k.fund_slry_yn === 'Y') return 'salary';
    if (k.fund_bsns_yn === 'Y') return 'business';
    if (k.fund_invt_yn === 'Y') return 'financial';
    if (k.fund_inht_yn === 'Y') return 'inheritance';
    if (k.fund_real_yn === 'Y') return 'rental';
    if (k.fund_etc_yn === 'Y') return 'allowance';
    return '';
}

function invtPurpApiToUi(code) {
    const m = {
        INVEST: 'investment',
        SAVE: 'living',
        TRADE: 'business',
        OTHER: 'shopping'
    };
    return m[code] || '';
}

function occpApiToUi(code) {
    const m = {
        EMPLOYEE: 'employee',
        SELF: 'self_employed',
        PUBLIC: 'public_official',
        PROFESSIONAL: 'professional',
        STUDENT: 'student',
        HOUSEWIFE: 'housewife',
        RETIRED: 'retired',
        OTHER: 'unemployed'
    };
    return m[code] || '';
}

/**
 * gubun=2 재진입(cur_step 05) 등 세션에 내려온 추가정보 필드를 폼에 반영
 */
function applyAdditionalPrefillFromSession() {
    const k = KYC.loadStep();

    const occpUi = occpApiToUi(k.occp_cd);
    if (occpUi) setCustomSelectByValue('occupationBox', 'occupationDisplay', 'selectOccupation', occpUi);

    const fundUi = inferFundSourceFromSession(k);
    if (fundUi) {
        setCustomSelectByValue('fundSourceBox', 'fundSourceDisplay', 'selectFundSource', fundUi);
        onFundSourceChange();
    }

    const txUi = invtPurpApiToUi(k.invt_purp_cd);
    if (txUi) setCustomSelectByValue('txPurposeBox', 'txPurposeDisplay', 'selectTxPurpose', txUi);

    if (k.ann_incm_cd) setCustomSelectByValue('annIncmBox', 'annIncmDisplay', 'selectAnnIncm', k.ann_incm_cd);

    if (k.pep_yn === 'Y' || k.pep_yn === 'N') {
        setCustomSelectByValue('pepBox', 'pepDisplay', 'selectPep', k.pep_yn);
    }

    const comp = document.getElementById('inputCompNm');
    if (comp && k.comp_nm) comp.value = k.comp_nm;
    const dept = document.getElementById('inputDeptNm');
    if (dept && k.dept_nm) dept.value = k.dept_nm;

    if (k.fund_etc_cntn) {
        const el = document.getElementById('inputFundEtcCntn');
        if (el) el.value = k.fund_etc_cntn;
    }

    if (k.live_same_yn === 'N') {
        const chk = document.getElementById('chkLiveDifferent');
        if (chk) {
            chk.checked = true;
            toggleLiveAddress();
        }
        if (k.live_zip) {
            const z = document.getElementById('inputLiveZip');
            if (z) z.value = String(k.live_zip).replace(/\D/g, '').slice(0, 5);
        }
        if (k.live_addr1) {
            const a1 = document.getElementById('inputLiveAddr1');
            if (a1) a1.value = k.live_addr1;
        }
        if (k.live_addr2) {
            const a2 = document.getElementById('inputLiveAddr2');
            if (a2) a2.value = k.live_addr2;
        }
    }

    const fr = document.getElementById('inputFrgnRegNo');
    if (fr && k.frgn_reg_no) fr.value = k.frgn_reg_no;
    const rc = document.getElementById('inputRsdncCntry');
    if (rc && k.rsdnc_cntry) rc.value = k.rsdnc_cntry;

    if (k.real_own_yn === 'N') {
        selectOwner('no');
        if (k.real_own_nm) {
            const nm = document.getElementById('inputRealOwnNm');
            if (nm) nm.value = k.real_own_nm;
        }
        if (k.real_own_rltn) {
            setCustomSelectByValue('realOwnRltnBox', 'realOwnRltnDisplay', 'selectRealOwnRltn', k.real_own_rltn);
        }
    } else if (k.real_own_yn === 'Y') {
        selectOwner('yes');
    }
}

(function initForeignerAndPrefill() {
    applyAdditionalPrefillFromSession();
    const kyc = KYC.loadStep();
    const nat = (kyc.nationality || 'KR').toUpperCase();
    if (nat !== 'KR') {
        const fb = document.getElementById('foreignerBlock');
        if (fb) fb.style.display = 'block';
    }
    checkNextBtn();
})();

async function goNext() {
    if (ownerStatus === 'no') {
        KYC.openModal('modalNotOwner');
        return;
    }
    const kycData = KYC.loadStep();
    const cerTrUky = kycData.cer_tr_uky;
    if (!cerTrUky) {
        KYC.showErrorModal(
            '인증 정보가 없습니다. 기본정보부터 다시 진행해주세요.',
            '안내',
            () => KYC.goTo('../basic-info/index.html')
        );
        return;
    }

    const occp = document.getElementById('selectOccupation').value;
    const fundSource = document.getElementById('selectFundSource').value;
    const txPurpose = document.getElementById('selectTxPurpose').value;

    const natnCd = (kycData.nationality || 'KR').toUpperCase();
    const natnApi = ['KR', 'US', 'CN', 'JP'].includes(natnCd) ? natnCd : 'OTHER';
    const frgnYn = natnCd !== 'KR' ? 'Y' : 'N';

    const fund = FUND_MAP[fundSource] || { slry: 'N', bsns: 'N', invt: 'N', inht: 'N', real: 'N', etc: 'Y' };

    const liveDiff = document.getElementById('chkLiveDifferent').checked;
    const fundEtcCntn = fund.etc === 'Y'
        ? document.getElementById('inputFundEtcCntn').value.trim()
        : '';

    const payload = {
        cer_tr_uky: cerTrUky,
        eng_nm: (kycData.passportName || '').trim(),
        natn_cd: natnApi,
        natn_nm: natnApi === 'OTHER' ? String(kycData.nationalityName || '').trim() : '',
        rrno_frnt: '',
        rrno_back: '',
        eml_addr: kycData.email || '',
        reg_zip: kycData.reg_zip || '',
        reg_addr1: kycData.reg_addr1 || '',
        reg_addr2: kycData.reg_addr2 || '',
        live_same_yn: liveDiff ? 'N' : 'Y',
        live_zip: liveDiff ? document.getElementById('inputLiveZip').value.replace(/\D/g, '').slice(0, 5) : '',
        live_addr1: liveDiff ? document.getElementById('inputLiveAddr1').value.trim() : '',
        live_addr2: liveDiff ? document.getElementById('inputLiveAddr2').value.trim() : '',
        occp_cd: OCCP_MAP[occp] || 'OTHER',
        comp_nm: document.getElementById('inputCompNm').value.trim(),
        dept_nm: document.getElementById('inputDeptNm').value.trim(),
        ann_incm_cd: document.getElementById('selectAnnIncm').value,
        fund_slry_yn: fund.slry,
        fund_bsns_yn: fund.bsns,
        fund_invt_yn: fund.invt,
        fund_inht_yn: fund.inht,
        fund_real_yn: fund.real,
        fund_etc_yn: fund.etc,
        fund_etc_cntn: fundEtcCntn,
        invt_purp_cd: TXPURPOSE_MAP[txPurpose] || 'OTHER',
        frgn_yn: frgnYn,
        frgn_reg_no: frgnYn === 'Y' ? document.getElementById('inputFrgnRegNo').value.trim() : '',
        rsdnc_cntry: frgnYn === 'Y' ? document.getElementById('inputRsdncCntry').value.trim().toUpperCase() : '',
        pep_yn: document.getElementById('selectPep').value,
        real_own_yn: ownerStatus === 'yes' ? 'Y' : 'N',
        real_own_nm: ownerStatus === 'no' ? document.getElementById('inputRealOwnNm').value.trim() : '',
        real_own_rltn: ownerStatus === 'no' ? document.getElementById('selectRealOwnRltn').value : ''
    };

    const btn = document.getElementById('btnNext');
    btn.disabled = true;

    try {
        const res = await KYC_API.saveAdditionalInfo(payload);
        const header = res.response_header || {};

        if (header.result_code !== '0') {
            const msg = (res.response_data && res.response_data.std_mesg_content) || header.std_mesg_content || '저장에 실패했습니다.';
            KYC.showErrorModal(msg);
            btn.disabled = false;
            return;
        }

        KYC.saveStep({
            occupation: occp,
            fundSource: fundSource,
            txPurpose: txPurpose,
            isBeneficialOwner: ownerStatus === 'yes',
            ann_incm_cd: payload.ann_incm_cd,
            pep_yn: payload.pep_yn
        });
        KYC.goTo('../account-verify/index.html');
    } catch (err) {
        console.error('추가정보 저장 오류:', err);
        KYC.showErrorModal('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        btn.disabled = false;
    }
}

checkNextBtn();
