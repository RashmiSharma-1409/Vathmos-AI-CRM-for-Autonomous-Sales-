from flask import Flask, render_template, jsonify
from flask_cors import CORS
from routes.api import api
from database.db import init_db

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(api)

init_db()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


# Global error handlers so frontend always gets JSON
@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Route not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True)
