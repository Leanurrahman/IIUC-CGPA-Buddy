// js/ui.js

// ---------- THEME ----------
function applyTheme(theme) {
  const root = document.documentElement;
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    root.classList.add('dark');
    icon.textContent = '☀️';
  } else {
    root.classList.remove('dark');
    icon.textContent = '🌙';
  }
}

function initTheme() {
  let theme = localStorage.getItem(THEME_KEY);
  if (!theme) {
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// ---------- NOTICES ----------
function renderNotices() {
  const list = document.getElementById('noticeList');
  list.innerHTML = '';
  NOTICE_DATA.forEach((n) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <p class="font-medium">${n.title}</p>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">${n.detail}</p>
    `;
    list.appendChild(li);
  });
}

// ---------- EXAM COUNTDOWN ----------
function startExamCountdown(examIsoString) {
  const container = document.getElementById('examCountdown');
  if (examIntervalId) clearInterval(examIntervalId);

  if (!examIsoString) {
    container.textContent = 'No exam date set.';
    return;
  }

  const examDate = new Date(examIsoString);
  if (Number.isNaN(examDate.getTime())) {
    container.textContent = 'No exam date set.';
    return;
  }

  function update() {
    const now = new Date();
    const diff = examDate - now;
    if (diff <= 0) {
      container.textContent = '🎓 Exam time reached. Good luck!';
      clearInterval(examIntervalId);
      examIntervalId = null;
      return;
    }
    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    container.textContent = `${days}d ${hours}h ${minutes}m ${secs}s remaining`;
  }

  update();
  examIntervalId = setInterval(update, 1000);
}

function initExamForm() {
  const form = document.getElementById('examForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentStudentId) return;

    const input = document.getElementById('examDateTime');
    const value = input.value;
    if (!value) {
      startExamCountdown(null);
      localStorage.removeItem(EXAM_KEY(currentStudentId));
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      startExamCountdown(null);
      return;
    }
    const iso = date.toISOString();
    localStorage.setItem(EXAM_KEY(currentStudentId), iso);
    startExamCountdown(iso);
  });
}

function loadExamForStudent() {
  if (!currentStudentId) {
    startExamCountdown(null);
    return;
  }
  const raw = localStorage.getItem(EXAM_KEY(currentStudentId));
  if (!raw) {
    startExamCountdown(null);
    return;
  }
  startExamCountdown(raw);
}

// ---------- RENDER: departments list ----------
function renderDepartmentsGrid() {
  const grid = document.getElementById('departmentsGrid');
  grid.innerHTML = '';

  DEPARTMENTS.forEach((dept) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className =
      'flex flex-col items-start p-3 sm:p-4 rounded-soft bg-white dark:bg-slate-800 shadow-soft border border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition text-left';
    card.setAttribute('data-dept-id', dept.id);
    card.innerHTML = `
      <div class="flex items-center gap-2 mb-1.5">
        <div class="h-8 w-8 rounded-2xl bg-gradient-to-tr ${dept.gradient} flex items-center justify-center text-lg">
          <span>${dept.emoji}</span>
        </div>
        <div>
          <p class="font-heading text-sm font-semibold">${dept.id}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">${dept.name}</p>
        </div>
      </div>
      <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        CGPA, assignments & resources.
      </p>
    `;
    card.addEventListener('click', () => {
      const target = document.getElementById(`dept-${dept.id}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    grid.appendChild(card);
  });
}

// Footer nav
function renderFooterNav() {
  const nav = document.getElementById('footerDeptNav');
  nav.innerHTML = '';
  DEPARTMENTS.forEach((dept) => {
    const a = document.createElement('a');
    a.href = `#dept-${dept.id}`;
    a.className = 'hover:text-primary hover:underline';
    a.textContent = dept.id;
    nav.appendChild(a);
  });
}

// ---------- Department section template ----------
function departmentSectionTemplate(dept) {
  const gradeOptions = Object.keys(GRADE_POINTS)
    .map(g => `<option value="${g}">${g}</option>`)
    .join('');

  return `
    <section id="dept-${dept.id}" class="scroll-mt-28">
      <div class="mb-4">
        <div class="rounded-soft p-4 sm:p-5 bg-gradient-to-r ${dept.gradient} text-white shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs sm:text-sm opacity-80">Department</p>
              <h2 class="font-heading text-lg sm:text-2xl font-semibold flex items-center gap-2">
                <span>${dept.emoji}</span> <span>${dept.name} (${dept.id})</span>
              </h2>
            </div>
            <div class="hidden sm:flex flex-col items-end text-xs">
              <span class="bg-white/15 px-2 py-1 rounded-full mb-1">
                Per-student data only
              </span>
              <span class="opacity-80">Stored safely in this browser</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <!-- CGPA Calculator -->
        <div class="bg-white dark:bg-slate-800 rounded-soft shadow-soft p-4 sm:p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-heading text-base sm:text-lg font-semibold">
              🎓 CGPA Calculator
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Per Semester + Cumulative</span>
          </div>
          <form id="courseForm-${dept.id}" class="space-y-2 mb-3">
            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <label class="block text-[11px] font-medium mb-1">Course Code</label>
                <input type="text" name="code" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., CSE-1201" />
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Credit Hours</label>
                <select name="credit" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3" selected>3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Grade</label>
                <select name="grade" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  ${gradeOptions}
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-[11px] font-medium mb-1">Semester</label>
                <input type="text" name="semester" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 1, 2, 3, 4..." />
              </div>
            </div>
            <p id="courseError-${dept.id}" class="text-[11px] text-red-500 hidden">
              Please fill all fields correctly.
            </p>
            <button type="submit"
              class="w-full mt-1 inline-flex items-center justify-center rounded-soft bg-primary text-white text-xs sm:text-sm py-1.5 sm:py-2 font-medium hover:bg-orange-500 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition">
              Add Course
            </button>
          </form>
          <div class="overflow-x-auto mb-3">
            <table class="min-w-full text-[11px] sm:text-xs">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-700">
                  <th class="text-left py-1 pr-2">Course</th>
                  <th class="text-left py-1 pr-2">Cr</th>
                  <th class="text-left py-1 pr-2">Grade</th>
                  <th class="text-left py-1 pr-2">Sem</th>
                  <th class="text-right py-1">Actions</th>
                </tr>
              </thead>
              <tbody id="coursesBody-${dept.id}">
                <!-- Filled by JS -->
              </tbody>
            </table>
          </div>
          <div id="gpaSummary-${dept.id}" class="mt-auto border-t border-slate-100 dark:border-slate-700 pt-2 text-[11px] sm:text-xs">
            <!-- Filled by JS -->
          </div>
        </div>

        <!-- Assignment Tracker -->
        <div class="bg-white dark:bg-slate-800 rounded-soft shadow-soft p-4 sm:p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-heading text-base sm:text-lg font-semibold">
              📝 Assignment Tracker
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Per Department</span>
          </div>
          <form id="assignmentForm-${dept.id}" class="space-y-2 mb-3">
            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <label class="block text-[11px] font-medium mb-1">Title</label>
                <input type="text" name="title" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., OOP Lab Report" />
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Course Code</label>
                <input type="text" name="courseCode" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., CSE-2203" />
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Due Date</label>
                <input type="date" name="dueDate" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <p id="assignmentError-${dept.id}" class="text-[11px] text-red-500 hidden">
              Please fill all fields correctly.
            </p>
            <button type="submit"
              class="w-full mt-1 inline-flex items-center justify-center rounded-soft bg-primary text-white text-xs sm:text-sm py-1.5 sm:py-2 font-medium hover:bg-orange-500 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition">
              Add Assignment
            </button>
          </form>
          <div id="assignmentsList-${dept.id}" class="space-y-2 text-xs sm:text-sm">
            <!-- Filled by JS -->
          </div>
        </div>

        <!-- Resource & Notes Sharing -->
        <div class="bg-white dark:bg-slate-800 rounded-soft shadow-soft p-4 sm:p-5 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-heading text-base sm:text-lg font-semibold">
              📂 Resources & Notes
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Google Drive links only</span>
          </div>
          <div class="flex text-[11px] sm:text-xs mb-3 rounded-full bg-slate-100 dark:bg-slate-900 p-1">
            <button type="button" id="tab-lecture-${dept.id}"
              class="flex-1 rounded-full px-2 py-1 text-center font-medium bg-white dark:bg-slate-800 shadow-sm">
              Lecture Files
            </button>
            <button type="button" id="tab-notes-${dept.id}"
              class="flex-1 rounded-full px-2 py-1 text-center font-medium text-slate-600 dark:text-slate-300">
              Student Notes
            </button>
          </div>
          <form id="resourceForm-${dept.id}" class="space-y-2 mb-3">
            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <label class="block text-[11px] font-medium mb-1">Title</label>
                <input type="text" name="title" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Lecture 05 Slides" />
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Course Code</label>
                <input type="text" name="courseCode" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., CSE-2301" />
              </div>
              <div>
                <label class="block text-[11px] font-medium mb-1">Google Drive Link</label>
                <input type="url" name="link" required
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://drive.google.com/..." />
              </div>
              <div class="col-span-2">
                <label class="block text-[11px] font-medium mb-1">Access ID (optional)</label>
                <input type="text" name="accessId"
                  class="w-full rounded-soft border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Student ID required to open" />
              </div>
            </div>
            <p id="resourceError-${dept.id}" class="text-[11px] text-red-500 hidden">
              Please provide a valid Drive link and required fields.
            </p>
            <button type="submit"
              class="w-full mt-1 inline-flex items-center justify-center rounded-soft bg-primary text-white text-xs sm:text-sm py-1.5 sm:py-2 font-medium hover:bg-orange-500 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition">
              Share ${dept.id} Resource
            </button>
            <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Contributor ID will be auto-filled as your Student ID.
            </p>
          </form>
          <div id="resourcesList-${dept.id}" class="space-y-2 text-xs sm:text-sm">
            <!-- Filled by JS -->
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderDepartmentSections() {
  const container = document.getElementById('departmentsContainer');
  container.innerHTML = '';

  DEPARTMENTS.forEach((dept) => {
    resourceTabs[dept.id] = 'lecture';
    // initial empty; real data load hobe onboarding e
    appState[dept.id] = { courses: [], assignments: [], resources: [] };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = departmentSectionTemplate(dept);
    container.appendChild(wrapper.firstElementChild);
  });

  // Attach listeners
  DEPARTMENTS.forEach((dept) => {
    const courseForm = document.getElementById(`courseForm-${dept.id}`);
    courseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddCourse(dept.id, e.target);
    });

    const assignmentForm = document.getElementById(`assignmentForm-${dept.id}`);
    assignmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddAssignment(dept.id, e.target);
    });

    const resourceForm = document.getElementById(`resourceForm-${dept.id}`);
    resourceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddResource(dept.id, e.target);
    });

    const tabLecture = document.getElementById(`tab-lecture-${dept.id}`);
    const tabNotes = document.getElementById(`tab-notes-${dept.id}`);

    tabLecture.addEventListener('click', () => {
      resourceTabs[dept.id] = 'lecture';
      tabLecture.classList.add('bg-white', 'dark:bg-slate-800', 'shadow-sm');
      tabLecture.classList.remove('text-slate-600', 'dark:text-slate-300');
      tabNotes.classList.remove('bg-white', 'dark:bg-slate-800', 'shadow-sm');
      tabNotes.classList.add('text-slate-600', 'dark:text-slate-300');
      renderResources(dept.id);
    });

    tabNotes.addEventListener('click', () => {
      resourceTabs[dept.id] = 'note';
      tabNotes.classList.add('bg-white', 'dark:bg-slate-800', 'shadow-sm');
      tabNotes.classList.remove('text-slate-600', 'dark:text-slate-300');
      tabLecture.classList.remove('bg-white', 'dark:bg-slate-800', 'shadow-sm');
      tabLecture.classList.add('text-slate-600', 'dark:text-slate-300');
      renderResources(dept.id);
    });

    renderCourses(dept.id);
    renderAssignments(dept.id);
    renderResources(dept.id);
  });
}

// ---------- RENDER: courses ----------
function renderCourses(deptId) {
  const tbody = document.getElementById(`coursesBody-${deptId}`);
  const summary = document.getElementById(`gpaSummary-${deptId}`);
  const data = appState[deptId] || { courses: [] };

  tbody.innerHTML = '';
  if (!data.courses.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          No courses added yet.
        </td>
      </tr>
    `;
    summary.innerHTML = `<p class="text-slate-500 dark:text-slate-400">Add courses to see GPA and CGPA.</p>`;
    return;
  }

  data.courses.forEach((c) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-50 dark:border-slate-700/40';
    tr.innerHTML = `
      <td class="py-1 pr-2">${c.code}</td>
      <td class="py-1 pr-2">${c.credit}</td>
      <td class="py-1 pr-2">${c.grade}</td>
      <td class="py-1 pr-2">${c.semester}</td>
      <td class="py-1 pl-2 text-right">
        <button type="button"
          class="text-[10px] text-red-500 hover:text-red-600"
          data-delete-course="${c.id}" data-dept="${deptId}">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-delete-course]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-course');
      const dId = btn.getAttribute('data-dept');
      requestDelete('course', dId, id);
    });
  });

  const { semesterResults, cgpa } = calculateGpaForDept(deptId);
  const lines = semesterResults.map(s =>
    `<li>Semester <span class="font-semibold">${s.semester}</span> GPA:
       <span class="font-semibold">${s.gpa.toFixed(2)}</span></li>`
  ).join('');

  summary.innerHTML = `
    <p class="font-medium mb-1">Summary</p>
    <ul class="space-y-0.5">${lines}</ul>
    <p class="mt-1 text-xs">
      Cumulative CGPA:
      <span class="font-heading font-semibold text-primary">${cgpa.toFixed(2)}</span>
    </p>
  `;
}

// ---------- RENDER: assignments ----------
function renderAssignments(deptId) {
  const container = document.getElementById(`assignmentsList-${deptId}`);
  const data = appState[deptId] || { assignments: [] };

  container.innerHTML = '';
  if (!data.assignments.length) {
    container.innerHTML = `
      <p class="text-[11px] text-slate-500 dark:text-slate-400">
        No assignments added yet.
      </p>
    `;
    return;
  }

  const sorted = [...data.assignments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  sorted.forEach((a) => {
    const isDone = a.status === 'done';
    const card = document.createElement('div');
    card.className =
      'rounded-soft border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2 flex flex-col gap-1';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="font-medium ${isDone ? 'line-through text-slate-400' : ''}">${a.title}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Course: ${a.courseCode}</p>
        </div>
        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px]
          ${isDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                   : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'}">
          ${isDone ? 'Done' : 'Pending'}
        </span>
      </div>
      <div class="flex items-center justify-between text-[11px] mt-1">
        <span class="text-slate-500 dark:text-slate-400">
          Due: ${a.dueDate || 'N/A'}
        </span>
        <div class="flex items-center gap-2">
          <button type="button"
            class="text-[11px] text-primary hover:underline"
            data-toggle-assignment="${a.id}" data-dept="${deptId}">
            Mark as ${isDone ? 'Pending' : 'Done'}
          </button>
          <button type="button"
            class="text-[11px] text-red-500 hover:underline"
            data-delete-assignment="${a.id}" data-dept="${deptId}">
            Delete
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-toggle-assignment]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle-assignment');
      const dId = btn.getAttribute('data-dept');
      toggleAssignmentStatus(dId, id);
    });
  });

  container.querySelectorAll('[data-delete-assignment]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-assignment');
      const dId = btn.getAttribute('data-dept');
      requestDelete('assignment', dId, id);
    });
  });
}

// ---------- RENDER: resources ----------
function renderResources(deptId) {
  const container = document.getElementById(`resourcesList-${deptId}`);
  const data = appState[deptId] || { resources: [] };

  container.innerHTML = '';
  const activeType = resourceTabs[deptId] === 'note' ? 'note' : 'lecture';
  const filtered = data.resources.filter(r => r.type === activeType);

  if (!filtered.length) {
    container.innerHTML = `
      <p class="text-[11px] text-slate-500 dark:text-slate-400">
        No ${activeType === 'lecture' ? 'lecture files' : 'student notes'} shared yet.
      </p>
    `;
    return;
  }

  filtered.forEach((r) => {
    const isOwner = r.contributorId === currentStudentId;
    const locked = !!r.accessId;
    const card = document.createElement('div');
    card.className =
      'rounded-soft border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2 flex flex-col gap-1';
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex-1">
          <p class="font-medium line-clamp-1">${r.title}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            ${r.courseCode} • By ${r.contributorId}
          </p>
        </div>
        ${locked
          ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-amber-300 dark:bg-slate-100 dark:text-amber-700">Locked</span>`
          : `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Public</span>`
        }
      </div>
      <div class="flex items-center justify-between mt-1 text-[11px]">
        <div class="flex items-center gap-2">
          <button type="button"
            class="inline-flex items-center px-2 py-0.5 rounded-full border border-primary/60 text-primary hover:bg-primary hover:text-white transition"
            data-view-resource="${r.id}" data-dept="${deptId}">
            ${locked ? 'Enter Access ID' : 'Open File'}
          </button>
          <a href="${locked ? '#' : r.link}" target="${locked ? '' : '_blank'}"
             rel="${locked ? '' : 'noopener noreferrer'}"
             class="hidden"
             data-open-link="${r.id}">
            Open
          </a>
        </div>
        ${isOwner
          ? `<button type="button"
               class="text-[11px] text-red-500 hover:underline"
               data-delete-resource="${r.id}" data-dept="${deptId}">
               Delete
             </button>`
          : ''
        }
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-view-resource]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-view-resource');
      const dId = btn.getAttribute('data-dept');
      handleResourceViewRequest(dId, id);
    });
  });

  container.querySelectorAll('[data-delete-resource]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-resource');
      const dId = btn.getAttribute('data-dept');
      requestDelete('resource', dId, id);
    });
  });
}

// ---------- HANDLERS: add / toggle / delete ----------
function handleAddCourse(deptId, form) {
  const code = form.code.value.trim();
  const credit = Number(form.credit.value);
  const grade = form.grade.value;
  const semester = form.semester.value.trim();
  const errorEl = document.getElementById(`courseError-${deptId}`);

  if (!code || !semester || Number.isNaN(credit) ||
      credit < 1 || credit > 4 ||
      !Object.prototype.hasOwnProperty.call(GRADE_POINTS, grade)) {
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  const newCourse = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    code,
    credit,
    grade,
    semester
  };

  appState[deptId].courses.push(newCourse);
  saveDeptData(deptId);
  form.reset();
  renderCourses(deptId);
}

function handleAddAssignment(deptId, form) {
  const title = form.title.value.trim();
  const courseCode = form.courseCode.value.trim();
  const dueDate = form.dueDate.value;
  const errorEl = document.getElementById(`assignmentError-${deptId}`);

  if (!title || !courseCode || !dueDate) {
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  const newAssignment = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    courseCode,
    dueDate,
    status: 'pending'
  };

  appState[deptId].assignments.push(newAssignment);
  saveDeptData(deptId);
  form.reset();
  renderAssignments(deptId);
}

function handleAddResource(deptId, form) {
  const title = form.title.value.trim();
  const courseCode = form.courseCode.value.trim();
  const link = form.link.value.trim();
  const accessIdRaw = form.accessId.value.trim();
  const errorEl = document.getElementById(`resourceError-${deptId}`);

  const isDriveLink = link.startsWith('https://drive.google.com/');
  if (!title || !courseCode || !link || !isDriveLink) {
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  const type = resourceTabs[deptId] === 'note' ? 'note' : 'lecture';

  const newResource = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    courseCode,
    link,
    accessId: accessIdRaw || null,
    contributorId: currentStudentId || 'Unknown',
    type
  };

  appState[deptId].resources.push(newResource);
  saveDeptData(deptId);
  form.reset();
  renderResources(deptId);
}

function toggleAssignmentStatus(deptId, assignmentId) {
  const data = appState[deptId];
  if (!data) return;
  const a = data.assignments.find(x => x.id === assignmentId);
  if (!a) return;
  a.status = (a.status === 'done') ? 'pending' : 'done';
  saveDeptData(deptId);
  renderAssignments(deptId);
}

// ---------- Delete modal ----------
function requestDelete(type, deptId, id) {
  pendingDelete = { type, deptId, id };
  const modal = document.getElementById('confirmModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('no-scroll');
}

function performDelete() {
  if (!pendingDelete) return;
  const { type, deptId, id } = pendingDelete;
  const data = appState[deptId];
  if (!data) return;

  if (type === 'course') {
    data.courses = data.courses.filter(c => c.id !== id);
    saveDeptData(deptId);
    renderCourses(deptId);
  } else if (type === 'assignment') {
    data.assignments = data.assignments.filter(a => a.id !== id);
    saveDeptData(deptId);
    renderAssignments(deptId);
  } else if (type === 'resource') {
    data.resources = data.resources.filter(r => r.id !== id);
    saveDeptData(deptId);
    renderResources(deptId);
  }

  pendingDelete = null;
}

function closeDeleteModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('no-scroll');
}

// ---------- Resource access modal ----------
function handleResourceViewRequest(deptId, resourceId) {
  const data = appState[deptId];
  if (!data) return;
  const resource = data.resources.find(r => r.id === resourceId);
  if (!resource) return;

  if (!resource.accessId) {
    // Public – directly open
    const linkEl = document.querySelector(`[data-open-link="${resourceId}"]`);
    if (linkEl) {
      linkEl.setAttribute('href', resource.link);
      linkEl.setAttribute('target', '_blank');
      linkEl.setAttribute('rel', 'noopener noreferrer');
      linkEl.click();
    } else {
      window.open(resource.link, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  pendingAccess = { deptId, resourceId };
  const modal = document.getElementById('accessModal');
  const accessInput = document.getElementById('accessInput');
  const accessError = document.getElementById('accessError');

  accessInput.value = '';
  accessError.classList.add('hidden');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('no-scroll');
  accessInput.focus();
}

function closeAccessModal() {
  const modal = document.getElementById('accessModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('no-scroll');
  pendingAccess = null;
}

function initAccessModal() {
  const form = document.getElementById('accessForm');
  const input = document.getElementById('accessInput');
  const error = document.getElementById('accessError');
  const cancelBtn = document.getElementById('cancelAccessBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingAccess) return;

    const enteredId = input.value.trim();
    if (!enteredId) {
      error.textContent = 'Access ID is required.';
      error.classList.remove('hidden');
      return;
    }

    const { deptId, resourceId } = pendingAccess;
    const data = appState[deptId];
    if (!data) return;
    const resource = data.resources.find(r => r.id === resourceId);
    if (!resource) return;

    if (resource.accessId && resource.accessId === enteredId) {
      error.classList.add('hidden');
      closeAccessModal();
      const linkEl = document.querySelector(`[data-open-link="${resourceId}"]`);
      if (linkEl) {
        linkEl.setAttribute('href', resource.link);
        linkEl.setAttribute('target', '_blank');
        linkEl.setAttribute('rel', 'noopener noreferrer');
        linkEl.click();
      } else {
        window.open(resource.link, '_blank', 'noopener,noreferrer');
      }
    } else {
      error.textContent = 'Access ID does not match.';
      error.classList.remove('hidden');
    }
  });

  cancelBtn.addEventListener('click', () => {
    closeAccessModal();
  });
}

// ---------- Onboarding / Student ID ----------
function updateWelcomeText() {
  const el = document.getElementById('welcomeText');
  el.textContent = currentStudentId
    ? `Welcome, ${currentStudentId}!`
    : 'Welcome, Student!';
}

function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  modal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  const input = document.getElementById('studentIdInput');
  input.value = '';
  setTimeout(() => input.focus(), 50);
}

function hideOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

function initOnboarding() {
  const savedId = localStorage.getItem(STUDENT_ID_KEY);
  if (savedId) {
    currentStudentId = savedId;
    updateWelcomeText();
    hideOnboardingModal();

    DEPARTMENTS.forEach(d => {
      appState[d.id] = loadDeptData(d.id);
      renderCourses(d.id);
      renderAssignments(d.id);
      renderResources(d.id);
    });
  } else {
    showOnboardingModal();
  }

  const form = document.getElementById('studentIdForm');
  const input = document.getElementById('studentIdInput');
  const error = document.getElementById('studentIdError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = input.value.trim();
    if (!id) {
      error.textContent = 'Student ID is required.';
      error.classList.remove('hidden');
      return;
    }
    error.classList.add('hidden');

    currentStudentId = id;
    localStorage.setItem(STUDENT_ID_KEY, id);
    updateWelcomeText();
    hideOnboardingModal();

    DEPARTMENTS.forEach(d => {
      appState[d.id] = loadDeptData(d.id);
      renderCourses(d.id);
      renderAssignments(d.id);
      renderResources(d.id);
    });
    loadExamForStudent();
  });

  document.getElementById('changeIdBtn').addEventListener('click', () => {
    showOnboardingModal();
  });
}
