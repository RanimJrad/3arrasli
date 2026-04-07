from flask import Flask, jsonify, request
from flask_cors import CORS

from extensions import bcrypt, db
from models import User


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Allow the React frontend to call this API during development.
    CORS(app, resources={r"/*": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def root():
        return jsonify({"message": "3arrasli backend is running"})

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/register")
    def register():
        payload = request.get_json(silent=True) or {}

        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""
        role = (payload.get("role") or "").strip()

        if not name or not email or not password or not role:
            return jsonify({"success": False, "message": "Tous les champs sont obligatoires."}), 400

        if role not in {"Client", "Prestataire"}:
            return jsonify({"success": False, "message": "Role invalide."}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"success": False, "message": "Email deja utilise."}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user = User(name=name, email=email, password=hashed_password, role=role)

        db.session.add(user)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Inscription reussie.",
                    "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
                }
            ),
            201,
        )

    @app.post("/login")
    def login():
        payload = request.get_json(silent=True) or {}

        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return jsonify({"success": False, "message": "Email et mot de passe requis."}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"success": False, "message": "Utilisateur introuvable."}), 404

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"success": False, "message": "Mot de passe incorrect."}), 401

        return jsonify(
            {
                "success": True,
                "message": "Connexion reussie.",
                "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
            }
        )

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
