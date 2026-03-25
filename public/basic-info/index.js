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
        KYC.showErrorModal('토큰 검증이 필요합니다. 메인 화면에서 다시 시작해 주세요.');
        KYC.goTo('../index.html');
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
        const stripped = raw.replace(/[^가-힣]/g, '');
        inputNameEl.value = stripped;

        const isValidKoreanName = stripped.length > 0 && KYC.validateName(stripped);
        const hadNonHangulRemoved = raw !== stripped;

        if (isValidKoreanName) {
            Validation.clearError(nameBox, nameError);
        } else if (hadNonHangulRemoved) {
            Validation.showError(
                nameBox,
                nameError,
                '한글로 입력해주세요.'
            );
        } else if (stripped.length > 0 && !KYC.validateName(stripped)) {
            Validation.showError(
                nameBox,
                nameError,
                '이름은 한글만 입력 가능합니다. (최대 10자)'
            );
        } else {
            Validation.clearError(nameBox, nameError);
        }
        checkNextBtn();
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
        if (this.value && !KYC.validateName(this.value)) {
            Validation.showError(
                nameBox,
                nameError,
                '이름은 한글만 입력 가능합니다. (최대 10자)'
            );
        }
    });
})();

/* --- 주민등록번호 앞자리 --- */
document.getElementById('inputSsnFront').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
    if (this.value.length === 6) {
        // 앞자리 6자리 모두 입력되면 자동으로 뒷자리로 포커스 이동
        const backInput = document.getElementById('inputSsnBack');
        if (backInput) {
            backInput.focus();
            try {
                backInput.setSelectionRange(1, 1);
            } catch (e) {}
        }
    }
    checkNextBtn();
});

/* --- 주민등록번호 뒷자리 마스킹 (첫 자리만 숫자, 나머지 ●) --- */
document.getElementById('inputSsnBack').addEventListener('input', function () {
    const realInputEl = document.getElementById('inputSsnBackReal');
    // 사용자가 입력할 수 있는 실제 숫자는 첫 번째 자리 한 자리만 허용
    const digits = this.value.replace(/\D/g, '').slice(0, 1);

    // 실제 값은 hidden input에 저장
    if (realInputEl) {
        realInputEl.value = digits;
    }

    // 화면에는 첫 자리만 숫자, 나머지는 ●로 고정 6개 표시 (총 7자리처럼 보이게)
    if (digits.length === 0) {
        this.value = '';
    } else {
        const first = digits.charAt(0);
        const masked = first + '●'.repeat(6);
        this.value = masked;
        // 커서를 첫 번째 자리 뒤(인덱스 1)에 고정
        try {
            this.setSelectionRange(1, 1);
        } catch (e) {
            // 일부 브라우저에서 setSelectionRange 미지원 시 무시
        }
    }

    checkNextBtn();
});

/* --- 통신사 선택 (커스텀 드롭다운) → 인증번호 요청 버튼 활성화 체크 --- */
(function initCarrierDropdown() {
    const box = document.getElementById('carrierBox');
    const displayEl = document.getElementById('carrierDisplay');
    const dropdown = document.getElementById('carrierDropdown');
    const nativeSelect = document.getElementById('selectCarrier');
    const options = dropdown ? dropdown.querySelectorAll('.carrier-option') : [];

    if (!box || !displayEl || !dropdown || !nativeSelect || !options.length) return;

    function ensureDropdownVisibleBelow() {
        const body = document.querySelector('.kyc-body');
        if (!body) return;
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const dropdownRect = dropdown.getBoundingClientRect();
        const bottomPadding = 12;
        const overflow = dropdownRect.bottom + bottomPadding - viewportHeight;
        if (overflow > 0) {
            body.scrollTop += overflow;
        }
    }

    function closeDropdown() {
        box.classList.remove('is-open');
    }

    box.addEventListener('click', function (e) {
        // 옵션 클릭은 별도 처리
        if (e.target.classList.contains('carrier-option')) return;
        if (box.classList.contains('is-open')) {
            closeDropdown();
            return;
        }
        box.classList.add('is-open');
        requestAnimationFrame(ensureDropdownVisibleBelow);
    });

    options.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const value = this.getAttribute('data-value') || '';
            const label = this.textContent.trim();

            // native select 값 동기화
            nativeSelect.value = value;

            // 표시 텍스트 변경
            displayEl.textContent = label || '통신사';

            // 선택 상태 표시
            options.forEach(function (b) { b.classList.remove('is-active'); });
            if (value) {
                this.classList.add('is-active');
                box.classList.add('is-selected');
            } else {
                box.classList.remove('is-selected');
            }

            closeDropdown();
            checkRequestBtn();
        });
    });

    // 바깥 영역 클릭 시 드롭다운 닫기
    document.addEventListener('click', function (e) {
        if (!box.contains(e.target)) {
            closeDropdown();
        }
    });

    window.addEventListener('resize', function () {
        if (!box.classList.contains('is-open')) return;
        requestAnimationFrame(ensureDropdownVisibleBelow);
    });
})();

/* --- 휴대폰 번호 입력 --- */
document.getElementById('inputPhone').addEventListener('input', function () {
    this.value = KYC.formatPhone(this.value.replace(/\D/g, ''));

    // 번호 변경 시 버튼을 "인증번호 요청"으로 복원, 인증창 초기화
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
document.getElementById('inputCode').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    Validation.clearError(
        document.getElementById('codeBox'),
        document.getElementById('codeError')
    );
    if (this.value.length === 6) {
        verifyCode(this.value);
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
        /* cur_step 01: 정상 플로우 → 다음 버튼 활성화 후 personal-info로 이동 (goNext) */

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
    const name = document.getElementById('inputName').value;
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBackReal = document.getElementById('inputSsnBackReal').value;
    const carrier = document.getElementById('selectCarrier').value;
    const phone = document.getElementById('inputPhone').value;
    const btn = document.getElementById('btnRequestCode');

    const isAllTextFilled =
        KYC.validateName(name) &&
        KYC.validateSsnFront(ssnFront) &&
        ssnBackReal.length === 1 &&
        carrier &&
        KYC.validatePhone(phone);

    btn.disabled = !isAllTextFilled;
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const name = document.getElementById('inputName').value;
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBackReal = document.getElementById('inputSsnBackReal').value;

    const isValid = KYC.validateName(name)
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
