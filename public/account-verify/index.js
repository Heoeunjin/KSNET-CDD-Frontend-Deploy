/**
 * KSNET KYC - 계좌 인증 스크립트
 */

(function () { if (typeof KYC !== 'undefined') KYC.captureCallbackFromUrl(); })();

const timerEl = document.getElementById('timerCount');
const timer = new CountdownTimer(timerEl, 180, onTimerExpire);

let isVerified = false;
let currentSheetTab = 'bank';
let acnCerTrUky = null; // gubun=6 응답값 (gubun=7에서 사용)

/* --- 은행/증권사 데이터 (API code는 명세 유지, 화면 노출만 이용·규모 기준 대략 순) --- */
const BANKS = [
    { code: 'KB',        name: 'KB국민',             color: '#FFBC00', text: 'KB',   textColor: '#3A1D1D' },
    { code: 'SHINHAN',   name: '신한',               color: '#0046FF', text: '신한' },
    { code: 'WOORI',     name: '우리',               color: '#007BC7', text: '우리' },
    { code: 'HANA',      name: '하나',               color: '#009B77', text: '하나' },
    { code: 'NH',        name: 'NH농협',             color: '#009947', text: 'NH' },
    { code: 'KAKAO',     name: '카카오뱅크',         color: '#F9E000', text: 'K',    textColor: '#3A1D1D' },
    { code: 'TOSS',      name: '토스뱅크',           color: '#4169E1', text: 'T' },
    { code: 'KBANK',     name: '케이뱅크',           color: '#1A4CC0', text: 'K' },
    { code: 'IBK',       name: 'IBK기업',            color: '#005BAC', text: '기업' },
    { code: 'SC',        name: 'SC제일',             color: '#00AA4B', text: 'SC' },
    { code: 'SUHYUP',    name: '수협',               color: '#0066CC', text: '수협' },
    { code: 'IAMBANK',   name: 'iM뱅크(대구)',       color: '#CD2D34', text: 'iM' },
    { code: 'POST',      name: '우체국',             color: '#E60012', text: '우체' },
    { code: 'BUSAN',     name: '부산',               color: '#CD2D34', text: 'BNK' },
    { code: 'GYEONGNAM', name: '경남',               color: '#CD2D34', text: 'BNK' },
    { code: 'GWANGJU',   name: '광주',               color: '#0066B3', text: '광주' },
    { code: 'JEONBUK',   name: '전북',               color: '#0066B3', text: 'JB' },
    { code: 'JEJU',      name: '제주',               color: '#009B77', text: '제주' },
    { code: 'SEMAUL',    name: '새마을',             color: '#007AC2', text: '새마을' },
    { code: 'CREDIT',    name: '신협',               color: '#1B75BB', text: '신협' },
    { code: 'SAVINGS',   name: '저축은행',           color: '#F5A623', text: '저축' },
    { code: 'KDB',       name: 'KDB산업',            color: '#004A97', text: 'KDB' },
    { code: 'CITI',      name: '씨티',               color: '#003087', text: 'Citi' },
    { code: 'FOREST',    name: '산림조합',           color: '#228B22', text: '산림' },
    { code: 'DEUTSCHE',  name: '도이치',             color: '#0018A8', text: 'DB' },
    { code: 'JPMORGAN',  name: 'JP모건',             color: '#012169', text: 'JP' },
    { code: 'BOA',       name: 'BOA',               color: '#012169', text: 'BOA' },
    { code: 'BNP',       name: 'BNP파리바',         color: '#00915A', text: 'BNP' },
    { code: 'ICBC',      name: '중국공상',           color: '#C41230', text: '공상' },
    { code: 'BOC',       name: '중국',               color: '#C41230', text: '중국' },
    { code: 'CCB',       name: '중국건설',           color: '#003B7A', text: '건설' },
];

const SECURITIES = [
    { code: 'SAMSUNG',     name: '삼성증권',            color: '#1428A0', text: 'S' },
    { code: 'KIWOOM',      name: '키움',                color: '#E8001C', text: '키움' },
    { code: 'MIRAE',       name: '미래에셋',            color: '#E8001C', text: 'M' },
    { code: 'NH_SEC',      name: 'NH투자',              color: '#009947', text: 'NH' },
    { code: 'KB_SEC',      name: 'KB증권',              color: '#FFBC00', text: 'KB',   textColor: '#3A1D1D' },
    { code: 'EBEST',       name: '이베스트투자',        color: '#E8001C', text: 'K' },
    { code: 'SHINHAN_SEC', name: '신한투자',            color: '#0046FF', text: '신한' },
    { code: 'TOSS_SEC',    name: '토스증권',            color: '#4169E1', text: 'T' },
    { code: 'KAKAOPAY',    name: '카카오페이증권',      color: '#F9E000', text: 'K',    textColor: '#3A1D1D' },
    { code: 'DAESHIN',     name: '대신',                color: '#00448B', text: '대신' },
    { code: 'HANA_DT',     name: '하나증권',            color: '#009B77', text: '하나' },
    { code: 'YUANTA',      name: '유안타',              color: '#E8001C', text: 'Y' },
    { code: 'HANWHA',      name: '한화투자',            color: '#FF6B00', text: '한화' },
    { code: 'MERITZ',      name: '메리츠증권',          color: '#E8001C', text: 'M' },
    { code: 'KYOBO',       name: '교보',                color: '#005BAC', text: '교보' },
    { code: 'DB_SEC',      name: 'DB증권',              color: '#003087', text: 'DB' },
    { code: 'EUGENE',      name: '유진투자',            color: '#FF6B00', text: '유진' },
    { code: 'BNK_SEC',     name: 'BNK투자',            color: '#CD2D34', text: 'BNK' },
    { code: 'HYUNDAI',     name: '현대차증권',          color: '#002C5F', text: 'H' },
    { code: 'SK',          name: 'SK',                 color: '#EA002C', text: 'SK' },
    { code: 'HI',          name: '하이투자',            color: '#E8001C', text: 'Hi' },
    { code: 'IBK_SEC',     name: 'IBK투자',            color: '#005BAC', text: 'IBK' },
    { code: 'DAEWOO',      name: '대우',                color: '#00448B', text: '대우' },
    { code: 'IM_MERITZ',   name: '아이엠증권',          color: '#E8001C', text: 'iM' },
    { code: 'BUGUK',       name: '부국',                color: '#003087', text: '부국' },
    { code: 'SINYOUNG',    name: '신영',                color: '#0B5C2E', text: '신영' },
    { code: 'DAOL',        name: '다올투자증권',        color: '#005BAC', text: '다올' },
    { code: 'CAPE',        name: '케이프투자',          color: '#005BAC', text: '케이프' },
    { code: 'KOREA_FOSS',  name: '한국포스',            color: '#003087', text: '포스' },
];

function bankIconFolder(code) {
    return SECURITIES.some(function (s) { return s.code === code; }) ? 'sec' : 'bank';
}

function bankIconSrc(tabOrFolder, code) {
    return '../assets/icons/' + tabOrFolder + '/' + code + '.svg';
}

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

    grid.innerHTML = list.map(item => {
        const src = bankIconSrc(tab, item.code);
        const fg = item.textColor || '#fff';
        return `
        <div class="bank-item${item.code === selectedCode ? ' is-selected' : ''}"
             onclick="selectBank('${item.code}', '${item.name}', '${item.color}', '${item.text}', '${fg}')">
            <div class="bank-icon">
                <img class="bank-icon-img" src="${src}" alt="" loading="lazy" decoding="async"
                     onerror="this.classList.add('is-broken'); this.parentElement.classList.add('use-fallback');">
                <span class="bank-icon-fallback" style="background:${item.color};color:${fg}">${item.text}</span>
            </div>
            <span class="bank-item-name">${item.name}</span>
        </div>`;
    }).join('');
}

function selectBank(code, name, color, text, textColor) {
    document.getElementById('selectBank').value = code;

    const inner = document.getElementById('bankTriggerInner');
    const src = bankIconSrc(bankIconFolder(code), code);
    inner.innerHTML = `
        <div class="bank-icon-sm">
            <img class="bank-icon-sm-img" src="${src}" alt=""
                 onerror="this.classList.add('is-broken'); this.parentElement.classList.add('use-fallback');">
            <span class="bank-icon-sm-fallback" style="background:${color};color:${textColor}">${text}</span>
        </div>
        <span class="bank-trigger-name">${name}</span>
    `;

    // 은행 변경 시 인증 상태 초기화
    const btn = document.getElementById('btnRequestVerify');
    if (btn.textContent.trim() === '재전송') {
        btn.textContent = '인증번호 요청';
        document.getElementById('verifySection').style.display = 'none';
        timer.stop();
        isVerified = false;
        checkNextBtn();
    }

    closeBankSheet();
    checkRequestBtn();
}

/* --- 계좌번호 입력 → 재전송 상태면 초기화 --- */
document.getElementById('inputAccountNo').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');

    const btn = document.getElementById('btnRequestVerify');
    if (btn.textContent.trim() === '재전송') {
        btn.textContent = '인증번호 요청';
        document.getElementById('verifySection').style.display = 'none';
        timer.stop();
        isVerified = false;
        checkNextBtn();
    }

    checkRequestBtn();
});

/* --- 인증번호 요청 버튼 활성화 --- */
function checkRequestBtn() {
    const bank = document.getElementById('selectBank').value;
    const accountNo = document.getElementById('inputAccountNo').value;
    document.getElementById('btnRequestVerify').disabled = !(bank && accountNo.length >= 6);
}

/* --- 1원 인증 요청 (gubun=6 API) --- */
async function requestVerify() {
    const bank = document.getElementById('selectBank').value;
    const accountNo = document.getElementById('inputAccountNo').value;
    if (!bank || accountNo.length < 6) return;

    const kycData = KYC.loadStep();
    const cerTrUky = kycData.cer_tr_uky;
    if (!cerTrUky) {
        alert('인증 정보가 없습니다. 기본정보부터 다시 진행해주세요.');
        KYC.goTo('../basic-info/index.html');
        return;
    }

    // gubun=6 예금주명: gubun=2에서 내려온 한글 이름을 우선 사용
    const acntNm = String(
        kycData.auth_nm || kycData.usr_nm || kycData.user_nm || kycData.kor_nm || kycData.name || ''
    ).trim();

    const btn = document.getElementById('btnRequestVerify');
    btn.disabled = true;

    try {
        const res = await KYC_API.requestAccountVerify({
            cer_tr_uky: cerTrUky,
            bankCode: bank,
            acno: accountNo,
            acntNm
        });

        const header = res.response_header || {};
        const data = res.response_data || {};

        if (header.result_code !== '0') {
            const msg = header.std_mesg_content || data.std_mesg_content || '인증 요청에 실패했습니다.';
            if (msg.includes('초과') || msg.includes('횟수')) {
                KYC.openModal('modalLimitExceeded');
            } else {
                alert(msg);
            }
            btn.disabled = false;
            return;
        }

        acnCerTrUky = data.acn_cer_tr_uky || null;
        document.getElementById('verifySection').style.display = 'block';
        document.getElementById('inputVerifyCode').value = '';
        document.getElementById('verifyCodeError').classList.remove('is-show');
        btn.textContent = '재전송';
        timer.start();
        isVerified = false;
        checkNextBtn();
    } catch (err) {
        console.error('1원 인증 요청 오류:', err);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
    btn.disabled = false;
}

/* --- 인증번호 입력 --- */
document.getElementById('inputVerifyCode').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    Validation.clearError(
        document.getElementById('verifyCodeBox'),
        document.getElementById('verifyCodeError')
    );
    if (this.value.length === 3) {
        verifyCode(this.value);
    }
});

/* --- 인증 코드 검증 (gubun=7 API) --- */
async function verifyCode(code) {
    const kycData = KYC.loadStep();
    const cerTrUky = kycData.cer_tr_uky;
    if (!cerTrUky || !acnCerTrUky) {
        KYC.openModal('modalOwnerMismatch');
        checkNextBtn();
        return;
    }

    try {
        const res = await KYC_API.confirmAccountVerify({
            cer_tr_uky: cerTrUky,
            acn_cer_tr_uky: acnCerTrUky,
            synp_cer_no: code
        });

        const header = res.response_header || {};
        const data = res.response_data || {};

        if (header.result_code === '0') {
            timer.stop();
            isVerified = true;
            KYC.saveStep({ acn_cer_tr_uky: acnCerTrUky });
        } else {
            isVerified = false;
            const msg =
                header.std_mesg_content ||
                data.std_mesg_content ||
                '인증에 실패했습니다. 입력값을 확인해 주세요.';
            Validation.showError(
                document.getElementById('verifyCodeBox'),
                document.getElementById('verifyCodeError'),
                msg
            );
        }
    } catch (err) {
        console.error('계좌 인증 확인 오류:', err);
        isVerified = false;
        KYC.openModal('modalOwnerMismatch');
    }
    checkNextBtn();
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
        accountVerified: true,
        acn_cer_tr_uky: acnCerTrUky
    });
    KYC.goTo('../id-verify/index.html');
}
