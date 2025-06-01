from flask import Flask, render_template, jsonify
from data import cse

app = Flask(__name__)

@app.route("/")
def index():
    sections = cse
    return render_template("index.html", sections=sections)

if __name__ == "__main__":
    app.run(debug=True)