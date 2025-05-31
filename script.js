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

const sections = [
  {
    title: "University Core",
    courses: [
      { code: "ENG 101", name: "English Fundamentals", credit: 3, grade: "B" },
      { code: "ENG 102", name: "English Composition I", credit: 3, grade: "B" }
    ]
  },
  {
    title: "School Core",
    courses: [
      { code: "MAT 110", name: "Differential Calculus", credit: 3, grade: "A-" }
    ]
  },
  {
    title: "Program Core",
    courses: [
      { code: "PHY 111", name: "Physics I", credit: 3, grade: "A+" }
    ]
  },
  {
    title: "Program Elective",
    courses: [
      { code: "CHE101", name: "Chemistry", credit: 3, grade: "A" }
    ]
  },
  {
    title: "Thesis",
    courses: [
      { code: "THS400", name: "Undergrad Thesis", credit: 6, grade: "A" }
    ]
  }
];

function renderGradeDropdown(courseIndex, sectionIndex, selectedGrade) {
  let options = Object.keys(gradeToGP).map(grade => {
    return `<option value="${grade}" ${grade === selectedGrade ? 'selected' : ''}>${grade}</option>`;
  }).join("");
  return `<select onchange="updateGrade(${sectionIndex}, ${courseIndex}, this.value)">${options}</select>`;
}

function renderTable(section, sectionIndex) {
  let html = `
    <h2>${section.title}</h2>
    <table>
      <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Credit</th>
        <th>Grade</th>
        <th>GP</th>
      </tr>
  `;
  section.courses.forEach((course, courseIndex) => {
    const gp = gradeToGP[course.grade];
    html += `
      <tr>
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td>${course.credit}</td>
        <td>${renderGradeDropdown(courseIndex, sectionIndex, course.grade)}</td>
        <td class="gp-cell" id="gp-${sectionIndex}-${courseIndex}">${gp}</td>
      </tr>
    `;
  });
  html += `</table>`;
  return html;
}

function updateGrade(sectionIndex, courseIndex, newGrade) {
  const course = sections[sectionIndex].courses[courseIndex];
  course.grade = newGrade;
  const newGP = gradeToGP[newGrade];
  document.getElementById(`gp-${sectionIndex}-${courseIndex}`).innerText = newGP;
  calculateSummary();
}

function calculateSummary() {
  let totalCredits = 0;
  let totalPoints = 0;
  let totalCourses = 0;

  sections.forEach(section => {
    section.courses.forEach(course => {
      const gp = gradeToGP[course.grade];
      if (course.credit > 0) {
        totalCredits += course.credit;
        totalPoints += course.credit * gp;
      }
      totalCourses++;
    });
  });

  document.getElementById("totalCredits").innerText = totalCredits;
  document.getElementById("totalCourses").innerText = totalCourses;
  document.getElementById("cgpa").innerText = (totalPoints / totalCredits).toFixed(3);
}

function loadData() {
  const container = document.getElementById("sections");
  container.innerHTML = "";
  sections.forEach((section, index) => {
    container.innerHTML += renderTable(section, index);
  });
  calculateSummary();
}

loadData();
