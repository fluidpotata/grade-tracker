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
    title: "GenEd (39 credits)",
    subsections: [
        {
        title: "Stream-1",
        courses: [
            { code: "ENG101", name: "Course 1", credit: 3, grade: "A" },
            { code: "MAT091", name: "Course 2", credit: 3, grade: "A-" }
        ]
        },
        {
        title: "Stream-2",
        courses: [
            { code: "ECO101", name: "", credit: 3, grade: "" },
            { code: "BUS201", name: "", credit: 3, grade: "" }
        ]
        }
    ]
    },
    {
    title: "Department (99 credits)",
    subsections: [
        {
        title: "",
        courses: [
            { code: "CSE110", name: "", credit: 3, grade: "" }
        ]
        },
        {
        title: "Elective",
        courses: [
            { code: "CSE425", name: "", credit: 3, grade: "" }
        ]
        }
    ]
    }
];

function renderGradeDropdown(sectionIdx, subIdx, courseIdx, selectedGrade) {
    return `<select class="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded p-1" onchange="updateGrade(${sectionIdx}, ${subIdx}, ${courseIdx}, this.value)">
    ${Object.keys(gradeToGP).map(g => `<option value="${g}" ${g === selectedGrade ? 'selected' : ''}>${g}</option>`).join('')}
    </select>`;
}

function renderTable(sectionIndex, subsection, subIndex) {
    let html = `
    <h3 class="text-lg font-semibold mb-1">${subsection.title}</h3>
    <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
        <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-left">
            <th class="p-2">Course Code</th>
            <th class="p-2">Course Name</th>
            <th class="p-2">Credit</th>
            <th class="p-2">Grade</th>
            <th class="p-2">GP</th>
            </tr>
        </thead>
        <tbody>
    `;
    subsection.courses.forEach((course, courseIdx) => {
    const gp = gradeToGP[course.grade] ?? "";
    html += `
        <tr class="border-t border-gray-200 dark:border-gray-600">
        <td class="p-2">${course.code}</td>
        <td class="p-2">${course.name || "-"}</td>
        <td class="p-2">${course.credit}</td>
        <td class="p-2">${renderGradeDropdown(sectionIndex, subIndex, courseIdx, course.grade)}</td>
        <td class="p-2" id="gp-${sectionIndex}-${subIndex}-${courseIdx}">${gp}</td>
        </tr>
    `;
    });
    html += `</tbody></table></div>`;
    return html;
}

function renderSections() {
    const container = document.getElementById("sections");
    container.innerHTML = "";
    sections.forEach((section, sectionIdx) => {
    let sectionHTML = `<h2 class="text-2xl font-bold mb-2">${section.title}</h2>`;
    section.subsections.forEach((subsection, subIdx) => {
        sectionHTML += renderTable(sectionIdx, subsection, subIdx);
    });
    container.innerHTML += `<div>${sectionHTML}</div>`;
    });
    calculateSummary();
}

function updateGrade(sectionIdx, subIdx, courseIdx, newGrade) {
    const course = sections[sectionIdx].subsections[subIdx].courses[courseIdx];
    course.grade = newGrade;
    const newGP = gradeToGP[newGrade] ?? "";
    document.getElementById(`gp-${sectionIdx}-${subIdx}-${courseIdx}`).innerText = newGP;
    calculateSummary();
}

function calculateSummary() {
    let totalCredits = 0;
    let totalPoints = 0;
    let totalCourses = 0;
    sections.forEach(section => {
    section.subsections.forEach(sub => {
        sub.courses.forEach(course => {
        const gp = gradeToGP[course.grade];
        if (gp !== undefined && course.credit > 0) {
            totalCredits += course.credit;
            totalPoints += gp * course.credit;
            totalCourses++;
        }
        });
    });
    });
    document.getElementById("totalCredits").innerText = totalCredits;
    document.getElementById("totalCourses").innerText = totalCourses;
    document.getElementById("cgpa").innerText = totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
}

document.getElementById('toggleDark').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

window.addEventListener('DOMContentLoaded', renderSections);