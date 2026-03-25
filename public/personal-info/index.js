/**
 * KSNET KYC - 추가 기본정보 입력 스크립트
 */

/* --- 이전 단계 정보 불러와서 표시 (+ gubun=2 재진입 시 서버 기입력 프리필) --- */
(function loadPrevData() {
    const data = KYC.loadStep();
    document.getElementById('displayName').textContent = data.name || data.auth_nm || '-';
    document.getElementById('displayPhone').textContent = data.phone || '-';

    const lastEl = document.getElementById('inputPassportLastName');
    const firstEl = document.getElementById('inputPassportFirstName');
    if (lastEl && data.passportLastName) {
        lastEl.value = data.passportLastName;
    }
    if (firstEl && data.passportFirstName) {
        firstEl.value = data.passportFirstName;
    }
    if (data.email) {
        const emailEl = document.getElementById('inputEmail');
        if (emailEl) emailEl.value = data.email;
    }
    if (data.reg_zip) {
        const zipEl = document.getElementById('inputZip');
        if (zipEl) zipEl.value = data.reg_zip;
    }
    if (data.reg_addr1) {
        const addrEl = document.getElementById('inputAddress');
        if (addrEl) addrEl.value = data.reg_addr1;
    }
    if (data.reg_addr2) {
        const detailEl = document.getElementById('inputAddressDetail');
        if (detailEl) detailEl.value = data.reg_addr2;
    }

    if (typeof checkNextBtn === 'function') {
        checkNextBtn();
    }
})();

/* --- 여권 영문명 (영문만 허용) --- */
const passportLastNameInput = document.getElementById('inputPassportLastName');
const passportFirstNameInput = document.getElementById('inputPassportFirstName');
const passportLastNameBox = document.getElementById('passportLastNameBox');
const passportFirstNameBox = document.getElementById('passportFirstNameBox');
const passportErrorEl = document.getElementById('passportError');

function setPassportNameError(message) {
    if (passportLastNameBox) passportLastNameBox.classList.add('is-error');
    if (passportFirstNameBox) passportFirstNameBox.classList.add('is-error');
    if (passportErrorEl) {
        passportErrorEl.textContent = message;
        passportErrorEl.classList.add('is-show');
    }
}

function clearPassportNameError() {
    if (passportLastNameBox) passportLastNameBox.classList.remove('is-error');
    if (passportFirstNameBox) passportFirstNameBox.classList.remove('is-error');
    if (passportErrorEl) {
        passportErrorEl.textContent = '';
        passportErrorEl.classList.remove('is-show');
    }
}

function handlePassportNameInput(inputEl) {
    const raw = inputEl.value;
    const hadInvalid = /[^A-Za-z\s]/.test(raw);
    const sanitized = raw.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    inputEl.value = sanitized;

    if (hadInvalid) {
        setPassportNameError('영문으로 입력해주세요.');
    } else {
        clearPassportNameError();
    }
    checkNextBtn();
}

if (passportLastNameInput) {
    passportLastNameInput.addEventListener('input', function () {
        handlePassportNameInput(this);
    });
}

if (passportFirstNameInput) {
    passportFirstNameInput.addEventListener('input', function () {
        handlePassportNameInput(this);
    });
}

/* --- 국적 데이터: KR 단독 상단 → 「전체 국가」→ JP·US·CN → 나머지 가나다순 --- */
const COUNTRIES = [
    { code: 'KR', name: '대한민국', flag: '🇰🇷' },
    { code: 'AF', name: '아프가니스탄', flag: '🇦🇫' },
    { code: 'AL', name: '알바니아', flag: '🇦🇱' },
    { code: 'DZ', name: '알제리', flag: '🇩🇿' },
    { code: 'AD', name: '안도라', flag: '🇦🇩' },
    { code: 'AO', name: '앙골라', flag: '🇦🇴' },
    { code: 'AG', name: '앤티가 바부다', flag: '🇦🇬' },
    { code: 'AR', name: '아르헨티나', flag: '🇦🇷' },
    { code: 'AM', name: '아르메니아', flag: '🇦🇲' },
    { code: 'AU', name: '호주', flag: '🇦🇺' },
    { code: 'AT', name: '오스트리아', flag: '🇦🇹' },
    { code: 'AZ', name: '아제르바이잔', flag: '🇦🇿' },
    { code: 'BS', name: '바하마', flag: '🇧🇸' },
    { code: 'BH', name: '바레인', flag: '🇧🇭' },
    { code: 'BD', name: '방글라데시', flag: '🇧🇩' },
    { code: 'BB', name: '바베이도스', flag: '🇧🇧' },
    { code: 'BY', name: '벨라루스', flag: '🇧🇾' },
    { code: 'BE', name: '벨기에', flag: '🇧🇪' },
    { code: 'BZ', name: '벨리즈', flag: '🇧🇿' },
    { code: 'BJ', name: '베냉', flag: '🇧🇯' },
    { code: 'BT', name: '부탄', flag: '🇧🇹' },
    { code: 'BO', name: '볼리비아', flag: '🇧🇴' },
    { code: 'BA', name: '보스니아 헤르체고비나', flag: '🇧🇦' },
    { code: 'BW', name: '보츠와나', flag: '🇧🇼' },
    { code: 'BR', name: '브라질', flag: '🇧🇷' },
    { code: 'BN', name: '브루나이', flag: '🇧🇳' },
    { code: 'BG', name: '불가리아', flag: '🇧🇬' },
    { code: 'BF', name: '부르키나파소', flag: '🇧🇫' },
    { code: 'BI', name: '부룬디', flag: '🇧🇮' },
    { code: 'CV', name: '카보베르데', flag: '🇨🇻' },
    { code: 'KH', name: '캄보디아', flag: '🇰🇭' },
    { code: 'CM', name: '카메룬', flag: '🇨🇲' },
    { code: 'CA', name: '캐나다', flag: '🇨🇦' },
    { code: 'CF', name: '중앙아프리카공화국', flag: '🇨🇫' },
    { code: 'TD', name: '차드', flag: '🇹🇩' },
    { code: 'CL', name: '칠레', flag: '🇨🇱' },
    { code: 'CN', name: '중국', flag: '🇨🇳' },
    { code: 'CO', name: '콜롬비아', flag: '🇨🇴' },
    { code: 'KM', name: '코모로', flag: '🇰🇲' },
    { code: 'CG', name: '콩고 공화국', flag: '🇨🇬' },
    { code: 'CD', name: '콩고 민주공화국', flag: '🇨🇩' },
    { code: 'CR', name: '코스타리카', flag: '🇨🇷' },
    { code: 'CI', name: '코트디부아르', flag: '🇨🇮' },
    { code: 'HR', name: '크로아티아', flag: '🇭🇷' },
    { code: 'CU', name: '쿠바', flag: '🇨🇺' },
    { code: 'CY', name: '키프로스', flag: '🇨🇾' },
    { code: 'CZ', name: '체코', flag: '🇨🇿' },
    { code: 'DK', name: '덴마크', flag: '🇩🇰' },
    { code: 'DJ', name: '지부티', flag: '🇩🇯' },
    { code: 'DM', name: '도미니카 연방', flag: '🇩🇲' },
    { code: 'DO', name: '도미니카 공화국', flag: '🇩🇴' },
    { code: 'EC', name: '에콰도르', flag: '🇪🇨' },
    { code: 'EG', name: '이집트', flag: '🇪🇬' },
    { code: 'SV', name: '엘살바도르', flag: '🇸🇻' },
    { code: 'GQ', name: '적도 기니', flag: '🇬🇶' },
    { code: 'ER', name: '에리트레아', flag: '🇪🇷' },
    { code: 'EE', name: '에스토니아', flag: '🇪🇪' },
    { code: 'SZ', name: '에스와티니', flag: '🇸🇿' },
    { code: 'ET', name: '에티오피아', flag: '🇪🇹' },
    { code: 'FJ', name: '피지', flag: '🇫🇯' },
    { code: 'FI', name: '핀란드', flag: '🇫🇮' },
    { code: 'FR', name: '프랑스', flag: '🇫🇷' },
    { code: 'GA', name: '가봉', flag: '🇬🇦' },
    { code: 'GM', name: '감비아', flag: '🇬🇲' },
    { code: 'GE', name: '조지아', flag: '🇬🇪' },
    { code: 'DE', name: '독일', flag: '🇩🇪' },
    { code: 'GH', name: '가나', flag: '🇬🇭' },
    { code: 'GR', name: '그리스', flag: '🇬🇷' },
    { code: 'GD', name: '그레나다', flag: '🇬🇩' },
    { code: 'GT', name: '과테말라', flag: '🇬🇹' },
    { code: 'GN', name: '기니', flag: '🇬🇳' },
    { code: 'GW', name: '기니비사우', flag: '🇬🇼' },
    { code: 'GY', name: '가이아나', flag: '🇬🇾' },
    { code: 'HT', name: '아이티', flag: '🇭🇹' },
    { code: 'HN', name: '온두라스', flag: '🇭🇳' },
    { code: 'HU', name: '헝가리', flag: '🇭🇺' },
    { code: 'IS', name: '아이슬란드', flag: '🇮🇸' },
    { code: 'IN', name: '인도', flag: '🇮🇳' },
    { code: 'ID', name: '인도네시아', flag: '🇮🇩' },
    { code: 'IR', name: '이란', flag: '🇮🇷' },
    { code: 'IQ', name: '이라크', flag: '🇮🇶' },
    { code: 'IE', name: '아일랜드', flag: '🇮🇪' },
    { code: 'IL', name: '이스라엘', flag: '🇮🇱' },
    { code: 'IT', name: '이탈리아', flag: '🇮🇹' },
    { code: 'JM', name: '자메이카', flag: '🇯🇲' },
    { code: 'JP', name: '일본', flag: '🇯🇵' },
    { code: 'JO', name: '요르단', flag: '🇯🇴' },
    { code: 'KZ', name: '카자흐스탄', flag: '🇰🇿' },
    { code: 'KE', name: '케냐', flag: '🇰🇪' },
    { code: 'KI', name: '키리바시', flag: '🇰🇮' },
    { code: 'KW', name: '쿠웨이트', flag: '🇰🇼' },
    { code: 'KG', name: '키르기스스탄', flag: '🇰🇬' },
    { code: 'LA', name: '라오스', flag: '🇱🇦' },
    { code: 'LV', name: '라트비아', flag: '🇱🇻' },
    { code: 'LB', name: '레바논', flag: '🇱🇧' },
    { code: 'LS', name: '레소토', flag: '🇱🇸' },
    { code: 'LR', name: '라이베리아', flag: '🇱🇷' },
    { code: 'LY', name: '리비아', flag: '🇱🇾' },
    { code: 'LI', name: '리히텐슈타인', flag: '🇱🇮' },
    { code: 'LT', name: '리투아니아', flag: '🇱🇹' },
    { code: 'LU', name: '룩셈부르크', flag: '🇱🇺' },
    { code: 'MG', name: '마다가스카르', flag: '🇲🇬' },
    { code: 'MW', name: '말라위', flag: '🇲🇼' },
    { code: 'MY', name: '말레이시아', flag: '🇲🇾' },
    { code: 'MV', name: '몰디브', flag: '🇲🇻' },
    { code: 'ML', name: '말리', flag: '🇲🇱' },
    { code: 'MT', name: '몰타', flag: '🇲🇹' },
    { code: 'MH', name: '마셜 제도', flag: '🇲🇭' },
    { code: 'MR', name: '모리타니', flag: '🇲🇷' },
    { code: 'MU', name: '모리셔스', flag: '🇲🇺' },
    { code: 'MX', name: '멕시코', flag: '🇲🇽' },
    { code: 'FM', name: '미크로네시아', flag: '🇫🇲' },
    { code: 'MD', name: '몰도바', flag: '🇲🇩' },
    { code: 'MC', name: '모나코', flag: '🇲🇨' },
    { code: 'MN', name: '몽골', flag: '🇲🇳' },
    { code: 'ME', name: '몬테네그로', flag: '🇲🇪' },
    { code: 'MA', name: '모로코', flag: '🇲🇦' },
    { code: 'MZ', name: '모잠비크', flag: '🇲🇿' },
    { code: 'MM', name: '미얀마', flag: '🇲🇲' },
    { code: 'NA', name: '나미비아', flag: '🇳🇦' },
    { code: 'NR', name: '나우루', flag: '🇳🇷' },
    { code: 'NP', name: '네팔', flag: '🇳🇵' },
    { code: 'NL', name: '네덜란드', flag: '🇳🇱' },
    { code: 'NZ', name: '뉴질랜드', flag: '🇳🇿' },
    { code: 'NI', name: '니카라과', flag: '🇳🇮' },
    { code: 'NE', name: '니제르', flag: '🇳🇪' },
    { code: 'NG', name: '나이지리아', flag: '🇳🇬' },
    { code: 'MK', name: '북마케도니아', flag: '🇲🇰' },
    { code: 'NO', name: '노르웨이', flag: '🇳🇴' },
    { code: 'OM', name: '오만', flag: '🇴🇲' },
    { code: 'PK', name: '파키스탄', flag: '🇵🇰' },
    { code: 'PW', name: '팔라우', flag: '🇵🇼' },
    { code: 'PA', name: '파나마', flag: '🇵🇦' },
    { code: 'PG', name: '파푸아뉴기니', flag: '🇵🇬' },
    { code: 'PY', name: '파라과이', flag: '🇵🇾' },
    { code: 'PE', name: '페루', flag: '🇵🇪' },
    { code: 'PH', name: '필리핀', flag: '🇵🇭' },
    { code: 'PL', name: '폴란드', flag: '🇵🇱' },
    { code: 'PT', name: '포르투갈', flag: '🇵🇹' },
    { code: 'QA', name: '카타르', flag: '🇶🇦' },
    { code: 'RO', name: '루마니아', flag: '🇷🇴' },
    { code: 'RU', name: '러시아', flag: '🇷🇺' },
    { code: 'RW', name: '르완다', flag: '🇷🇼' },
    { code: 'KN', name: '세인트키츠 네비스', flag: '🇰🇳' },
    { code: 'LC', name: '세인트루시아', flag: '🇱🇨' },
    { code: 'VC', name: '세인트빈센트 그레나딘', flag: '🇻🇨' },
    { code: 'WS', name: '사모아', flag: '🇼🇸' },
    { code: 'SM', name: '산마리노', flag: '🇸🇲' },
    { code: 'ST', name: '상투메 프린시페', flag: '🇸🇹' },
    { code: 'SA', name: '사우디아라비아', flag: '🇸🇦' },
    { code: 'SN', name: '세네갈', flag: '🇸🇳' },
    { code: 'RS', name: '세르비아', flag: '🇷🇸' },
    { code: 'SC', name: '세이셸', flag: '🇸🇨' },
    { code: 'SL', name: '시에라리온', flag: '🇸🇱' },
    { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
    { code: 'SK', name: '슬로바키아', flag: '🇸🇰' },
    { code: 'SI', name: '슬로베니아', flag: '🇸🇮' },
    { code: 'SB', name: '솔로몬 제도', flag: '🇸🇧' },
    { code: 'SO', name: '소말리아', flag: '🇸🇴' },
    { code: 'ZA', name: '남아프리카공화국', flag: '🇿🇦' },
    { code: 'SS', name: '남수단', flag: '🇸🇸' },
    { code: 'ES', name: '스페인', flag: '🇪🇸' },
    { code: 'LK', name: '스리랑카', flag: '🇱🇰' },
    { code: 'SD', name: '수단', flag: '🇸🇩' },
    { code: 'SR', name: '수리남', flag: '🇸🇷' },
    { code: 'SE', name: '스웨덴', flag: '🇸🇪' },
    { code: 'CH', name: '스위스', flag: '🇨🇭' },
    { code: 'SY', name: '시리아', flag: '🇸🇾' },
    { code: 'TW', name: '대만', flag: '🇹🇼' },
    { code: 'TJ', name: '타지키스탄', flag: '🇹🇯' },
    { code: 'TZ', name: '탄자니아', flag: '🇹🇿' },
    { code: 'TH', name: '태국', flag: '🇹🇭' },
    { code: 'TL', name: '동티모르', flag: '🇹🇱' },
    { code: 'TG', name: '토고', flag: '🇹🇬' },
    { code: 'TO', name: '통가', flag: '🇹🇴' },
    { code: 'TT', name: '트리니다드 토바고', flag: '🇹🇹' },
    { code: 'TN', name: '튀니지', flag: '🇹🇳' },
    { code: 'TR', name: '튀르키예', flag: '🇹🇷' },
    { code: 'TM', name: '투르크메니스탄', flag: '🇹🇲' },
    { code: 'TV', name: '투발루', flag: '🇹🇻' },
    { code: 'UG', name: '우간다', flag: '🇺🇬' },
    { code: 'UA', name: '우크라이나', flag: '🇺🇦' },
    { code: 'AE', name: '아랍에미리트', flag: '🇦🇪' },
    { code: 'GB', name: '영국', flag: '🇬🇧' },
    { code: 'US', name: '미국', flag: '🇺🇸' },
    { code: 'UY', name: '우루과이', flag: '🇺🇾' },
    { code: 'UZ', name: '우즈베키스탄', flag: '🇺🇿' },
    { code: 'VU', name: '바누아투', flag: '🇻🇺' },
    { code: 'VE', name: '베네수엘라', flag: '🇻🇪' },
    { code: 'VN', name: '베트남', flag: '🇻🇳' },
    { code: 'YE', name: '예멘', flag: '🇾🇪' },
    { code: 'ZM', name: '잠비아', flag: '🇿🇲' },
    { code: 'ZW', name: '짐바브웨', flag: '🇿🇼' },
    { code: 'HK', name: '홍콩', flag: '🇭🇰' },
    { code: 'MO', name: '마카오', flag: '🇲🇴' },
    { code: 'PS', name: '팔레스타인', flag: '🇵🇸' },
    { code: 'XK', name: '코소보', flag: '🇽🇰' },
];

/** 전체 국가 섹션 헤더 바로 아래에 고정 노출 (명세 자주 쓰는 국적) */
const NATN_PIN_AFTER_ALL_HEADER = ['JP', 'US', 'CN'];
const EXCLUDED_FROM_ALPHA = new Set(['KR'].concat(NATN_PIN_AFTER_ALL_HEADER));

function getCountryByCode(code) {
    for (let i = 0; i < COUNTRIES.length; i++) {
        if (COUNTRIES[i].code === code) {
            return COUNTRIES[i];
        }
    }
    return null;
}

function getCountriesAlphaRest() {
    return COUNTRIES.filter(function (c) {
        return !EXCLUDED_FROM_ALPHA.has(c.code);
    }).sort(function (a, b) {
        return a.name.localeCompare(b.name, 'ko');
    });
}

/* --- 국적 fixed 바텀시트 (계좌 은행 선택과 동일 패턴) --- */
(function initNationalitySheet() {
    const trigger = document.getElementById('nationalityTrigger');
    const display = document.getElementById('nationalityDisplay');
    const list = document.getElementById('nationalityList');
    const hiddenInput = document.getElementById('selectNationality');
    const sheet = document.getElementById('nationalitySheet');
    const backdrop = document.getElementById('nationalitySheetBackdrop');

    let selectedCode = '';
    let isOpen = false;

    function renderList() {
        list.innerHTML = '';
        const kr = getCountryByCode('KR');
        if (kr) {
            list.appendChild(makeOption(kr));
        }

        const sep = document.createElement('div');
        sep.className = 'nationality-section-label';
        sep.textContent = '전체 국가';
        list.appendChild(sep);

        NATN_PIN_AFTER_ALL_HEADER.forEach(function (code) {
            const c = getCountryByCode(code);
            if (c) {
                list.appendChild(makeOption(c));
            }
        });

        getCountriesAlphaRest().forEach(function (c) {
            list.appendChild(makeOption(c));
        });
    }

    function makeOption(country) {
        const el = document.createElement('div');
        el.className = 'nationality-option' + (country.code === selectedCode ? ' is-selected' : '');
        el.dataset.code = country.code;
        el.innerHTML = `<span class="flag">${country.flag}</span><span class="country-name">${country.name}</span>`;
        el.addEventListener('click', function () {
            selectCountry(country);
        });
        return el;
    }

    function selectCountry(country) {
        selectedCode = country.code;
        hiddenInput.value = country.code;
        display.textContent = country.flag + '  ' + country.name;
        display.classList.add('is-selected');
        closeNationalitySheet();
        checkNextBtn();
    }

    let sheetGestureInit = false;

    /** 은행 바텀시트와 동일: 리스트 스크롤 시 확장, 핸들 드래그로 확장·닫기 */
    function initNationalitySheetGesture(sheetEl, body) {
        if (sheetGestureInit || !body) return;
        sheetGestureInit = true;

        let lastScrollTop = 0;
        body.addEventListener('scroll', function () {
            const st = this.scrollTop;
            if (st > 0) {
                sheetEl.classList.add('is-expanded');
            } else if (st === 0 && lastScrollTop > 0) {
                sheetEl.classList.remove('is-expanded');
            }
            lastScrollTop = st;
        });

        const handle = sheetEl.querySelector('.nationality-sheet-handle');
        if (!handle) return;

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
                sheetEl.classList.add('is-expanded');
            } else if (diff < -30) {
                if (sheetEl.classList.contains('is-expanded')) {
                    sheetEl.classList.remove('is-expanded');
                } else {
                    closeNationalitySheet();
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

    function openNationalitySheet() {
        if (isOpen) return;
        isOpen = true;
        sheet.classList.remove('is-expanded');
        const body = sheet.querySelector('.nationality-sheet-body');
        if (body) {
            body.scrollTop = 0;
        }
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        backdrop.classList.add('is-open');
        sheet.classList.add('is-open');
        sheet.setAttribute('aria-hidden', 'false');
        renderList();
        initNationalitySheetGesture(sheet, body);
    }

    function closeNationalitySheet(force) {
        if (!isOpen && !force) return;
        isOpen = false;
        trigger.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        backdrop.classList.remove('is-open');
        sheet.classList.remove('is-open');
        sheet.classList.remove('is-expanded');
        sheet.setAttribute('aria-hidden', 'true');
    }

    window.closeNationalitySheet = closeNationalitySheet;

    trigger.addEventListener('click', function () {
        if (isOpen) {
            closeNationalitySheet();
        } else {
            openNationalitySheet();
        }
    });

    trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openNationalitySheet();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
            closeNationalitySheet();
        }
    });

    closeNationalitySheet(true);
    window.addEventListener('pageshow', function () {
        closeNationalitySheet(true);
    });

    /** 세션에 nationality(서버 natn_cd 등)가 있으면 국적 선택 동기화 */
    (function applyStoredNationality() {
        const kyc = KYC.loadStep();
        const code = (kyc.nationality || '').trim().toUpperCase();
        if (!code) return;
        const c = getCountryByCode(code);
        if (c) {
            selectCountry(c);
        }
        if (typeof checkNextBtn === 'function') {
            checkNextBtn();
        }
    })();
})();

/* --- 이메일 입력 --- */
document.getElementById('inputEmail').addEventListener('input', function () {
    Validation.clearError(
        document.getElementById('emailBox'),
        document.getElementById('emailError')
    );
    checkNextBtn();
});

/* --- 상세주소 입력 --- */
document.getElementById('inputAddressDetail').addEventListener('input', function () {
    checkNextBtn();
});

/**
 * 행안부 도로명주소 — opener.jusoCallBack (인자 25개, jusoPopup.jsp 와 동일 순서)
 * 앞 7개만 화면에 사용, 나머지는 명세와 동일하게 전달받기만 함.
 */
window.jusoCallBack = function (
    roadFullAddr,
    roadAddrPart1,
    addrDetail,
    roadAddrPart2,
    engAddr,
    jibunAddr,
    zipNo,
    ..._rest
) {
    // roadFullAddr 은 상세입력·참고항목까지 붙인 전체 문장이라 기본주소에 쓰면 상세와 중복됨.
    // 기본: roadAddrPart1 + 참고(roadAddrPart2) / 상세: 사용자 입력(addrDetail)만
    const p1 = (roadAddrPart1 || '').trim();
    const p2 = (roadAddrPart2 || '').trim();
    const mainAddr = p1
        ? [p1, p2].filter(Boolean).join(' ').trim()
        : (roadFullAddr || '').trim();
    const zone = String(zipNo != null ? zipNo : '').replace(/\D/g, '');
    const detail = (addrDetail != null ? String(addrDetail) : '').trim();

    document.getElementById('inputZip').value = zone;
    document.getElementById('inputAddress').value = mainAddr;
    document.getElementById('inputAddressDetail').value = detail;
    document.getElementById('inputAddressDetail').focus();
    checkNextBtn();
};

function searchAddress() {
    const width = 500;
    const height = 600;
    const left = Math.round((window.screen.width - width) / 2);
    const top = Math.round((window.screen.height - height) / 2);
    const base = window.location.origin;
    const popupUrl = `${base}/juso-popup.html`;
    window.open(popupUrl, 'jusoPopup', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`);
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const lastName = document.getElementById('inputPassportLastName').value.trim();
    const firstName = document.getElementById('inputPassportFirstName').value.trim();
    const nationality = document.getElementById('selectNationality').value;
    const email = document.getElementById('inputEmail').value.trim();
    const zip = document.getElementById('inputZip').value.replace(/\D/g, '');
    const address = document.getElementById('inputAddress').value.trim();
    const detail = document.getElementById('inputAddressDetail').value.trim();

    const isValid = lastName.length > 0
        && firstName.length > 0
        && nationality !== ''
        && email.length > 0
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        && zip.length === 5
        && address.length > 0
        && detail.length > 0;

    document.getElementById('btnNext').disabled = !isValid;
}

/* --- 다음 페이지 이동 --- */
function goNext() {
    const zipEl = document.getElementById('inputZip');
    const addrEl = document.getElementById('inputAddress');
    const detailEl = document.getElementById('inputAddressDetail');
    const natDisp = document.getElementById('nationalityDisplay').textContent.trim();
    const natName = natDisp.indexOf(' ') > 0 ? natDisp.slice(natDisp.indexOf(' ') + 1).trim() : natDisp;

    const regZip = zipEl.value.replace(/\D/g, '');

    KYC.saveStep({
        passportName: `${document.getElementById('inputPassportLastName').value} ${document.getElementById('inputPassportFirstName').value}`.trim(),
        nationality: document.getElementById('selectNationality').value,
        nationalityName: natName,
        email: document.getElementById('inputEmail').value.trim(),
        reg_zip: regZip,
        reg_addr1: addrEl.value.trim(),
        reg_addr2: detailEl.value.trim(),
        address: addrEl.value,
        addressDetail: detailEl.value
    });
    KYC.goTo('../additional-info/index.html');
}
