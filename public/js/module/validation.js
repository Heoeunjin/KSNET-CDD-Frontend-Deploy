/**
 * KSNET KYC - 입력 유효성 검사 헬퍼
 */

const Validation = {

    /**
     * 모바일 한글/영문 키보드 IME 조합 중에는 handler를 호출하지 않음.
     * 조합이 끝난 뒤(compositionend·일반 input)에만 sanitize/포맷을 적용해 입력이 끊기지 않게 함.
     * @param {HTMLInputElement} el
     * @param {(el: HTMLInputElement) => void} handler
     */
    bindImeAwareInput(el, handler) {
        if (!el || typeof handler !== 'function') return;
        let composing = false;
        el.addEventListener('compositionstart', function () {
            composing = true;
        });
        el.addEventListener('compositionend', function () {
            composing = false;
            handler(el);
        });
        el.addEventListener('input', function (e) {
            if (e.isComposing || composing) return;
            handler(el);
        });
    },

    /**
     * 폼 그룹에 에러 상태 표시
     * @param {HTMLElement} inputBox - .input-box 또는 .select-box 엘리먼트
     * @param {HTMLElement} errorEl - .error-msg 엘리먼트
     * @param {string} message - 에러 메시지
     */
    showError(inputBox, errorEl, message) {
        if (inputBox) inputBox.classList.add('is-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('is-show');
        }
    },

    /**
     * 에러 상태 제거
     * @param {HTMLElement} inputBox - .input-box 또는 .select-box
     * @param {HTMLElement} errorEl - .error-msg
     */
    clearError(inputBox, errorEl) {
        if (inputBox) inputBox.classList.remove('is-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('is-show');
        }
    }
};
