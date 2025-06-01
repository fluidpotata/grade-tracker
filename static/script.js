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
  "F": 0.0
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


function calculateSummary() {
  let totalCredits = 0;
  let totalPoints = 0;
  let totalCourses = 0;

  sectionsData.forEach(section => {
    section.subsections.forEach(sub => {
      sub.courses.forEach(course => {
        const gp = gradeToGP[course.grade];
        totalCredits += course.credit;
        totalPoints += course.credit * gp;
        totalCourses++;
      });
    });
  });

  document.getElementById("totalCredits").innerText = totalCredits;
  document.getElementById("totalCourses").innerText = totalCourses;
  document.getElementById("cgpa").innerText = (totalPoints / totalCredits).toFixed(2);
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

// On DOMContentLoaded, set dark mode from localStorage and update button

document.addEventListener("DOMContentLoaded", () => {
  const savedDark = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setDarkMode(savedDark === "true" || (savedDark === null && prefersDark));
  document.getElementById("darkToggle").addEventListener("click", toggleDarkMode);
  loadData();
});
