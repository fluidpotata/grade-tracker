from flask import Flask, render_template, jsonify, request
from data import cse

app = Flask(__name__)

@app.route("/")
def index():
    sections = cse
    return render_template("index.html", sections=sections)

@app.route("/upload")
def upload():
    return render_template("upload.html")

@app.route('/receive_text', methods=['POST'])
def receive_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    # print(data['text'].split(" "))
    transcript = data['text']
    semesters = []
    current_semester = None
    lines = transcript.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        # Check for semester header
        if line.startswith('SEMESTER:'):
            semester_name = line.split('SEMESTER:')[1].strip()
            current_semester = {'semester': semester_name, 'courses': []}
            semesters.append(current_semester)
        # Check for course lines (based on pattern: Course No, Course Title, Credits Earned, Grade, Grade Points)
        elif line.startswith('CSE') or line.startswith('ENG') or line.startswith('MAT') or line.startswith('PHY') or line.startswith('STA') or line.startswith('BNG') or line.startswith('EMB') or line.startswith('HUM') or line.startswith('CHE') or line.startswith('ECO'):
            parts = line.split('   ')
            parts = [part.strip() for part in parts if part.strip()]
            if len(parts) >= 4:  # Ensure it's a course line
                course_no = parts[0]
                course_title = parts[1]
                grade = parts[3]
                current_semester['courses'].append({
                    'course_no': course_no,
                    'course_title': course_title,
                    'grade': grade
                })
    print("======")
    print(semesters)
    return jsonify({'received_text': data['text']})

if __name__ == "__main__":
    app.run(debug=True)