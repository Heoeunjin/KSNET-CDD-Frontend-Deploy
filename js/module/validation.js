/**
 * KSNET KYC - 입력 유효성 검사 헬퍼
 */

const Validation = {

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
     */
    clearError(inputBox, errorEl) {
        if (inputBox) inputBox.classList.remove('is-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('is-show');
        }
    },

    /**
     * 다음 버튼 활성화 여부 체크
     * @param {HTMLButtonElement} btn
     * @param {Array<Function>} conditions - 각 조건 함수 배열 (모두 true일 때 활성화)
     */
    updateSubmitBtn(btn, conditions) {
        if (!btn) return;
        const isValid = conditions.every(fn => fn());
        btn.disabled = !isValid;
    }
};
