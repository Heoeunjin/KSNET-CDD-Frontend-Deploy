/**
 * KSNET KYC - 기본정보 입력 스크립트
 */

const timerEl = document.getElementById('timerCount');
const timer = new CountdownTimer(timerEl, 180, onTimerExpire);

let isPhoneVerified = false;
let smsResponse = null; // gubun=1 응답 (cer_tr_uky, rqs_unq_no, rspd_unq_no)
let pendingAlreadyCompleted = false;

(function bootKycEntry() {
    KYC.captureCallbackFromUrl();
})();
(async function requireToken() {
    const ok = await KYC.ensureTokenVerified();
    if (!ok) {
        KYC.showErrorModal(
            '토큰 검증이 필요합니다. 메인 화면에서 다시 시작해 주세요.',
            '안내',
            () => KYC.goTo('../index.html')
        );
    }
})();

/* --- 이름 입력 처리 (IME 조합 중에는 값/에러 동기화 스킵 → compositionend 에서 정리) --- */
(function initNameField() {
    const inputNameEl = document.getElementById('inputName');
    const nameBox = document.getElementById('nameBox');
    const nameError = document.getElementById('nameError');
    let nameImeComposing = false;

    function syncNameField() {
        const raw = inputNameEl.value;
        let stripped = KYC.sanitizeNameInputLive(raw);
        const hadNonHangulRemoved = raw !== stripped;

        let syllablesOnly = KYC.extractHangulSyllables(stripped);
        if (syllablesOnly.length > 10) {
            stripped = syllablesOnly.slice(0, 10);
            syllablesOnly = stripped;
        }
        inputNameEl.value = stripped;

        const isValidKoreanName = syllablesOnly.length > 0 && KYC.validateName(syllablesOnly);

        if (isValidKoreanName) {
            Validation.clearError(nameBox, nameError);
        } else if (hadNonHangulRemoved) {
            Validation.showError(
                nameBox,
                nameError,
                '한글로 입력해주세요.'
            );
        } else if (syllablesOnly.length > 0 && !KYC.validateName(syllablesOnly)) {
            Validation.showError(
                nameBox,
                nameError,
                '이름은 한글만 입력 가능합니다. (최대 10자)'
            );
        } else {
            Validation.clearError(nameBox, nameError);
        }
        checkNextBtn();
        checkRequestBtn();
    }

    inputNameEl.addEventListener('compositionstart', function () {
        nameImeComposing = true;
    });

    inputNameEl.addEventListener('compositionend', function () {
        nameImeComposing = false;
        syncNameField();
    });

    inputNameEl.addEventListener('input', function (e) {
        if (e.isComposing || nameImeComposing) {
            return;
        }
        syncNameField();
    });

    inputNameEl.addEventListener('blur', function () {
        if (nameImeComposing) {
            return;
        }
        syncNameField();
        const syllables = KYC.extractHangulSyllables(this.value);
        if (syllables.length > 0 && !KYC.validateName(syllables)) {
            Validation.showError(
                nameBox,
                nameError,
                '이름은 한글만 입력 가능합니다. (최대 10자)'
            );
        }
    });
})();

/* --- 주민등록번호 앞자리 --- */
Validation.bindImeAwareInput(document.getElementById('inputSsnFront'), function (el) {
    el.value = el.value.replace(/\D/g, '').slice(0, 6);
    if (el.value.length === 6) {
        const backInput = document.getElementById('inputSsnBack');
        if (backInput) {
            backInput.focus();
            try {
                backInput.setSelectionRange(1, 1);
            } catch (e) {}
        }
    }
    checkNextBtn();
    checkRequestBtn();
});

/* --- 주민등록번호 뒷자리 마스킹 (첫 자리만 숫자, 나머지 ●) --- */
Validation.bindImeAwareInput(document.getElementById('inputSsnBack'), function (el) {
    const realInputEl = document.getElementById('inputSsnBackReal');
    const digits = el.value.replace(/\D/g, '').slice(0, 1);

    if (realInputEl) {
        realInputEl.value = digits;
    }

    if (digits.length === 0) {
        el.value = '';
    } else {
        const first = digits.charAt(0);
        const masked = first + '●'.repeat(6);
        el.value = masked;
        try {
            el.setSelectionRange(1, 1);
        } catch (e) {}
    }

    checkNextBtn();
    checkRequestBtn();
});

/* --- 통신사 선택 (하단 시트): 이통 3사 → 알뜰폰 선택 시 알뜰 사업자만 노출 --- */
(function initCarrierSheet() {
    const box = document.getElementById('carrierBox');
    const displayEl = document.getElementById('carrierDisplay');
    const nativeSelect = document.getElementById('selectCarrier');
    const backdrop = document.getElementById('carrierSheetBackdrop');
    const sheet = document.getElementById('carrierSheet');
    const btnClose = document.getElementById('carrierSheetClose');
    const btnBack = document.getElementById('carrierSheetBack');
    const titleEl = document.getElementById('carrierSheetTitle');
    const stepMain = document.getElementById('carrierSheetStepMain');
    const stepMvno = document.getElementById('carrierSheetStepMvno');

    if (!box || !displayEl || !nativeSelect || !backdrop || !sheet || !stepMain || !stepMvno) return;

    const MVNO_VALUES = ['SKT_MVNO', 'KT_MVNO', 'LGU_MVNO'];
    const allOptions = sheet.querySelectorAll('.carrier-sheet-option');

    let isOpen = false;

    function isMvnoCarrierValue(v) {
        return MVNO_VALUES.indexOf(v) !== -1;
    }

    function syncOptionActiveState() {
        const v = nativeSelect.value;
        allOptions.forEach(function (b) {
            const val = b.getAttribute('data-value') || '';
            b.classList.toggle('is-active', val !== '' && val === v);
        });
    }

    function showMainStep() {
        stepMain.classList.remove('is-hidden');
        stepMvno.classList.add('is-hidden');
        if (btnBack) btnBack.classList.add('is-hidden');
        if (titleEl) titleEl.textContent = '통신사 선택';
    }

    function showMvnoStep() {
        stepMain.classList.add('is-hidden');
        stepMvno.classList.remove('is-hidden');
        if (btnBack) btnBack.classList.remove('is-hidden');
        if (titleEl) titleEl.textContent = '알뜰 사업자 선택';
    }

    function openCarrierSheet() {
        if (isOpen) return;
        isOpen = true;
        const v = nativeSelect.value;
        if (isMvnoCarrierValue(v)) {
            showMvnoStep();
        } else {
            showMainStep();
        }
        syncOptionActiveState();
        box.classList.add('is-open');
        box.setAttribute('aria-expanded', 'true');
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');
        sheet.classList.add('is-open');
        sheet.setAttribute('aria-hidden', 'false');
    }

    function closeCarrierSheet() {
        if (!isOpen) return;
        isOpen = false;
        showMainStep();
        box.classList.remove('is-open');
        box.setAttribute('aria-expanded', 'false');
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
        sheet.classList.remove('is-open');
        sheet.setAttribute('aria-hidden', 'true');
    }

    window.closeCarrierSheet = closeCarrierSheet;

    box.addEventListener('click', function () {
        if (isOpen) {
            closeCarrierSheet();
        } else {
            openCarrierSheet();
        }
    });

    box.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen) {
                closeCarrierSheet();
            } else {
                openCarrierSheet();
            }
        }
    });

    backdrop.addEventListener('click', closeCarrierSheet);
    if (btnClose) btnClose.addEventListener('click', closeCarrierSheet);
    if (btnBack) {
        btnBack.addEventListener('click', function () {
            showMainStep();
            syncOptionActiveState();
        });
    }

    allOptions.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const action = this.getAttribute('data-action') || '';
            if (action === 'open-mvno') {
                showMvnoStep();
                return;
            }

            const value = this.getAttribute('data-value') || '';
            const label = this.textContent.trim();

            nativeSelect.value = value;
            displayEl.textContent = label || '통신사';

            allOptions.forEach(function (b) { b.classList.remove('is-active'); });
            if (value) {
                this.classList.add('is-active');
                box.classList.add('is-selected');
            } else {
                box.classList.remove('is-selected');
            }

            closeCarrierSheet();
            checkRequestBtn();
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
            closeCarrierSheet();
        }
    });

    window.addEventListener('pageshow', function () {
        closeCarrierSheet();
    });
})();

/* --- 휴대폰 번호 입력 --- */
Validation.bindImeAwareInput(document.getElementById('inputPhone'), function (el) {
    el.value = KYC.formatPhone(el.value.replace(/\D/g, ''));

    const btn = document.getElementById('btnRequestCode');
    if (btn && btn.textContent.trim() === '재전송') {
        btn.textContent = '인증번호 요청';
        document.getElementById('verifyRow').style.display = 'none';
        document.getElementById('smsGuide').style.display = 'block';
        document.getElementById('smsGuideSent').style.display = 'none';
        timer.stop();
        isPhoneVerified = false;
    }

    checkRequestBtn();
    checkNextBtn();
});

/* --- 인증번호 요청 / 재전송 버튼 --- */
document.getElementById('btnRequestCode').addEventListener('click', async function () {
    const name = document.getElementById('inputName').value.trim();
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBackReal = document.getElementById('inputSsnBackReal').value;
    const carrier = document.getElementById('selectCarrier').value;
    const phone = document.getElementById('inputPhone').value;

    if (!carrier) return;
    if (!KYC.validatePhone(phone)) {
        Validation.showError(
            document.getElementById('phoneBox'),
            document.getElementById('phoneError'),
            '올바른 휴대폰 번호를 입력해주세요.'
        );
        return;
    }
    if (!KYC.validateName(name) || ssnFront.length !== 6 || ssnBackReal.length !== 1) {
        return;
    }

    Validation.clearError(
        document.getElementById('phoneBox'),
        document.getElementById('phoneError')
    );

    const btn = this;
    btn.disabled = true;

    try {
        const usrInf = KYC.ssnToBirthDate(ssnFront, ssnBackReal);
        const usrSex = KYC.ssnToGender(ssnBackReal);

        const res = await KYC_API.sendSms({
            usr_nm: name,
            usr_inf: usrInf,
            usr_sex: usrSex,
            carrier: carrier,
            mbtl_no: phone
        });

        const header = res.response_header || {};
        const data = res.response_data || {};


        if (header.result_code !== '0') {
            Validation.showError(
                document.getElementById('phoneBox'),
                document.getElementById('phoneError'),
                data.std_mesg_content || header.std_mesg_content || '인증번호 발송에 실패했습니다.'
            );
            btn.disabled = false;
            return;
        }

        smsResponse = {
            cer_tr_uky: data.cer_tr_uky,
            rqs_unq_no: data.rqs_unq_no,
            rspd_unq_no: data.rspd_unq_no
        };

        document.getElementById('verifyRow').style.display = 'block';
        document.getElementById('inputCode').value = '';
        document.getElementById('codeError').classList.remove('is-show');
        document.getElementById('smsGuide').style.display = 'none';
        document.getElementById('smsGuideSent').style.display = 'block';

        this.textContent = '재전송';
        timer.start();
        isPhoneVerified = false;
        checkNextBtn();
    } catch (err) {
        console.error('SMS 발송 오류:', err);
        Validation.showError(
            document.getElementById('phoneBox'),
            document.getElementById('phoneError'),
            '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
        );
    }
    btn.disabled = false;
});

/* --- 인증번호 입력 → 6자리 완성 시 자동 인증 --- */
Validation.bindImeAwareInput(document.getElementById('inputCode'), function (el) {
    el.value = el.value.replace(/\D/g, '');
    Validation.clearError(
        document.getElementById('codeBox'),
        document.getElementById('codeError')
    );
    if (el.value.length === 6) {
        verifyCode(el.value);
    }
});


/* --- 인증번호 검증 (gubun=2 API) --- */
async function verifyCode(code) {
    if (!smsResponse || !smsResponse.cer_tr_uky) {
        KYC.openModal('modalCodeError');
        return;
    }

    const phone = document.getElementById('inputPhone').value.replace(/\D/g, '');

    try {
        const res = await KYC_API.verifySms({
            cer_tr_uky: smsResponse.cer_tr_uky,
            rqs_unq_no: smsResponse.rqs_unq_no,
            rspd_unq_no: smsResponse.rspd_unq_no,
            cer_no: code,
            mbtl_no: phone
        });

        const header = res.response_header || {};
        const data = res.response_data || {};

        if (header.result_code !== '0') {
            timer.stop();
            isPhoneVerified = false;
            KYC.openModal('modalCodeError');
            checkNextBtn();
            return;
        }

        timer.stop();
        isPhoneVerified = true;
        document.getElementById('codeBox').classList.remove('is-error');

        // 발송 시점 키 + 확인 응답(서버 기입력 포함) 병합 후 세션 반영
        const merged = Object.assign({}, smsResponse, data, { mbtl_no: phone });
        KYC.mergeVerifySmsResponse(merged);

        const curStep = String(data.cur_step || '01').trim();
        if (curStep === '05' || curStep === '07') {
            KYC.saveStep({ kyc_resume_cur_step: curStep });
            KYC.openModal('modalResumeReentry');
            return;
        }
        if (curStep === '08') {
            pendingAlreadyCompleted = true;
            KYC.openModal('modalAlreadyCompleted');
            return;
        }
        // cur_step 01: 정상 플로우 — checkNextBtn 후 [다음]으로 personal-info (goNext)

        checkNextBtn();
    } catch (err) {
        console.error('인증번호 확인 오류:', err);
        KYC.openModal('modalCodeError');
        checkNextBtn();
    }
}

/**
 * 재진입 안내 모달 [계속] — cur_step 05: 추가정보 확인 경로(personal → additional) 후 계좌인증, 07: 신분증
 */
function onResumeReentryContinue() {
    KYC.closeModal('modalResumeReentry');
    const d = KYC.loadStep();
    const step = String(d.kyc_resume_cur_step || '').trim();
    KYC.saveStep({ kyc_resume_cur_step: '' });
    if (step === '05') {
        KYC.goTo('../personal-info/index.html');
        return;
    }
    if (step === '07') {
        KYC.goTo('../id-verify/index.html');
        return;
    }
}

function onAlreadyCompletedConfirm() {
    KYC.closeModal('modalAlreadyCompleted');
    if (!pendingAlreadyCompleted) return;
    pendingAlreadyCompleted = false;
    if (KYC.kycComplete()) return;
    KYC.goTo('../complete/index.html');
}

/* --- 타이머 만료 콜백 --- */
function onTimerExpire() {
    KYC.openModal('modalExpired');
    isPhoneVerified = false;
    checkNextBtn();
}

/* --- 인증번호 요청 버튼 활성화 조건 --- */
function checkRequestBtn() {
    const nameRaw = document.getElementById('inputName').value;
    const nameSyllables = KYC.extractHangulSyllables(String(nameRaw || '').trim());
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBackReal = document.getElementById('inputSsnBackReal').value;
    const carrier = document.getElementById('selectCarrier').value;
    const phone = document.getElementById('inputPhone').value;
    const btn = document.getElementById('btnRequestCode');

    const isAllTextFilled =
        KYC.validateName(nameSyllables) &&
        KYC.validateSsnFront(ssnFront) &&
        ssnBackReal.length === 1 &&
        carrier &&
        KYC.validatePhone(phone);

    btn.disabled = !isAllTextFilled;
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const nameSyllables = KYC.extractHangulSyllables(
        String(document.getElementById('inputName').value || '').trim()
    );
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBackReal = document.getElementById('inputSsnBackReal').value;

    const isValid = KYC.validateName(nameSyllables)
        && KYC.validateSsnFront(ssnFront)
        && ssnBackReal.length === 1
        && isPhoneVerified;

    document.getElementById('btnNext').disabled = !isValid;
}

/* --- 다음 페이지 이동 --- */
function goNext() {
    KYC.saveStep({
        name: document.getElementById('inputName').value,
        phone: document.getElementById('inputPhone').value,
        ssnFront: document.getElementById('inputSsnFront').value,
        ssnBackReal: document.getElementById('inputSsnBackReal').value,
        carrier: document.getElementById('selectCarrier').value,
        cer_tr_uky: smsResponse ? smsResponse.cer_tr_uky : null
    });
    KYC.goTo('../personal-info/index.html');
}
