/**
 * 통합·경로 설정. 반드시 public/js/api/kyc-api.js 보다 먼저 로드하세요.
 *
 * 아래 두 값은 선택 사항입니다. 비우면 기본(사이트 루트 + 동일 출처의 /api/kyc/callback).
 * 하위 경로에만 KYC를 올릴 때 → KYC_PATH_PREFIX(선택)만 설정.
 * 프록시가 다른 호스트일 때 → KYC_PROXY_BASE(선택) 설정.
 *
 * KYC_PROXY_BASE (선택)
 *   KSNET 콜백 프록시 베이스. 스킴+호스트+선택 경로, 끝 슬래시 없음.
 *   예: https://api.example.com → POST …/api/kyc/callback
 *   Live Server만 쓸 때: http://localhost:8080
 *
 * KYC_PATH_PREFIX (선택)
 *   KYC가 사이트 루트가 아닐 때. 앞 슬래시 포함, 끝 슬래시 없음.
 *   예: /wallet/kyc → …/wallet/kyc/juso-popup.html 등
 *
 * 값은 이 파일을 수정하거나, 이 스크립트보다 먼저 실행되는 스크립트에서 할당.
 */
(function () {
    if (typeof window === 'undefined') return;
    if (typeof window.KYC_PROXY_BASE === 'undefined') window.KYC_PROXY_BASE = '';
    if (typeof window.KYC_PATH_PREFIX === 'undefined') window.KYC_PATH_PREFIX = '';

    /**
     * @param {string} path URL 경로 (/ 로 시작)
     * @returns {string} prefix 반영된 경로
     */
    window.kycAppPath = function (path) {
        var p = String(path || '');
        if (p.charAt(0) !== '/') p = '/' + p;
        var prefix = String(window.KYC_PATH_PREFIX || '').replace(/\/$/, '');
        return prefix ? prefix + p : p;
    };

    /** 행안부 주소 팝업 (백엔드에서 server.js 의 juso-popup 과 동일 역할 필요) */
    window.kycJusoPopupUrl = function () {
        return window.location.origin + window.kycAppPath('/juso-popup.html');
    };
})();
