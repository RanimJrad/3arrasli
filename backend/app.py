from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def root():
    return jsonify({"message": "3arrasli backend is running"})


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)