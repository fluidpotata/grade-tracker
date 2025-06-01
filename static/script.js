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
      class="border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white">
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
        <table class="w-full border border-gray-400 dark:border-gray-600 mb-4 text-left">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700">
              <th class="border px-2 py-1">Code</th>
              <th class="border px-2 py-1">Name</th>
              <th class="border px-2 py-1">Credit</th>
              <th class="border px-2 py-1">Grade</th>
              <th class="border px-2 py-1">GP</th>
            </tr>
          </thead>
          <tbody>
      `;
      sub.courses.forEach((course, courseIndex) => {
        const gp = gradeToGP[course.grade];
        sectionHtml += `
          <tr>
            <td class="border px-2 py-1">${course.code}</td>
            <td class="border px-2 py-1">${course.name}</td>
            <td class="border px-2 py-1">${course.credit}</td>
            <td class="border px-2 py-1">${renderGradeDropdown(sectionIndex, subIndex, courseIndex, course.grade)}</td>
            <td class="border px-2 py-1" id="gp-${sectionIndex}-${subIndex}-${courseIndex}">${gp}</td>
          </tr>
        `;
      });

      sectionHtml += `</tbody></table>`;
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

function toggleDarkMode() {
  const root = document.documentElement;
  root.classList.toggle("dark");
}

function saveToLocalStorage() {
  localStorage.setItem("sectionsData", JSON.stringify(sectionsData));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("darkToggle").addEventListener("click", toggleDarkMode);
  loadData();
});
