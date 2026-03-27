/**
 * KYC 메인(안내) — URL에서 callback 저장
 */
(function initFromQuery() {
    if (typeof KYC !== 'undefined') KYC.captureCallbackFromUrl();
})();
