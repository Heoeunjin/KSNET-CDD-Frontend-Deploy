/**
 * 약관 상세: 하단 동의 체크 후 sessionStorage 저장 및 뒤로가기
 * body[data-terms-storage-key] 필수
 */
(function initTermsDetailPage() {
    const key = document.body.getAttribute('data-terms-storage-key');
    const cb = document.getElementById('termsPageAgree');
    const btn = document.getElementById('termsPageNext');
    const hint = document.querySelector('.terms-page-consent-hint');
    if (!key || !cb || !btn) return;

    if (sessionStorage.getItem(key) === '1') {
        cb.checked = true;
    }

    function refresh() {
        const on = cb.checked;
        btn.disabled = !on;
        if (hint) {
            hint.hidden = on;
        }
    }

    cb.addEventListener('change', refresh);
    btn.addEventListener('click', () => {
        if (!cb.checked) return;
        sessionStorage.setItem(key, '1');
        history.back();
    });

    refresh();
})();
