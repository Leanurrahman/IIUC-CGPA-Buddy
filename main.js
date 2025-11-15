// js/config.js

// Storage keys
const STORAGE_PREFIX = 'iiucCgpaBuddy_v1';
const STUDENT_ID_KEY = `${STORAGE_PREFIX}_studentId`;
const THEME_KEY = `${STORAGE_PREFIX}_theme`;
const EXAM_KEY = (studentId) => `${STORAGE_PREFIX}_${studentId}_exam`;

// Departments
const DEPARTMENTS = [
  {
    id: 'CSE',
    name: 'Computer Science & Engineering',
    emoji: '💻',
    gradient: 'from-orange-500 to-amber-400'
  },
  {
    id: 'EEE',
    name: 'Electrical & Electronic Engineering',
    emoji: '⚡',
    gradient: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'BBA',
    name: 'Business Administration',
    emoji: '📊',
    gradient: 'from-rose-500 to-orange-400'
  },
  {
    id: 'ENG',
    name: 'English Language & Literature',
    emoji: '📚',
    gradient: 'from-sky-500 to-cyan-400'
  },
  {
    id: 'LAW',
    name: 'Law & Justice',
    emoji: '⚖️',
    gradient: 'from-emerald-500 to-teal-400'
  }
];

// IIUC-style grade points (you can tweak if needed)
const GRADE_POINTS = {
  'A+': 4.0,
  'A': 3.75,
  'A-': 3.5,
  'B+': 3.25,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.25,
  'D': 2.0,
  'F': 0.0
};

// Notices (static for now)
const NOTICE_DATA = [
  {
    title: 'Mid Exam (All Departments)',
    detail: 'Scheduled tentatively on 25 Nov',
  },
  {
    title: 'Assignment Reminder',
    detail: 'Submit lab reports at least 24 hours before deadline.',
  },
  {
    title: 'Keep Google Drive Links Public',
    detail: 'Set access to "Anyone with the link → Viewer" when sharing files.',
  }
];
