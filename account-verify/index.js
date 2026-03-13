/**
 * KSNET KYC - 계좌 인증 스크립트
 */

const timerEl = document.getElementById('timerCount');
const timer = new CountdownTimer(timerEl, 180, onTimerExpire);

let isVerified = false;

/* --- 은행 선택 → 인증 버튼 체크 --- */
document.getElementById('selectBank').addEventListener('change', checkRequestBtn);

/* --- 계좌번호 입력 --- */
document.getElementById('inputAccountNo').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkRequestBtn();
});

/* --- 인증번호 요청 버튼 활성화 --- */
function checkRequestBtn() {
    const bank = document.getElementById('selectBank').value;
    const accountNo = document.getElementById('inputAccountNo').value;
    document.getElementById('btnRequestVerify').disabled = !(bank && accountNo.length >= 6);
}

/* --- 1원 인증 요청 --- */
function requestVerify() {
    const bank = document.getElementById('selectBank').value;
    const accountNo = document.getElementById('inputAccountNo').value;

    if (!bank || accountNo.length < 6) return;

    // TODO: 서버 API 연동 - 1원 입금 요청
    // 임시 처리: 입금자명 표시
    const mockDepositorName = '케스넷' + Math.floor(Math.random() * 9000 + 1000);
    document.getElementById('displayDepositorName').textContent = mockDepositorName;

    document.getElementById('verifySection').style.display = 'block';
    document.getElementById('inputVerifyCode').value = '';
    document.getElementById('verifyCodeError').classList.remove('is-show');

    timer.start();
    isVerified = false;
    checkNextBtn();
}

/* --- 인증번호 입력 --- */
document.getElementById('inputVerifyCode').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    Validation.clearError(
        document.getElementById('verifyCodeBox'),
        document.getElementById('verifyCodeError')
    );

    if (this.value.length === 4) {
        verifyCode(this.value);
    }
});

/* --- 인증 코드 검증 (서버 API 연동 시 대체) --- */
function verifyCode(code) {
    // TODO: 서버 API 연동으로 대체
    // 임시: 1234 이면 성공
    if (code === '1234') {
        timer.stop();
        isVerified = true;
        checkNextBtn();
    } else {
        isVerified = false;
        KYC.openModal('modalOwnerMismatch');
        checkNextBtn();
    }
}

/* --- 타이머 만료 --- */
function onTimerExpire() {
    KYC.openModal('modalExpired');
    isVerified = false;
    checkNextBtn();
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    document.getElementById('btnNext').disabled = !isVerified;
}

/* --- 다음 페이지 이동 --- */
function goNext() {
    KYC.saveStep({
        bank: document.getElementById('selectBank').value,
        accountVerified: true
    });
    KYC.goTo('../complete/index.html');
}
