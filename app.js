// js/app.js

document.addEventListener('DOMContentLoaded', () => {
  // Theme, static UI
  initTheme();
  renderNotices();
  renderDepartmentsGrid();
  renderFooterNav();
  renderDepartmentSections();

  // Onboarding & data
  initOnboarding();

  // Exam countdown
  initExamForm();
  loadExamForStudent();

  // Delete modal buttons
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    performDelete();
    closeDeleteModal();
  });
  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    pendingDelete = null;
    closeDeleteModal();
  });

  // Resource access modal
  initAccessModal();
});
