/**
 * KSNET KYC - 카운트다운 타이머
 */

class CountdownTimer {
    /**
     * @param {HTMLElement} el - 타이머를 표시할 엘리먼트
     * @param {number} seconds - 총 시간(초), 기본 180초(3분)
     * @param {Function} onExpire - 만료 시 콜백
     */
    constructor(el, seconds = 180, onExpire = null) {
        this.el = el;
        this.totalSeconds = seconds;
        this.remaining = seconds;
        this.intervalId = null;
        this.onExpire = onExpire;
    }

    start() {
        this.stop(); // 기존 interval 정리 후 시작
        this.remaining = this.totalSeconds;
        this.render();
        this.intervalId = setInterval(() => {
            this.remaining--;
            this.render();
            if (this.remaining <= 0) {
                this.stop();
                if (typeof this.onExpire === 'function') {
                    this.onExpire();
                }
            }
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    render() {
        const clamped = Math.max(0, this.remaining);
        const m = String(Math.floor(clamped / 60)).padStart(2, '0');
        const s = String(clamped % 60).padStart(2, '0');
        if (this.el) {
            this.el.textContent = `${m}:${s}`;
        }
    }

    isRunning() {
        return this.intervalId !== null;
    }
}
