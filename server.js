/**
 * KSNET KYC — 로컬 개발/연동 서버
 * - ksnetProxy.jsp 와 동일: POST Body(JSON)를 KSNET 콜백 URL로 전달
 * - .env 의 가맹점·토큰·서명을 request_data 에 병합 (클라이언트가 넣은 값 우선)
 * - jusoPopup.jsp 와 동일: 행안부 도로명주소 모바일 연동 (승인키는 서버에서만 주입)
 *
 * 실행: npm install && npm start → http://localhost:${PORT}
 * 정적 파일 루트: ./public
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const PORT = Number(process.env.PORT) || 8080;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const KSNET_TARGET =
    (process.env.KSNET_API_BASE_URL || '').replace(/\/$/, '') +
    (process.env.KSNET_API_PATH || '/kapi/ksnetApiCallback.do');

/**
 * jusoPopup.jsp opener.jusoCallBack 인자 순서와 동일
 * roadFullAddr … emdNo 까지 25개
 */
/** 모바일에서 window.close() 실패 시 표시 (자동 닫기가 막힌 경우) */
const JUSO_CLOSE_FALLBACK_HTML =
    '<div style="font-family:system-ui,-apple-system,sans-serif;padding:24px 20px;text-align:center;font-size:15px;line-height:1.55;color:#111;">' +
    '<p style="margin:0 0 8px;">주소가 적용되었습니다.</p>' +
    '<p style="margin:0;font-size:13px;color:#555;">창이 남아 있으면 아래 버튼이나 브라우저에서 이 탭을 닫아 주세요.</p>' +
    '<p style="margin:20px 0 0;">' +
    '<button type="button" onclick="window.close()" style="padding:12px 22px;font-size:15px;border-radius:10px;border:1px solid #ccc;background:#fff;">닫기</button>' +
    '</p></div>';

const JUSO_CALLBACK_ORDER = [
    'roadFullAddr', 'roadAddrPart1', 'addrDetail', 'roadAddrPart2', 'engAddr',
    'jibunAddr', 'zipNo', 'admCd', 'rnMgtSn', 'bdMgtSn', 'detBdNmList',
    'bdNm', 'bdKdcd', 'siNm', 'sggNm', 'emdNm', 'liNm', 'rn', 'udrtYn',
    'buldMnnm', 'buldSlno', 'mtYn', 'lnbrMnnm', 'lnbrSlno', 'emdNo'
];

/** 모바일: addrMobileLinkUrl.do / PC: addrLinkUrl.do — .env 로 선택 */
function getJusoAddrLinkUrl() {
    if (process.env.JUSO_ADDR_LINK) return process.env.JUSO_ADDR_LINK.trim();
    return process.env.JUSO_LINK_MODE === 'pc'
        ? 'https://business.juso.go.kr/addrlink/addrLinkUrl.do'
        : 'https://business.juso.go.kr/addrlink/addrMobileLinkUrl.do';
}

function mergeKycEnvIntoBody(body) {
    const envDefaults = {};
    const map = [
        ['KSNET_LWRN_USNS_CD', 'lwrn_usns_cd'],
        ['KSNET_MERCH_NO', 'merch_no'],
        ['KSNET_MPAY_MSALT', 'mpay_msalt'],
        ['KSNET_SVC_TKN', 'ksnet_svc_tkn'],
        ['KSNET_MPAY_SGNT_VL', 'mpay_sgnt_vl']
    ];
    for (const [ev, key] of map) {
        const v = process.env[ev];
        if (v != null && v !== '') envDefaults[key] = v;
    }
    const rd = body.request_data && typeof body.request_data === 'object' ? body.request_data : {};
    return {
        ...body,
        request_data: { ...envDefaults, ...rd }
    };
}

/**
 * jusoPopup.jsp 첫 방문 분기 (inputYn != "Y") 와 동일
 * — confmKey / returnUrl / resultType POST → 행안부 연동 URL
 */
function renderJusoFirstLoad(confmKey, addrLinkUrl, resultType) {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>주소 검색</title>
</head>
<script>
// opener 연동 오류 시에만: 행안부 가이드에 따라 부모·팝업 공통 상위 도메인으로 설정
// document.domain = 'example.com';
function init() {
  var url = location.href.split('#')[0];
  var confmKey = ${JSON.stringify(confmKey)};
  var resultType = ${JSON.stringify(resultType)};
  var inputYn = '';
  if (inputYn != "Y") {
    document.form.confmKey.value = confmKey;
    document.form.returnUrl.value = url;
    document.form.resultType.value = resultType;
    document.form.action = ${JSON.stringify(addrLinkUrl)};
    document.form.submit();
  }
}
</script>
<body onload="init();">
<form id="form" name="form" method="post">
  <input type="hidden" id="confmKey" name="confmKey" value="">
  <input type="hidden" id="returnUrl" name="returnUrl" value="">
  <input type="hidden" id="resultType" name="resultType" value="">
</form>
</body>
</html>`;
}

/** GET·POST 공통: 쿼리 + 바디 병합 (행안부 콜백은 returnUrl 로 POST) */
function mergeJusoParams(req) {
    const body =
        req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    return { ...req.query, ...body };
}

/** jusoPopup.jsp 두 번째 분기 (inputYn == "Y") — opener.jusoCallBack 후 닫기 (모바일은 부모가 close) */
function renderJusoCallback(params) {
    const q = params || {};
    const args = JUSO_CALLBACK_ORDER.map((k) => JSON.stringify(q[k] != null ? String(q[k]) : ''));
    const fallbackInner = JSON.stringify(JUSO_CLOSE_FALLBACK_HTML);
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>주소 적용</title>
</head>
<body onload="init();">
<script>
function init() {
  try {
    if (window.opener && typeof window.opener.jusoCallBack === 'function') {
      window.opener.jusoCallBack(${args.join(',')});
    } else {
      alert('부모 창을 찾을 수 없습니다. 주소 검색을 다시 시도해 주세요.');
    }
  } catch (e) {
    console.error(e);
    alert('주소 반영 중 오류가 발생했습니다.');
  }
  setTimeout(function () {
    try {
      if (window.opener && window.opener.KYC && typeof window.opener.KYC.closeJusoPopup === 'function') {
        window.opener.KYC.closeJusoPopup();
      }
    } catch (e2) {}
    try {
      window.close();
    } catch (e3) {}
  }, 0);
  setTimeout(function () {
    try {
      if (document.visibilityState === 'visible' && document.body) {
        document.body.innerHTML = ${fallbackInner};
      }
    } catch (e4) {}
  }, 600);
}
</script>
</body>
</html>`;
}

const app = express();

app.use(
    cors({
        origin: FRONTEND_ORIGIN || true,
        credentials: true
    })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

function sendJusoPopup(req, res) {
    const confmKey = process.env.JUSO_CONFM_KEY;
    if (!confmKey) {
        res.status(500)
            .type('text/html; charset=utf-8')
            .send(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' +
                    '<p>도로명주소 승인키가 없습니다. 서버 환경변수 <code>JUSO_CONFM_KEY</code>를 설정하세요.</p>' +
                    '<p><a href="javascript:window.close()">닫기</a></p></body></html>'
            );
        return;
    }
    const merged = mergeJusoParams(req);
    if (merged.inputYn === 'Y') {
        res.type('text/html; charset=utf-8').send(renderJusoCallback(merged));
        return;
    }
    const addrLinkUrl = getJusoAddrLinkUrl();
    const resultType = (process.env.JUSO_RESULT_TYPE || '4').trim();
    res.type('text/html; charset=utf-8').send(renderJusoFirstLoad(confmKey, addrLinkUrl, resultType));
}

/**
 * 행안부 도로명주소 — jusoPopup.jsp 와 동일 흐름 (승인키: JUSO_CONFM_KEY).
 * 콜백은 POST 로 오므로 GET·POST 모두 처리.
 */
app.get('/juso-popup.html', sendJusoPopup);
app.post('/juso-popup.html', sendJusoPopup);

/** KSNET API 프록시 — 3.ksnetProxy.jsp 와 동일(POST JSON 전달) + .env 병합 */
app.post('/api/kyc/callback', async (req, res) => {
    if (!process.env.KSNET_API_BASE_URL || !process.env.KSNET_API_PATH) {
        res.status(500).json({
            error: 'KSNET_API_BASE_URL / KSNET_API_PATH 가 .env 에 설정되지 않았습니다.'
        });
        return;
    }
    try {
        const merged = mergeKycEnvIntoBody(req.body || {});
        const r = await fetch(KSNET_TARGET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(merged)
        });
        const text = await r.text();
        res.status(r.status).type('application/json; charset=utf-8').send(text);
    } catch (e) {
        console.error('[api/kyc/callback]', e);
        res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
});

/** 정적 파일은 public/ (브라우저 URL 루트 = public 루트) */
app.use(express.static(path.join(__dirname, 'public'), { index: ['index.html'] }));

app.listen(PORT, () => {
    console.log(`KSNET KYC 서버  http://127.0.0.1:${PORT}`);
    console.log(`  - 정적 파일 + POST /api/kyc/callback + GET|POST /juso-popup.html`);
});
