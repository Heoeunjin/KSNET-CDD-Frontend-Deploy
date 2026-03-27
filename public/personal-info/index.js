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
    Validation.bindImeAwareInput(passportLastNameInput, handlePassportNameInput);
}

if (passportFirstNameInput) {
    Validation.bindImeAwareInput(passportFirstNameInput, handlePassportNameInput);
}

/* --- 국적 데이터: KR 단독 상단 → 「전체 국가」→ JP·US·CN → 나머지 가나다순 --- */
const COUNTRIES = [
    { code: 'KR', name: '대한민국' },
    { code: 'AF', name: '아프가니스탄' },
    { code: 'AL', name: '알바니아' },
    { code: 'DZ', name: '알제리' },
    { code: 'AD', name: '안도라' },
    { code: 'AO', name: '앙골라' },
    { code: 'AG', name: '앤티가 바부다' },
    { code: 'AR', name: '아르헨티나' },
    { code: 'AM', name: '아르메니아' },
    { code: 'AU', name: '호주' },
    { code: 'AT', name: '오스트리아' },
    { code: 'AZ', name: '아제르바이잔' },
    { code: 'BS', name: '바하마' },
    { code: 'BH', name: '바레인' },
    { code: 'BD', name: '방글라데시' },
    { code: 'BB', name: '바베이도스' },
    { code: 'BY', name: '벨라루스' },
    { code: 'BE', name: '벨기에' },
    { code: 'BZ', name: '벨리즈' },
    { code: 'BJ', name: '베냉' },
    { code: 'BT', name: '부탄' },
    { code: 'BO', name: '볼리비아' },
    { code: 'BA', name: '보스니아 헤르체고비나' },
    { code: 'BW', name: '보츠와나' },
    { code: 'BR', name: '브라질' },
    { code: 'BN', name: '브루나이' },
    { code: 'BG', name: '불가리아' },
    { code: 'BF', name: '부르키나파소' },
    { code: 'BI', name: '부룬디' },
    { code: 'CV', name: '카보베르데' },
    { code: 'KH', name: '캄보디아' },
    { code: 'CM', name: '카메룬' },
    { code: 'CA', name: '캐나다' },
    { code: 'CF', name: '중앙아프리카공화국' },
    { code: 'TD', name: '차드' },
    { code: 'CL', name: '칠레' },
    { code: 'CN', name: '중국' },
    { code: 'CO', name: '콜롬비아' },
    { code: 'KM', name: '코모로' },
    { code: 'CG', name: '콩고 공화국' },
    { code: 'CD', name: '콩고 민주공화국' },
    { code: 'CR', name: '코스타리카' },
    { code: 'CI', name: '코트디부아르' },
    { code: 'HR', name: '크로아티아' },
    { code: 'CU', name: '쿠바' },
    { code: 'CY', name: '키프로스' },
    { code: 'CZ', name: '체코' },
    { code: 'DK', name: '덴마크' },
    { code: 'DJ', name: '지부티' },
    { code: 'DM', name: '도미니카 연방' },
    { code: 'DO', name: '도미니카 공화국' },
    { code: 'EC', name: '에콰도르' },
    { code: 'EG', name: '이집트' },
    { code: 'SV', name: '엘살바도르' },
    { code: 'GQ', name: '적도 기니' },
    { code: 'ER', name: '에리트레아' },
    { code: 'EE', name: '에스토니아' },
    { code: 'SZ', name: '에스와티니' },
    { code: 'ET', name: '에티오피아' },
    { code: 'FJ', name: '피지' },
    { code: 'FI', name: '핀란드' },
    { code: 'FR', name: '프랑스' },
    { code: 'GA', name: '가봉' },
    { code: 'GM', name: '감비아' },
    { code: 'GE', name: '조지아' },
    { code: 'DE', name: '독일' },
    { code: 'GH', name: '가나' },
    { code: 'GR', name: '그리스' },
    { code: 'GD', name: '그레나다' },
    { code: 'GT', name: '과테말라' },
    { code: 'GN', name: '기니' },
    { code: 'GW', name: '기니비사우' },
    { code: 'GY', name: '가이아나' },
    { code: 'HT', name: '아이티' },
    { code: 'HN', name: '온두라스' },
    { code: 'HU', name: '헝가리' },
    { code: 'IS', name: '아이슬란드' },
    { code: 'IN', name: '인도' },
    { code: 'ID', name: '인도네시아' },
    { code: 'IR', name: '이란' },
    { code: 'IQ', name: '이라크' },
    { code: 'IE', name: '아일랜드' },
    { code: 'IL', name: '이스라엘' },
    { code: 'IT', name: '이탈리아' },
    { code: 'JM', name: '자메이카' },
    { code: 'JP', name: '일본' },
    { code: 'JO', name: '요르단' },
    { code: 'KZ', name: '카자흐스탄' },
    { code: 'KE', name: '케냐' },
    { code: 'KI', name: '키리바시' },
    { code: 'KW', name: '쿠웨이트' },
    { code: 'KG', name: '키르기스스탄' },
    { code: 'LA', name: '라오스' },
    { code: 'LV', name: '라트비아' },
    { code: 'LB', name: '레바논' },
    { code: 'LS', name: '레소토' },
    { code: 'LR', name: '라이베리아' },
    { code: 'LY', name: '리비아' },
    { code: 'LI', name: '리히텐슈타인' },
    { code: 'LT', name: '리투아니아' },
    { code: 'LU', name: '룩셈부르크' },
    { code: 'MG', name: '마다가스카르' },
    { code: 'MW', name: '말라위' },
    { code: 'MY', name: '말레이시아' },
    { code: 'MV', name: '몰디브' },
    { code: 'ML', name: '말리' },
    { code: 'MT', name: '몰타' },
    { code: 'MH', name: '마셜 제도' },
    { code: 'MR', name: '모리타니' },
    { code: 'MU', name: '모리셔스' },
    { code: 'MX', name: '멕시코' },
    { code: 'FM', name: '미크로네시아' },
    { code: 'MD', name: '몰도바' },
    { code: 'MC', name: '모나코' },
    { code: 'MN', name: '몽골' },
    { code: 'ME', name: '몬테네그로' },
    { code: 'MA', name: '모로코' },
    { code: 'MZ', name: '모잠비크' },
    { code: 'MM', name: '미얀마' },
    { code: 'NA', name: '나미비아' },
    { code: 'NR', name: '나우루' },
    { code: 'NP', name: '네팔' },
    { code: 'NL', name: '네덜란드' },
    { code: 'NZ', name: '뉴질랜드' },
    { code: 'NI', name: '니카라과' },
    { code: 'NE', name: '니제르' },
    { code: 'NG', name: '나이지리아' },
    { code: 'MK', name: '북마케도니아' },
    { code: 'NO', name: '노르웨이' },
    { code: 'OM', name: '오만' },
    { code: 'PK', name: '파키스탄' },
    { code: 'PW', name: '팔라우' },
    { code: 'PA', name: '파나마' },
    { code: 'PG', name: '파푸아뉴기니' },
    { code: 'PY', name: '파라과이' },
    { code: 'PE', name: '페루' },
    { code: 'PH', name: '필리핀' },
    { code: 'PL', name: '폴란드' },
    { code: 'PT', name: '포르투갈' },
    { code: 'QA', name: '카타르' },
    { code: 'RO', name: '루마니아' },
    { code: 'RU', name: '러시아' },
    { code: 'RW', name: '르완다' },
    { code: 'LC', name: '세인트루시아' },
    { code: 'VC', name: '세인트빈센트 그레나딘' },
    { code: 'WS', name: '사모아' },
    { code: 'SM', name: '산마리노' },
    { code: 'ST', name: '상투메 프린시페' },
    { code: 'SA', name: '사우디아라비아' },
    { code: 'SN', name: '세네갈' },
    { code: 'RS', name: '세르비아' },
    { code: 'SC', name: '세이셸' },
    { code: 'SL', name: '시에라리온' },
    { code: 'SG', name: '싱가포르' },
    { code: 'SK', name: '슬로바키아' },
    { code: 'SI', name: '슬로베니아' },
    { code: 'SB', name: '솔로몬 제도' },
    { code: 'SO', name: '소말리아' },
    { code: 'ZA', name: '남아프리카공화국' },
    { code: 'SS', name: '남수단' },
    { code: 'ES', name: '스페인' },
    { code: 'LK', name: '스리랑카' },
    { code: 'SD', name: '수단' },
    { code: 'SR', name: '수리남' },
    { code: 'SE', name: '스웨덴' },
    { code: 'CH', name: '스위스' },
    { code: 'SY', name: '시리아' },
    { code: 'TW', name: '대만' },
    { code: 'TJ', name: '타지키스탄' },
    { code: 'TZ', name: '탄자니아' },
    { code: 'TH', name: '태국' },
    { code: 'TL', name: '동티모르' },
    { code: 'TG', name: '토고' },
    { code: 'TO', name: '통가' },
    { code: 'TT', name: '트리니다드 토바고' },
    { code: 'TN', name: '튀니지' },
    { code: 'TR', name: '튀르키예' },
    { code: 'TM', name: '투르크메니스탄' },
    { code: 'TV', name: '투발루' },
    { code: 'UG', name: '우간다' },
    { code: 'UA', name: '우크라이나' },
    { code: 'AE', name: '아랍에미리트' },
    { code: 'GB', name: '영국' },
    { code: 'US', name: '미국' },
    { code: 'UY', name: '우루과이' },
    { code: 'UZ', name: '우즈베키스탄' },
    { code: 'VU', name: '바누아투' },
    { code: 'VE', name: '베네수엘라' },
    { code: 'VN', name: '베트남' },
    { code: 'YE', name: '예멘' },
    { code: 'ZM', name: '잠비아' },
    { code: 'ZW', name: '짐바브웨' },
    { code: 'HK', name: '홍콩' },
    { code: 'MO', name: '마카오' },
    { code: 'PS', name: '팔레스타인' },
    { code: 'XK', name: '코소보' },
];

/** 전체 국가 섹션 헤더 바로 아래에 고정 노출 (명세 자주 쓰는 국적) */
const NATN_PIN_AFTER_ALL_HEADER = ['JP', 'US', 'CN'];
const EXCLUDED_FROM_ALPHA = new Set(['KR'].concat(NATN_PIN_AFTER_ALL_HEADER));

/** 은행/증권 그리드 타일과 동일 체크 아이콘 */
const NATN_CHECK_SVG =
    '<svg class="nationality-item-check-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
    '<path d="M4 10.5L8 14.5L16 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

function getCountryByCode(code) {
    for (let i = 0; i < COUNTRIES.length; i++) {
        if (COUNTRIES[i].code === code) {
            return COUNTRIES[i];
        }
    }
    return null;
}

function getCountryByName(name) {
    if (!name) return null;
    const n = String(name).trim();
    for (let i = 0; i < COUNTRIES.length; i++) {
        if (COUNTRIES[i].name === n) {
            return COUNTRIES[i];
        }
    }
    return null;
}

/** nations SVG를 span 안에 채움 */
function fillNationalityFlagContainer(container, countryCode) {
    if (!container) return;
    container.textContent = '';
    const url = typeof nationIconUrl === 'function' ? nationIconUrl(countryCode) : null;
    if (!url) return;
    const img = document.createElement('img');
    img.className = 'nationality-flag-img';
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = function () {
        img.remove();
    };
    container.appendChild(img);
}

function setNationalityTriggerUI(country) {
    const wrap = document.getElementById('nationalityDisplay');
    const visual = document.getElementById('nationalityDisplayVisual');
    const textEl = document.getElementById('nationalityDisplayText');
    if (!wrap || !textEl) return;
    textEl.textContent = country ? country.name : '국적 선택';
    wrap.classList.toggle('is-selected', !!country);
    if (!visual) return;
    visual.innerHTML = '';
    if (!country) return;
    const url = typeof nationIconUrl === 'function' ? nationIconUrl(country.code) : null;
    if (url) {
        const img = document.createElement('img');
        img.className = 'nationality-trigger-icon';
        img.alt = '';
        img.width = 24;
        img.height = 18;
        img.decoding = 'async';
        img.src = url;
        img.onerror = function () {
            img.remove();
        };
        visual.appendChild(img);
    }
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
        el.className = 'nationality-item' + (country.code === selectedCode ? ' is-selected' : '');
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        el.dataset.code = country.code;

        const check = document.createElement('span');
        check.className = 'nationality-item-check';
        check.setAttribute('aria-hidden', 'true');
        check.innerHTML = NATN_CHECK_SVG;

        const inner = document.createElement('div');
        inner.className = 'nationality-item-inner';

        const flagEl = document.createElement('span');
        flagEl.className = 'nationality-flag';
        flagEl.setAttribute('aria-hidden', 'true');
        fillNationalityFlagContainer(flagEl, country.code);

        const nameEl = document.createElement('span');
        nameEl.className = 'nationality-item-name';
        nameEl.textContent = country.name;

        inner.appendChild(flagEl);
        inner.appendChild(nameEl);
        el.appendChild(check);
        el.appendChild(inner);

        function activate() {
            selectCountry(country);
        }
        el.addEventListener('click', activate);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
            }
        });
        return el;
    }

    function selectCountry(country) {
        selectedCode = country.code;
        hiddenInput.value = country.code;
        setNationalityTriggerUI(country);
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

    /** 세션에 nationality(ISO)·nationalityName(OTHER 복원용) 있으면 국적 동기화 */
    (function applyStoredNationality() {
        const kyc = KYC.loadStep();
        const code = (kyc.nationality || '').trim().toUpperCase();
        let c = code ? getCountryByCode(code) : null;
        if (!c && kyc.nationalityName) {
            c = getCountryByName(kyc.nationalityName);
        }
        if (c) {
            selectCountry(c);
            KYC.saveStep({ nationality: c.code, nationalityName: c.name });
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
    KYC.closeJusoPopup();
};

function searchAddress() {
    const width = 500;
    const height = 600;
    const left = Math.round((window.screen.width - width) / 2);
    const top = Math.round((window.screen.height - height) / 2);
    const base = window.location.origin;
    const popupUrl = `${base}/juso-popup.html`;
    KYC.openJusoPopup(
        popupUrl,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
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
    const natCode = document.getElementById('selectNationality').value;
    const natRow = getCountryByCode(natCode);
    const natName = natRow ? natRow.name : '';

    const regZip = zipEl.value.replace(/\D/g, '');

    KYC.saveStep({
        passportName: `${document.getElementById('inputPassportLastName').value} ${document.getElementById('inputPassportFirstName').value}`.trim(),
        nationality: natCode,
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
