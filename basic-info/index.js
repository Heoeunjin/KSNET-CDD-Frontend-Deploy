/**
 * KSNET KYC - 기본정보 입력 스크립트
 */

const timerEl = document.getElementById('timerCount');
// TODO: 실제 서비스 시 180(3분)으로 변경
const timer = new CountdownTimer(timerEl, 30, onTimerExpire);

let isPhoneVerified = false;

/* --- 이름 입력 처리 --- */
document.getElementById('inputName').addEventListener('input', function (e) {
    // 한글 IME 입력 중에는 값 변형을 하지 않음 (조합 완성 후 처리)
    if (e.isComposing) return;

    // 한글 이외의 문자 제거
    this.value = this.value.replace(/[^가-힣]/g, '');
    Validation.clearError(
        document.getElementById('nameBox'),
        document.getElementById('nameError')
    );
    checkNextBtn();
});

document.getElementById('inputName').addEventListener('blur', function () {
    if (this.value && !KYC.validateName(this.value)) {
        Validation.showError(
            document.getElementById('nameBox'),
            document.getElementById('nameError'),
            '이름은 한글만 입력 가능합니다. (최대 10자)'
        );
    }
});

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

    function closeDropdown() {
        box.classList.remove('is-open');
    }

    box.addEventListener('click', function (e) {
        // 옵션 클릭은 별도 처리
        if (e.target.classList.contains('carrier-option')) return;
        box.classList.toggle('is-open');
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
document.getElementById('btnRequestCode').addEventListener('click', function () {
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

    Validation.clearError(
        document.getElementById('phoneBox'),
        document.getElementById('phoneError')
    );

    // 인증번호 입력창 표시
    document.getElementById('verifyRow').style.display = 'block';
    document.getElementById('inputCode').value = '';
    document.getElementById('codeError').classList.remove('is-show');

    // 안내 문구 전환: 기본 → 전송 완료
    document.getElementById('smsGuide').style.display = 'none';
    document.getElementById('smsGuideSent').style.display = 'block';

    // 인증확인 버튼 초기화
    const btnVerify = document.getElementById('btnVerifyCode');
    if (btnVerify) btnVerify.disabled = true;

    // 버튼 텍스트 → 재전송으로 변경
    this.textContent = '재전송';

    // 타이머 시작
    timer.start();
    isPhoneVerified = false;
    checkNextBtn();
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


/* --- 인증번호 검증 (실제 서버 연동 시 API 호출로 대체) --- */
function verifyCode(code) {
    // TODO: 서버 API 연동으로 대체
    // 임시: 123456 이면 성공 처리
    if (code === '123456') {
        timer.stop();
        isPhoneVerified = true;
        document.getElementById('codeBox').classList.remove('is-error');
        checkNextBtn();
    } else {
        isPhoneVerified = false;
        KYC.openModal('modalCodeError');
        checkNextBtn();
    }
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
        phone: document.getElementById('inputPhone').value
    });
    KYC.goTo('../personal-info/index.html');
}
