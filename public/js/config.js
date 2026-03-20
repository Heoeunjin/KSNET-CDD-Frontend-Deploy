/**
 * KYC 프론트 선택 설정
 *
 * 프론트만 Live Server(예: 5500)로 열고, API·주소 팝업은 node(8080)에서 띄우는 경우:
 *   window.KYC_PROXY_BASE = 'http://127.0.0.1:8080';
 * 를 이 파일 맨 아래 주석을 해제하거나, 각 HTML 에서 kyc-api.js 보다 먼저 인라인으로 설정하세요.
 *
 * 주소 검색(opener.jusoCallBack)은 보안상 부모·팝업이 같은 출처여야 하므로,
 * 가능하면 `npm start` 한 포트에서만 여는 것을 권장합니다.
 */

// window.KYC_PROXY_BASE = 'http://127.0.0.1:8080';
