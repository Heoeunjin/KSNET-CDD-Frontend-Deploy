/**
 * KSNET KYC - 추가정보 입력 스크립트
 */

let ownerStatus = 'yes'; // 기본값: 실소유자

/* --- 셀렉트 변경 시 버튼 체크 --- */
['selectOccupation', 'selectFundSource', 'selectTxPurpose'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', checkNextBtn);
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
    KYC.goTo('../id-verify/index.html');
}
