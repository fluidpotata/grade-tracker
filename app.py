from flask import Flask, render_template, jsonify, request, session, url_for
from data import cse
from transcript import parse_transcript_to_courses

app = Flask(__name__)
app.secret_key = 'this-is-fluidpotata'  # Set a strong, unique secret key

@app.route("/")
def index():
    sections = cse
    return render_template("index.html", sections=sections)

@app.route("/upload")
def upload():
    return render_template("upload.html")



@app.route('/receive_text', methods=['GET','POST'])
def receive_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    print(data['text'])
    print("======")
    transcript = data['text']
    courses_data = parse_transcript_to_courses(transcript)
    print(courses_data)
    session['courses_data'] = courses_data
    return jsonify({'redirect': url_for('view_courses')})

@app.route('/view_courses')
def view_courses():
    courses_data = session.get('courses_data', [])
    return render_template('generic.html', courses=courses_data)


@app.route('/cse-validator')
def cse_validator():
    sections = cse
    return render_template("cse.html", sections=sections)

if __name__ == "__main__":
    app.run(debug=True)