const gradeToGP = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0,  "D-": 0.7,
  "F": 0.0, "I": null,
  "P" : null,
};

let courses = [];

function loadData() {
  const local = localStorage.getItem("coursesData");
  if (flaskData) {
    courses = flaskData;
  } else if (local) {
    courses = JSON.parse(local);
  } else {
    courses = [];
  }
  renderTable();
  calculateSummary();
}

function renderTable() {
  const container = document.getElementById("coursesContainer");
  container.innerHTML = `
    <div class="rounded-lg border-2 border-gray-500 dark:border-gray-400 overflow-hidden shadow-lg">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-300 dark:bg-gray-700 font-medium text-gray-800 dark:text-gray-100">
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Code</th>
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Name</th>
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Credit</th>
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Grade</th>
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">GP</th>
            <th class="border border-gray-300 dark:border-gray-600 px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map((course, index) => {
            const rowBgClass = index % 2 === 0
              ? "bg-gray-50 dark:bg-gray-800"
              : "bg-white dark:bg-gray-900";
            return `
              <tr class="${rowBgClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                  <input type="text" value="${course.code}" onchange="updateField(${index}, 'code', this.value)" class="bg-transparent w-full">
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                  <input type="text" value="${course.name}" onchange="updateField(${index}, 'name', this.value)" class="bg-transparent w-full">
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                  <input type="number" value="${course.credit}" onchange="updateField(${index}, 'credit', parseFloat(this.value))" class="bg-transparent w-16">
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                  ${renderGradeDropdown(index, course.grade)}
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1" id="gp-${index}">
                  ${gradeToGP[course.grade]}
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                  <button onclick="deleteCourse(${index})" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">Delete</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
  saveToLocalStorage();
  calculateSummary();
}


function renderGradeDropdown(index, selectedGrade) {
  return `<select onchange="updateField(${index}, 'grade', this.value)" class="bg-transparent">
    ${Object.entries(gradeToGP).map(([grade, _]) =>
      `<option value="${grade}" ${grade === selectedGrade ? "selected" : ""}>${grade}</option>`
    ).join("")}
  </select>`;
}

function updateField(index, field, value) {
  courses[index][field] = value;
  if (field === "grade") {
    document.getElementById(`gp-${index}`).innerText = gradeToGP[value];
  }
  saveToLocalStorage();
  calculateSummary();
}

function addCourse() {
  const code = prompt("Course Code:");
  const name = prompt("Course Name:");
  const credit = parseFloat(prompt("Credit:"));
  if (!code || !name || isNaN(credit)) return;
  courses.push({ code, name, credit, grade: "A" });
  renderTable();
}

function deleteCourse(index) {
  if (!confirm("Are you sure you want to delete this course?")) return;
  courses.splice(index, 1);
  renderTable();
}

function saveToLocalStorage() {
  localStorage.setItem("coursesData", JSON.stringify(courses));
}

function calculateSummary() {
  let totalCredits = 0, totalPoints = 0;
  courses.forEach(course => {
    const gp = gradeToGP[course.grade];
    if (gp !== null) {
      totalCredits += course.credit;
      totalPoints += course.credit * gp;
    }
  });
  document.getElementById("totalCredits").innerText = totalCredits;
  document.getElementById("totalCourses").innerText = courses.length;
  document.getElementById("cgpa").innerText = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "-";
}

function setDarkMode(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("darkMode", isDark);
  updateDarkToggleButton(isDark);
}

function updateDarkToggleButton(isDark) {
  const btn = document.getElementById("darkToggle");
  btn.innerHTML = isDark ? "🌙 Light Mode" : "☀️ Dark Mode";
}

function toggleDarkMode() {
  const isDark = !document.documentElement.classList.contains("dark");
  setDarkMode(isDark);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedDark = localStorage.getItem("darkMode") === "true";
  setDarkMode(savedDark);
  document.getElementById("darkToggle").addEventListener("click", toggleDarkMode);
  document.getElementById("addCourseBtn").addEventListener("click", addCourse);
  loadData();
});
