// js/state.js

// Global state variables
let currentStudentId = null;
let appState = {};       // { deptId: { courses, assignments, resources } }
let resourceTabs = {};   // { deptId: 'lecture' | 'note' }
let pendingDelete = null;
let pendingAccess = null;
let examIntervalId = null;

// ----- LocalStorage helpers -----
function deptKey(studentId, deptId) {
  return `${STORAGE_PREFIX}_${studentId}_${deptId}`;
}

function loadDeptData(deptId) {
  if (!currentStudentId) return { courses: [], assignments: [], resources: [] };
  const raw = localStorage.getItem(deptKey(currentStudentId, deptId));
  if (!raw) return { courses: [], assignments: [], resources: [] };

  try {
    const parsed = JSON.parse(raw);
    return {
      courses: parsed.courses || [],
      assignments: parsed.assignments || [],
      resources: parsed.resources || []
    };
  } catch (_) {
    return { courses: [], assignments: [], resources: [] };
  }
}

function saveDeptData(deptId) {
  if (!currentStudentId) return;
  const data = appState[deptId] || { courses: [], assignments: [], resources: [] };
  localStorage.setItem(deptKey(currentStudentId, deptId), JSON.stringify(data));
}

// ----- CGPA calculation -----
function calculateGpaForDept(deptId) {
  const data = appState[deptId] || { courses: [] };
  const bySemester = {};

  data.courses.forEach((c) => {
    const sem = c.semester || '1';
    if (!bySemester[sem]) {
      bySemester[sem] = { totalPoints: 0, totalCredits: 0 };
    }
    const gp = GRADE_POINTS[c.grade] ?? 0;
    bySemester[sem].totalPoints += gp * c.credit;
    bySemester[sem].totalCredits += c.credit;
  });

  const semesterResults = [];
  let grandPoints = 0;
  let grandCredits = 0;

  Object.keys(bySemester).sort().forEach((sem) => {
    const { totalPoints, totalCredits } = bySemester[sem];
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    semesterResults.push({ semester: sem, gpa });
    grandPoints += totalPoints;
    grandCredits += totalCredits;
  });

  const cgpa = grandCredits > 0 ? (grandPoints / grandCredits) : 0;
  return { semesterResults, cgpa };
}
