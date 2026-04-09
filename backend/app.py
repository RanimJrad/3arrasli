from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import inspect, text

from extensions import bcrypt, db
from models import (
    Appointment,
    ChatMessage,
    ChatThread,
    Invoice,
    OnlineContract,
    Pack,
    ProviderProfile,
    Review,
    User,
)


DEFAULT_ADMIN = {
    "name": "Administrateur Principal",
    "email": "admin@3arrasli.tn",
    "password": "Admin123!",
    "role": "Admin",
}


def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


def serialize_provider(user):
    profile = user.provider_profile
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "company_name": profile.company_name if profile else "",
        "category": profile.category if profile else "",
        "city": profile.city if profile else "",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def serialize_appointment(appointment):
    return {
        "id": appointment.id,
        "service_name": appointment.service_name,
        "client_name": appointment.client_name,
        "provider_name": appointment.provider_name,
        "scheduled_for": appointment.scheduled_for.isoformat(),
        "status": appointment.status,
        "amount": appointment.amount,
    }


def serialize_contract(contract):
    return {
        "id": contract.id,
        "title": contract.title,
        "client_name": contract.client_name,
        "provider_name": contract.provider_name,
        "status": contract.status,
        "signed_by_client": contract.signed_by_client,
        "signed_by_provider": contract.signed_by_provider,
        "signed_at": contract.signed_at.isoformat() if contract.signed_at else None,
    }


def serialize_invoice(invoice):
    return {
        "id": invoice.id,
        "reference": invoice.reference,
        "customer_name": invoice.customer_name,
        "amount": invoice.amount,
        "status": invoice.status,
        "due_date": invoice.due_date.isoformat(),
    }


def serialize_review(review):
    return {
        "id": review.id,
        "author_name": review.author_name,
        "target_name": review.target_name,
        "rating": review.rating,
        "comment": review.comment,
        "status": review.status,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }


def serialize_pack(pack):
    return {
        "id": pack.id,
        "name": pack.name,
        "description": pack.description,
        "discount_percent": pack.discount_percent,
        "active": pack.active,
    }


def serialize_chat(thread):
    return {
        "id": thread.id,
        "client_name": thread.client_name,
        "provider_name": thread.provider_name,
        "status": thread.status,
        "flagged": thread.flagged,
        "messages": [
            {
                "id": message.id,
                "sender_name": message.sender_name,
                "content": message.content,
                "sent_at": message.sent_at.isoformat(),
            }
            for message in sorted(thread.messages, key=lambda item: item.sent_at)
        ],
    }


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost/ma_base"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/*": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        db.create_all()
        migrate_existing_database()
        seed_default_data()

    def require_admin(view_func):
        @wraps(view_func)
        def wrapped(*args, **kwargs):
            role = (request.headers.get("X-User-Role") or "").strip()
            if role != "Admin":
                return jsonify({"success": False, "message": "Acces reserve a l'administrateur."}), 403
            return view_func(*args, **kwargs)

        return wrapped

    @app.get("/")
    def root():
        return jsonify({"message": "3arrasli backend is running"})

    @app.get("/api/health")
    def health_check():
        admin = User.query.filter_by(role="Admin").first()
        return jsonify(
            {
                "status": "ok",
                "admin_seeded": bool(admin),
                "default_admin_email": DEFAULT_ADMIN["email"],
            }
        )

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
        db.session.flush()

        if role == "Prestataire":
            db.session.add(
                ProviderProfile(
                    user_id=user.id,
                    company_name=name,
                    category="A renseigner",
                    city="A renseigner",
                    created_by_admin=False,
                )
            )

        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Inscription reussie.",
                    "user": serialize_user(user),
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

        if not user.is_active:
            return jsonify({"success": False, "message": "Ce compte est desactive."}), 403

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"success": False, "message": "Mot de passe incorrect."}), 401

        return jsonify(
            {
                "success": True,
                "message": "Connexion reussie.",
                "user": serialize_user(user),
            }
        )

    @app.get("/api/admin/dashboard")
    @require_admin
    def admin_dashboard():
        providers = User.query.filter_by(role="Prestataire").order_by(User.created_at.desc()).all()
        appointments = Appointment.query.order_by(Appointment.scheduled_for.asc()).all()
        contracts = OnlineContract.query.order_by(OnlineContract.id.desc()).all()
        invoices = Invoice.query.order_by(Invoice.due_date.asc()).all()
        reviews = Review.query.order_by(Review.created_at.desc()).all()
        packs = Pack.query.order_by(Pack.id.desc()).all()
        chats = ChatThread.query.order_by(ChatThread.id.desc()).all()

        return jsonify(
            {
                "success": True,
                "stats": {
                    "providers_total": len(providers),
                    "providers_active": len([item for item in providers if item.is_active]),
                    "appointments_total": len(appointments),
                    "contracts_signed": len([item for item in contracts if item.status == "Signe"]),
                    "invoices_pending": len([item for item in invoices if item.status != "Payee"]),
                    "reviews_flagged": len([item for item in reviews if item.status != "Visible"]),
                    "packs_active": len([item for item in packs if item.active]),
                    "flagged_chats": len([item for item in chats if item.flagged]),
                },
                "admin_account": {
                    "email": DEFAULT_ADMIN["email"],
                    "password": DEFAULT_ADMIN["password"],
                },
                "providers": [serialize_provider(item) for item in providers],
                "appointments": [serialize_appointment(item) for item in appointments],
                "contracts": [serialize_contract(item) for item in contracts],
                "invoices": [serialize_invoice(item) for item in invoices],
                "reviews": [serialize_review(item) for item in reviews],
                "packs": [serialize_pack(item) for item in packs],
                "chats": [serialize_chat(item) for item in chats],
            }
        )

    @app.post("/api/admin/providers")
    @require_admin
    def create_provider():
        payload = request.get_json(silent=True) or {}

        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""
        company_name = (payload.get("company_name") or "").strip()
        category = (payload.get("category") or "").strip()
        city = (payload.get("city") or "").strip()

        if not name or not email or not password or not company_name or not category or not city:
            return jsonify({"success": False, "message": "Tous les champs prestataire sont obligatoires."}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Le mot de passe doit contenir au moins 6 caracteres."}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "message": "Email deja utilise."}), 409

        user = User(
            name=name,
            email=email,
            password=bcrypt.generate_password_hash(password).decode("utf-8"),
            role="Prestataire",
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()

        db.session.add(
            ProviderProfile(
                user_id=user.id,
                company_name=company_name,
                category=category,
                city=city,
                created_by_admin=True,
            )
        )
        db.session.commit()

        return jsonify({"success": True, "message": "Prestataire cree avec succes.", "provider": serialize_provider(user)}), 201

    @app.patch("/api/admin/providers/<int:user_id>/status")
    @require_admin
    def update_provider_status(user_id):
        provider = User.query.filter_by(id=user_id, role="Prestataire").first()
        if not provider:
            return jsonify({"success": False, "message": "Prestataire introuvable."}), 404

        payload = request.get_json(silent=True) or {}
        is_active = payload.get("is_active")
        if not isinstance(is_active, bool):
            return jsonify({"success": False, "message": "Le statut is_active est requis."}), 400

        provider.is_active = is_active
        db.session.commit()

        state = "active" if is_active else "desactive"
        return jsonify({"success": True, "message": f"Compte prestataire {state}.", "provider": serialize_provider(provider)})

    @app.post("/api/admin/packs")
    @require_admin
    def create_pack():
        payload = request.get_json(silent=True) or {}

        name = (payload.get("name") or "").strip()
        description = (payload.get("description") or "").strip()
        discount_percent = payload.get("discount_percent")

        if not name or not description or discount_percent is None:
            return jsonify({"success": False, "message": "Tous les champs du pack sont obligatoires."}), 400

        try:
            discount_percent = int(discount_percent)
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "La reduction doit etre un nombre entier."}), 400

        if discount_percent < 1 or discount_percent > 100:
            return jsonify({"success": False, "message": "La reduction doit etre comprise entre 1 et 100."}), 400

        pack = Pack(name=name, description=description, discount_percent=discount_percent, active=True)
        db.session.add(pack)
        db.session.commit()

        return jsonify({"success": True, "message": "Pack promotionnel ajoute.", "pack": serialize_pack(pack)}), 201

    @app.patch("/api/admin/reviews/<int:review_id>")
    @require_admin
    def moderate_review(review_id):
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"success": False, "message": "Avis introuvable."}), 404

        payload = request.get_json(silent=True) or {}
        status = (payload.get("status") or "").strip()
        if status not in {"Visible", "Masque", "Signale"}:
            return jsonify({"success": False, "message": "Statut d'avis invalide."}), 400

        review.status = status
        db.session.commit()
        return jsonify({"success": True, "message": "Avis mis a jour.", "review": serialize_review(review)})

    return app


def migrate_existing_database():
    inspector = inspect(db.engine)

    if not inspector.has_table("user"):
        return

    columns = {column["name"] for column in inspector.get_columns("user")}

    if "is_active" not in columns:
        db.session.execute(text("ALTER TABLE user ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1"))

    if "created_at" not in columns:
        db.session.execute(text("ALTER TABLE user ADD COLUMN created_at DATETIME"))
        db.session.execute(text("UPDATE user SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))

    db.session.commit()


def seed_default_data():
    admin = User.query.filter_by(role="Admin").first()
    if not admin:
        admin = User(
            name=DEFAULT_ADMIN["name"],
            email=DEFAULT_ADMIN["email"],
            password=bcrypt.generate_password_hash(DEFAULT_ADMIN["password"]).decode("utf-8"),
            role=DEFAULT_ADMIN["role"],
            is_active=True,
        )
        db.session.add(admin)
        db.session.commit()

    if User.query.filter_by(role="Prestataire").count() == 0:
        seed_provider = User(
            name="Studio Nour",
            email="studio.nour@3arrasli.tn",
            password=bcrypt.generate_password_hash("Prestataire123!").decode("utf-8"),
            role="Prestataire",
            is_active=True,
        )
        db.session.add(seed_provider)
        db.session.flush()
        db.session.add(
            ProviderProfile(
                user_id=seed_provider.id,
                company_name="Studio Nour",
                category="Photographie",
                city="Tunis",
                created_by_admin=True,
            )
        )
        db.session.commit()

    if Appointment.query.count() == 0:
        db.session.add_all(
            [
                Appointment(
                    service_name="Photographie mariage",
                    client_name="Sarra Ben Ali",
                    provider_name="Studio Nour",
                    scheduled_for=datetime.utcnow() + timedelta(days=10),
                    status="Confirme",
                    amount=1800,
                ),
                Appointment(
                    service_name="Decoration salle",
                    client_name="Nourhene Trabelsi",
                    provider_name="Elegance Deco",
                    scheduled_for=datetime.utcnow() + timedelta(days=15),
                    status="En attente",
                    amount=2400,
                ),
            ]
        )

    if OnlineContract.query.count() == 0:
        db.session.add_all(
            [
                OnlineContract(
                    title="Contrat Photo Premium",
                    client_name="Sarra Ben Ali",
                    provider_name="Studio Nour",
                    status="Signe",
                    signed_by_client=True,
                    signed_by_provider=True,
                    signed_at=datetime.utcnow() - timedelta(days=2),
                ),
                OnlineContract(
                    title="Contrat Decoration Salle",
                    client_name="Nourhene Trabelsi",
                    provider_name="Elegance Deco",
                    status="En attente de signature",
                    signed_by_client=True,
                    signed_by_provider=False,
                ),
            ]
        )

    if Invoice.query.count() == 0:
        db.session.add_all(
            [
                Invoice(
                    reference="FAC-2026-001",
                    customer_name="Sarra Ben Ali",
                    amount=1800,
                    status="Payee",
                    due_date=datetime.utcnow() + timedelta(days=3),
                ),
                Invoice(
                    reference="FAC-2026-002",
                    customer_name="Nourhene Trabelsi",
                    amount=2400,
                    status="A payer",
                    due_date=datetime.utcnow() + timedelta(days=7),
                ),
            ]
        )

    if Review.query.count() == 0:
        db.session.add_all(
            [
                Review(
                    author_name="Amal",
                    target_name="Studio Nour",
                    rating=5,
                    comment="Equipe professionnelle et ponctuelle.",
                    status="Visible",
                ),
                Review(
                    author_name="Yasmine",
                    target_name="Elegance Deco",
                    rating=2,
                    comment="Retard de livraison signale par la cliente.",
                    status="Signale",
                ),
            ]
        )

    if Pack.query.count() == 0:
        db.session.add_all(
            [
                Pack(name="Pack Printemps", description="Reduction sur les reservations anticipees.", discount_percent=10, active=True),
                Pack(name="Pack VIP", description="Offre premium multi-services pour mariage.", discount_percent=15, active=True),
            ]
        )

    if ChatThread.query.count() == 0:
        thread = ChatThread(client_name="Sarra Ben Ali", provider_name="Studio Nour", status="Ouvert", flagged=False)
        flagged_thread = ChatThread(client_name="Yasmine Gharbi", provider_name="Elegance Deco", status="Sous surveillance", flagged=True)
        db.session.add_all([thread, flagged_thread])
        db.session.flush()

        db.session.add_all(
            [
                ChatMessage(thread_id=thread.id, sender_name="Sarra Ben Ali", content="Bonjour, je veux confirmer le planning."),
                ChatMessage(thread_id=thread.id, sender_name="Studio Nour", content="C'est bien note pour le 18 juin."),
                ChatMessage(thread_id=flagged_thread.id, sender_name="Yasmine Gharbi", content="Je n'ai pas recu le devis final."),
                ChatMessage(thread_id=flagged_thread.id, sender_name="Elegance Deco", content="Nous vous l'envoyons ce soir."),
            ]
        )

    db.session.commit()


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
