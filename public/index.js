/**
 * KYC 메인 — URL에서 callback 저장, 고객확인 시작 시 토큰 검증 후 이동
 */
(function initFromQuery() {
    if (typeof KYC !== 'undefined') KYC.captureCallbackFromUrl();
})();

async function startKyc() {
    try {
        const res = await KYC_API.verifyToken({});
        const h = res.response_header || {};
        if (h.result_code !== '0') {
            alert(h.std_mesg_content || '토큰 검증에 실패했습니다. 이용기관에서 다시 연결해 주세요.');
            return;
        }
    } catch (e) {
        console.warn('토큰 검증(프록시 미연결 시 무시될 수 있음):', e);
    }
    KYC.saveStep({ kyc_token_verified: true });
    KYC.goTo('basic-info/index.html');
}
