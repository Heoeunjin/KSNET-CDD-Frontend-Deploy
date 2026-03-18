/**
 * KSNET KYC - 추가정보 입력 스크립트
 */

let ownerStatus = 'yes'; // 기본값: 실소유자

/* --- 커스텀 드롭다운 공통 초기화 --- */
function initCustomSelect(boxId, displayId, hiddenId) {
    const box = document.getElementById(boxId);
    const display = document.getElementById(displayId);
    const hidden = document.getElementById(hiddenId);
    const dropdown = box.querySelector('.custom-select-dropdown');
    const options = box.querySelectorAll('.custom-select-option');

    box.addEventListener('click', function (e) {
        const isOpen = box.classList.contains('is-open');
        // 다른 열린 드롭다운 닫기
        document.querySelectorAll('.custom-select.is-open').forEach(el => {
            if (el !== box) el.classList.remove('is-open');
        });
        box.classList.toggle('is-open', !isOpen);
    });

    dropdown.addEventListener('click', function (e) {
        e.stopPropagation();
        const opt = e.target.closest('.custom-select-option');
        if (!opt) return;
        const value = opt.dataset.value;
        const label = opt.textContent.trim();

        hidden.value = value;
        display.textContent = label;
        display.classList.add('is-selected');

        options.forEach(o => o.classList.toggle('is-selected', o === opt));
        box.classList.remove('is-open');
        checkNextBtn();
    });
}

initCustomSelect('occupationBox', 'occupationDisplay', 'selectOccupation');
initCustomSelect('fundSourceBox', 'fundSourceDisplay', 'selectFundSource');
initCustomSelect('txPurposeBox', 'txPurposeDisplay', 'selectTxPurpose');

document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.is-open').forEach(el => el.classList.remove('is-open'));
    }
});

/* --- 실소유자 선택 --- */
function selectOwner(value) {
    ownerStatus = value;
    document.getElementById('ownerYes').classList.toggle('is-selected', value === 'yes');
    document.getElementById('ownerNo').classList.toggle('is-selected', value === 'no');

    if (value === 'no') {
        KYC.openModal('modalNotOwner');
    }

    checkNextBtn();
}

/* --- 실소유자 아님 모달 닫기 → 다음 비활성화 --- */
function closeNotOwnerModal() {
    KYC.closeModal('modalNotOwner');
    // 아니오 선택 상태이므로 다음 버튼 비활성화 유지
    document.getElementById('btnNext').disabled = true;
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const occupation = document.getElementById('selectOccupation').value;
    const fundSource = document.getElementById('selectFundSource').value;
    const txPurpose = document.getElementById('selectTxPurpose').value;

    const isValid = occupation !== ''
        && fundSource !== ''
        && txPurpose !== ''
        && ownerStatus === 'yes';

    document.getElementById('btnNext').disabled = !isValid;
}

/* --- 다음 페이지 이동 --- */
function goNext() {
    KYC.saveStep({
        occupation: document.getElementById('selectOccupation').value,
        fundSource: document.getElementById('selectFundSource').value,
        txPurpose: document.getElementById('selectTxPurpose').value,
        isBeneficialOwner: true
    });
    KYC.goTo('../account-verify/index.html');
}
