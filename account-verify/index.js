/**
 * KSNET KYC - 계좌 인증 스크립트
 */

const timerEl = document.getElementById('timerCount');
const timer = new CountdownTimer(timerEl, 180, onTimerExpire);

let isVerified = false;
let currentSheetTab = 'bank';

/* --- 은행/증권사 데이터 --- */
const BANKS = [
    { code: 'KB',       name: 'KB국민',       color: '#FFBC00', text: 'KB' },
    { code: 'IBK',      name: '기업',          color: '#005BAC', text: '기업' },
    { code: 'NH',       name: '농협',          color: '#009947', text: 'NH' },
    { code: 'KDB',      name: '산업',          color: '#004A97', text: 'KDB' },
    { code: 'SUHYUP',   name: '수협',          color: '#0066CC', text: '수협' },
    { code: 'SHINHAN',  name: '신한',          color: '#0046FF', text: '신한' },
    { code: 'WOORI',    name: '우리',          color: '#007BC7', text: '우리' },
    { code: 'POST',     name: '우체국',        color: '#E60012', text: '우체' },
    { code: 'HANA',     name: '하나',          color: '#009B77', text: '하나' },
    { code: 'CITI',     name: '한국씨티',      color: '#003087', text: 'Citi' },
    { code: 'SC',       name: 'SC제일',        color: '#00AA4B', text: 'SC' },
    { code: 'KAKAO',    name: '카카오뱅크',    color: '#F9E000', text: 'K',   textColor: '#3A1D1D' },
    { code: 'KBANK',    name: '케이뱅크',      color: '#1A4CC0', text: 'K' },
    { code: 'TOSS',     name: '토스뱅크',      color: '#4169E1', text: 'T' },
    { code: 'GYEONGNAM',name: '경남',          color: '#CD2D34', text: 'BNK' },
    { code: 'GWANGJU',  name: '광주',          color: '#0066B3', text: '광주' },
    { code: 'IAMBANK',  name: '아이엠뱅크',    color: '#CD2D34', text: 'iM' },
    { code: 'BUSAN',    name: '부산',          color: '#CD2D34', text: 'BNK' },
    { code: 'JEONBUK',  name: '전북',          color: '#0066B3', text: 'JB' },
    { code: 'JEJU',     name: '제주',          color: '#009B77', text: '제주' },
    { code: 'SAVINGS',  name: '저축',          color: '#F5A623', text: '저축' },
    { code: 'FOREST',   name: '산림조합',      color: '#228B22', text: '산림' },
    { code: 'SEMAUL',   name: '새마을',        color: '#007AC2', text: '새마을' },
    { code: 'CREDIT',   name: '신협',          color: '#1B75BB', text: '신협' },
];

const SECURITIES = [
    { code: 'KB_SEC',      name: 'KB증권',        color: '#FFBC00', text: 'KB',   textColor: '#3A1D1D' },
    { code: 'KYOBO',       name: '교보증권',      color: '#005BAC', text: '교보' },
    { code: 'DAESHIN',     name: '대신증권',      color: '#00448B', text: '대신' },
    { code: 'MERITZ',      name: '메리츠증권',    color: '#E8001C', text: 'M' },
    { code: 'MIRAE',       name: '미래에셋',      color: '#E8001C', text: 'M' },
    { code: 'BUGUK',       name: '부국증권',      color: '#003087', text: '부국' },
    { code: 'SAMSUNG',     name: '삼성증권',      color: '#1428A0', text: 'S' },
    { code: 'SANGSANGIN',  name: '상상인증권',    color: '#FF6B00', text: '상상' },
    { code: 'SINYOUNG',    name: '신영증권',      color: '#0B5C2E', text: '신영' },
    { code: 'SHINHAN_SEC', name: '신한투자',      color: '#0046FF', text: '신한' },
    { code: 'YUANTA',      name: '유안타증권',    color: '#E8001C', text: 'Y' },
    { code: 'EUGENE',      name: '유진투자',      color: '#FF6B00', text: '유진' },
    { code: 'LS',          name: 'LS증권',        color: '#003087', text: 'LS' },
    { code: 'KAKAOPAY',    name: '카카오페이',    color: '#F9E000', text: 'K',    textColor: '#3A1D1D' },
    { code: 'CAPE',        name: '케이프투자',    color: '#005BAC', text: '케이프' },
    { code: 'KIWOOM',      name: '키움증권',      color: '#E8001C', text: '키움' },
    { code: 'TOSS_SEC',    name: '토스증권',      color: '#4169E1', text: 'T' },
    { code: 'HANA_SEC',    name: '하나증권',      color: '#009B77', text: '하나' },
    { code: 'KIS',         name: '한국투자',      color: '#E8001C', text: 'K' },
    { code: 'HANWHA',      name: '한화투자',      color: '#FF6B00', text: '한화' },
    { code: 'HYUNDAI',     name: '현대차증권',    color: '#002C5F', text: 'H' },
    { code: 'BNK_SEC',     name: 'BNK투자',       color: '#CD2D34', text: 'BNK' },
    { code: 'IAM_SEC',     name: '아이엠증권',    color: '#CD2D34', text: 'iM' },
    { code: 'WOORI_SEC',   name: '우리투자',      color: '#007BC7', text: '우리' },
];

/* --- 바텀시트 --- */
function openBankSheet() {
    const sheet = document.getElementById('bankSheet');
    const body = sheet.querySelector('.bank-sheet-body');

    // 항상 초기 상태로 리셋
    sheet.classList.remove('is-expanded');
    currentSheetTab = 'bank';
    document.getElementById('sheetTabBank').classList.add('is-active');
    document.getElementById('sheetTabSec').classList.remove('is-active');
    body.scrollTop = 0;

    document.getElementById('bankSheetBackdrop').classList.add('is-open');
    sheet.classList.add('is-open');
    renderBankGrid('bank');
    initSheetGesture(sheet, body);
}

function closeBankSheet() {
    const sheet = document.getElementById('bankSheet');
    document.getElementById('bankSheetBackdrop').classList.remove('is-open');
    sheet.classList.remove('is-open');
    sheet.classList.remove('is-expanded');
}

let sheetGestureInit = false;

function initSheetGesture(sheet, body) {
    if (sheetGestureInit) return;
    sheetGestureInit = true;

    // 리스트 스크롤 → 확장 / 맨 위로 올라오면 축소
    let lastScrollTop = 0;
    body.addEventListener('scroll', function () {
        const st = this.scrollTop;
        if (st > 0) {
            sheet.classList.add('is-expanded');
        } else if (st === 0 && lastScrollTop > 0) {
            sheet.classList.remove('is-expanded');
        }
        lastScrollTop = st;
    });

    // 핸들 드래그로 확장/축소
    const handle = sheet.querySelector('.bank-sheet-handle');
    let startY = 0;

    function onDragStart(e) {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: true });
        document.addEventListener('touchend', onDragEnd);
    }
    function onDragMove(e) {
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const diff = startY - y;
        if (diff > 30) {
            sheet.classList.add('is-expanded');
        } else if (diff < -30) {
            if (sheet.classList.contains('is-expanded')) {
                sheet.classList.remove('is-expanded');
            } else {
                closeBankSheet();
            }
        }
    }
    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
    }

    handle.addEventListener('mousedown', onDragStart);
    handle.addEventListener('touchstart', onDragStart, { passive: true });
}

function switchSheetTab(tab) {
    currentSheetTab = tab;
    document.getElementById('sheetTabBank').classList.toggle('is-active', tab === 'bank');
    document.getElementById('sheetTabSec').classList.toggle('is-active', tab === 'sec');
    renderBankGrid(tab);
}

function renderBankGrid(tab) {
    const list = tab === 'bank' ? BANKS : SECURITIES;
    const selectedCode = document.getElementById('selectBank').value;
    const grid = document.getElementById('bankGrid');

    grid.innerHTML = list.map(item => `
        <div class="bank-item${item.code === selectedCode ? ' is-selected' : ''}"
             onclick="selectBank('${item.code}', '${item.name}', '${item.color}', '${item.text}', '${item.textColor || '#fff'}')">
            <div class="bank-icon" style="background:${item.color}; color:${item.textColor || '#fff'}">
                ${item.text}
            </div>
            <span class="bank-item-name">${item.name}</span>
        </div>
    `).join('');
}

function selectBank(code, name, color, text, textColor) {
    document.getElementById('selectBank').value = code;

    const inner = document.getElementById('bankTriggerInner');
    inner.innerHTML = `
        <div class="bank-icon-sm" style="background:${color}; color:${textColor}">${text}</div>
        <span class="bank-trigger-name">${name}</span>
    `;

    closeBankSheet();
    checkRequestBtn();
}

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

/* --- 인증 코드 검증 --- */
function verifyCode(code) {
    // TODO: 서버 API 연동으로 대체
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
