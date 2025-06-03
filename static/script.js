const gradeToGP = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "D": 1.0,
  "F": 0.0,
  "I": null // Incomplete, not counted in CGPA
};

function renderGradeDropdown(sectionIndex, subIndex, courseIndex, selectedGrade) {
  return `
    <select onchange="updateGrade(${sectionIndex}, ${subIndex}, ${courseIndex}, this.value)"
      class="border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      ${Object.entries(gradeToGP).map(([grade, _]) =>
        `<option value="${grade}" ${grade === selectedGrade ? 'selected' : ''}>${grade}</option>`).join("")}
    </select>
  `;
}

function renderTable(sections) {
  const container = document.getElementById("sections");
  container.innerHTML = "";

  sections.forEach((section, sectionIndex) => {
    let sectionHtml = `<div><h2 class="text-2xl font-semibold mb-2">${section.title}</h2>`;

    section.subsections.forEach((sub, subIndex) => {
      sectionHtml += `<h3 class="text-lg font-medium mt-4 mb-2">${sub.title}</h3>`;
      sectionHtml += `
        <div class="rounded-lg border-2 border-gray-500 dark:border-gray-400 overflow-hidden shadow-lg mb-4">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-300 dark:bg-gray-700 font-medium text-gray-800 dark:text-gray-100">
                <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Code</th>
                <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Name</th>
                <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Credit</th>
                <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Grade</th>
                <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">GP</th>
              </tr>
            </thead>
            <tbody>
      `;

      sub.courses.forEach((course, courseIndex) => {
        const gp = gradeToGP[course.grade];
        const rowBgClass = courseIndex % 2 === 0 
          ? "bg-gray-50 dark:bg-gray-800" 
          : "bg-white dark:bg-gray-900";

        sectionHtml += `
              <tr class="${rowBgClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">${course.code}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">${course.name}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">${course.credit}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">${renderGradeDropdown(sectionIndex, subIndex, courseIndex, course.grade)}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1" id="gp-${sectionIndex}-${subIndex}-${courseIndex}">${gp}</td>
              </tr>
        `;
      });

      sectionHtml += `</tbody></table></div>`;

      if (sub.available && sub.available.length > 0) {
        const dropdownId = `add-select-${sectionIndex}-${subIndex}`;
        sectionHtml += `
          <div class="flex gap-2 items-center mb-4">
            <select id="${dropdownId}" class="px-2 py-1 border rounded dark:bg-gray-800 dark:text-white">
              ${sub.available.map(course => `<option value="${course.code}">${course.code} - ${course.name}</option>`).join("")}
            </select>
            <button onclick="addCourse(${sectionIndex}, ${subIndex}, '${dropdownId}')" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              Add Course
            </button>
          </div>
        `;
      }
    });

    sectionHtml += `</div>`;
    container.innerHTML += sectionHtml;
  });
}


function updateGrade(sectionIndex, subIndex, courseIndex, newGrade) {
  const course = sectionsData[sectionIndex].subsections[subIndex].courses[courseIndex];
  course.grade = newGrade;
  const newGP = gradeToGP[newGrade];
  document.getElementById(`gp-${sectionIndex}-${subIndex}-${courseIndex}`).innerText = newGP;
  calculateSummary();
  saveToLocalStorage();
}


function addCourse(sectionIndex, subIndex, dropdownId) {
  const selectEl = document.getElementById(dropdownId);
  const selectedCode = selectEl.value;

  const sub = sectionsData[sectionIndex].subsections[subIndex];
  const selectedCourse = sub.available.find(c => c.code === selectedCode);

  if (!selectedCourse) return;

  sub.courses.push({
    ...selectedCourse,
    grade: "A"
  });

  sub.available = sub.available.filter(c => c.code !== selectedCode);

  renderTable(sectionsData);
  calculateSummary();
  saveToLocalStorage();
}


function calculateSummary() {
  let totalCredits = 0;
  let totalPoints = 0;
  let totalCourses = 0;

  sectionsData.forEach(section => {
    section.subsections.forEach(sub => {
      sub.courses.forEach(course => {
        const gp = gradeToGP[course.grade];
        if (gp !== null && gp !== undefined) {
          totalCredits += course.credit;
          totalPoints += course.credit * gp;
        }
        totalCourses++;
      });
    });
  });

  document.getElementById("totalCredits").innerText = totalCredits;
  document.getElementById("totalCourses").innerText = totalCourses;
  document.getElementById("cgpa").innerText = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "-";
}

function loadData() {
  renderTable(sectionsData);
  calculateSummary();
}

function setDarkMode(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("darkMode", isDark ? "true" : "false");
  updateDarkToggleButton(isDark);
}

function updateDarkToggleButton(isDark) {
  const btn = document.getElementById("darkToggle");
  if (!btn) return;
  btn.innerHTML = isDark
    ? '<span class="inline-block align-middle mr-2">🌙</span> Light Mode'
    : '<span class="inline-block align-middle mr-2">☀️</span> Dark Mode';
}

function toggleDarkMode() {
  const isDark = !document.documentElement.classList.contains("dark");
  setDarkMode(isDark);
}

function addClearAllButton() {
  const container = document.querySelector('.max-w-6xl.mx-auto.mt-6.p-6');
  if (!container) return;
  let clearBtn = document.getElementById('clearAllBtn');
  if (!clearBtn) {
    clearBtn = document.createElement('button');
    clearBtn.id = 'clearAllBtn';
    clearBtn.className = 'mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition';
    clearBtn.textContent = 'Clear All Data';
    clearBtn.onclick = function() {
      if (confirm('Are you sure you want to clear all data?')) {
        localStorage.removeItem('sectionsData');
        location.reload();
      }
    };
    container.appendChild(clearBtn);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const savedDark = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setDarkMode(savedDark === "true" || (savedDark === null && prefersDark));
  document.getElementById("darkToggle").addEventListener("click", toggleDarkMode);
  loadData();
  addClearAllButton();
});;
