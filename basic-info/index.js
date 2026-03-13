/**
 * KSNET KYC - 기본정보 입력 스크립트
 */

const timerEl = document.getElementById('timerCount');
const timer = new CountdownTimer(timerEl, 180, onTimerExpire);

let isPhoneVerified = false;

/* --- 이름 입력 처리 --- */
document.getElementById('inputName').addEventListener('input', function () {
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
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

/* --- 주민등록번호 뒷자리 마스킹 --- */
document.getElementById('inputSsnBack').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

/* --- 통신사 선택 → 인증번호 요청 버튼 활성화 체크 --- */
document.getElementById('selectCarrier').addEventListener('change', function () {
    checkRequestBtn();
});

/* --- 휴대폰 번호 입력 --- */
document.getElementById('inputPhone').addEventListener('input', function () {
    this.value = KYC.formatPhone(this.value.replace(/\D/g, ''));
    checkRequestBtn();
    checkNextBtn();
});

/* --- 인증번호 요청 버튼 --- */
document.getElementById('btnRequestCode').addEventListener('click', function () {
    const carrier = document.getElementById('selectCarrier').value;
    const phone = document.getElementById('inputPhone').value;

    if (!carrier) {
        return;
    }
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
    document.getElementById('smsGuide').style.display = 'block';
    document.getElementById('inputCode').value = '';
    document.getElementById('codeError').classList.remove('is-show');

    // 타이머 시작
    timer.start();
    isPhoneVerified = false;
    checkNextBtn();
});

/* --- 인증번호 입력 --- */
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
    const carrier = document.getElementById('selectCarrier').value;
    const phone = document.getElementById('inputPhone').value;
    const btn = document.getElementById('btnRequestCode');
    btn.disabled = !(carrier && KYC.validatePhone(phone));
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const name = document.getElementById('inputName').value;
    const ssnFront = document.getElementById('inputSsnFront').value;
    const ssnBack = document.getElementById('inputSsnBack').value;

    const isValid = KYC.validateName(name)
        && KYC.validateSsnFront(ssnFront)
        && ssnBack.length === 7
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
