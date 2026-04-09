from datetime import date, datetime, timedelta
from functools import wraps
import uuid

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import text

from extensions import bcrypt, db
from models import ChecklistItem, Client, Favorite, Message, Payment, Provider, Reservation


JWT_SECRET = "change-this-secret-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 12
DEFAULT_CHECKLIST = [
    ("Robe de mariee", "Tenue"),
    ("Salle de reception", "Lieu"),
    ("Traiteur", "Restauration"),
    ("Photographe", "Media"),
    ("Decorateur", "Decoration"),
    ("Faire-part", "Papeterie"),
]


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost/ma_base"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
    }

    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/login": {"origins": "*"}, r"/register": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        db.create_all()
        seed_data()

    def make_token(user_id, role):
        payload = {
            "sub": str(user_id),
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def auth_required(role=None):
        def decorator(view_func):
            @wraps(view_func)
            def wrapped(*args, **kwargs):
                auth_header = request.headers.get("Authorization", "")
                token = auth_header.replace("Bearer ", "").strip()
                if not token:
                    return jsonify({"success": False, "message": "Authentification requise."}), 401

                try:
                    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                except jwt.ExpiredSignatureError:
                    return jsonify({"success": False, "message": "Session expiree."}), 401
                except jwt.InvalidTokenError:
                    return jsonify({"success": False, "message": "Token invalide."}), 401

                request.user_id = int(payload["sub"])
                request.user_role = payload["role"]

                if role and request.user_role != role:
                    return jsonify({"success": False, "message": "Permission insuffisante."}), 403

                return view_func(*args, **kwargs)

            return wrapped

        return decorator

    def provider_to_dict(provider, client_id=None):
        is_favorite = False
        if client_id:
            is_favorite = Favorite.query.filter_by(client_id=client_id, provider_id=provider.id).first() is not None

        return {
            "id": provider.id,
            "company_name": provider.company_name,
            "email": provider.email,
            "city": provider.city,
            "service_type": provider.service_type,
            "description": provider.description,
            "price_min": provider.price_min,
            "price_max": provider.price_max,
            "rating": provider.rating,
            "services": provider.services,
            "is_favorite": is_favorite,
        }

    def reservation_to_dict(reservation):
        return {
            "id": reservation.id,
            "client_id": reservation.client_id,
            "provider_id": reservation.provider_id,
            "provider_name": reservation.provider.company_name,
            "service_type": reservation.provider.service_type,
            "event_date": reservation.event_date.isoformat(),
            "guests_count": reservation.guests_count,
            "budget": reservation.budget,
            "notes": reservation.notes,
            "status": reservation.status,
            "created_at": reservation.created_at.isoformat(),
        }

    def message_to_dict(message):
        return {
            "id": message.id,
            "client_id": message.client_id,
            "provider_id": message.provider_id,
            "sender_type": message.sender_type,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        }

    def checklist_to_dict(item):
        return {
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "completed": item.completed,
            "due_date": item.due_date.isoformat() if item.due_date else None,
        }

    def payment_to_dict(payment):
        return {
            "id": payment.id,
            "reservation_id": payment.reservation_id,
            "amount": payment.amount,
            "provider_name": payment.provider_name,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "transaction_reference": payment.transaction_reference,
            "card_last4": payment.card_last4,
            "paid_at": payment.paid_at.isoformat(),
        }

    def find_account_by_email(email):
        client = Client.query.filter_by(email=email).first()
        if client:
            return client, "Client"
        provider = Provider.query.filter_by(email=email).first()
        if provider:
            return provider, "Prestataire"
        return None, None

    @app.get("/")
    def root():
        return jsonify({"message": "Wedding marketplace API is running"})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "providers": Provider.query.count(), "clients": Client.query.count()})

    @app.get("/api/db-status")
    def db_status():
        try:
            current_database = db.session.execute(text("SELECT DATABASE()")).scalar()
            tables_rows = db.session.execute(text("SHOW TABLES")).fetchall()
            tables = [row[0] for row in tables_rows]

            return jsonify(
                {
                    "success": True,
                    "database": current_database,
                    "tables_count": len(tables),
                    "tables": tables,
                    "message": "Connexion XAMPP / MySQL reussie.",
                }
            )
        except Exception as exc:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Connexion MySQL impossible. Verifiez XAMPP, ma_base et PyMySQL.",
                        "error": str(exc),
                    }
                ),
                500,
            )

    @app.post("/api/auth/register")
    @app.post("/register")
    def register():
        payload = request.get_json(silent=True) or {}
        name = (payload.get("name") or payload.get("full_name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""
        role = (payload.get("role") or "Client").strip()
        city = (payload.get("city") or "").strip() or None

        if not name or not email or not password:
            return jsonify({"success": False, "message": "Nom, email et mot de passe sont obligatoires."}), 400

        if len(password) < 6:
            return jsonify({"success": False, "message": "Le mot de passe doit contenir au moins 6 caracteres."}), 400

        account, _ = find_account_by_email(email)
        if account:
            return jsonify({"success": False, "message": "Cet email est deja utilise."}), 409

        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        if role == "Prestataire":
            provider = Provider(
                company_name=name,
                email=email,
                password_hash=password_hash,
                city=city or "Tunis",
                service_type=(payload.get("service_type") or "Wedding planner").strip(),
                description=(payload.get("description") or "Prestataire disponible pour votre evenement.").strip(),
                price_min=float(payload.get("price_min") or 500),
                price_max=float(payload.get("price_max") or 1500),
                rating=4.6,
            )
            provider.services = payload.get("services") or [provider.service_type]
            db.session.add(provider)
            db.session.commit()
            token = make_token(provider.id, "Prestataire")
            return jsonify({
                "success": True,
                "message": "Compte prestataire cree avec succes.",
                "token": token,
                "user": {"id": provider.id, "name": provider.company_name, "email": provider.email, "role": "Prestataire"},
            }), 201

        client = Client(full_name=name, email=email, password_hash=password_hash, city=city)
        wedding_date = payload.get("wedding_date")
        if wedding_date:
            client.wedding_date = date.fromisoformat(wedding_date)
        db.session.add(client)
        db.session.flush()
        seed_client_checklist(client.id)
        db.session.commit()
        token = make_token(client.id, "Client")
        return jsonify({
            "success": True,
            "message": "Compte client cree avec succes.",
            "token": token,
            "user": {"id": client.id, "name": client.full_name, "email": client.email, "role": "Client"},
        }), 201

    @app.post("/api/auth/login")
    @app.post("/login")
    def login():
        payload = request.get_json(silent=True) or {}
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return jsonify({"success": False, "message": "Email et mot de passe requis."}), 400

        account, role = find_account_by_email(email)
        if not account or not bcrypt.check_password_hash(account.password_hash, password):
            return jsonify({"success": False, "message": "Identifiants invalides."}), 401

        display_name = account.full_name if role == "Client" else account.company_name
        token = make_token(account.id, role)
        return jsonify({
            "success": True,
            "message": "Connexion reussie.",
            "token": token,
            "user": {"id": account.id, "name": display_name, "email": account.email, "role": role},
        })

    @app.get("/api/providers")
    def get_providers():
        city = (request.args.get("city") or "").strip().lower()
        service_type = (request.args.get("type") or "").strip().lower()
        budget = request.args.get("budget")
        client_id = None

        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip()
        if token:
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                if payload.get("role") == "Client":
                    client_id = int(payload["sub"])
            except jwt.InvalidTokenError:
                client_id = None

        query = Provider.query
        if city:
            query = query.filter(db.func.lower(Provider.city) == city)
        if service_type:
            query = query.filter(db.func.lower(Provider.service_type).contains(service_type))
        if budget:
            try:
                budget_value = float(budget)
                query = query.filter(Provider.price_min <= budget_value)
            except ValueError:
                return jsonify({"success": False, "message": "Le budget doit etre numerique."}), 400

        providers = query.order_by(Provider.rating.desc(), Provider.company_name.asc()).all()
        return jsonify({"success": True, "providers": [provider_to_dict(provider, client_id) for provider in providers]})

    @app.get("/api/providers/<int:provider_id>")
    def get_provider(provider_id):
        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"success": False, "message": "Prestataire introuvable."}), 404
        return jsonify({"success": True, "provider": provider_to_dict(provider)})

    @app.post("/api/reservations")
    @auth_required(role="Client")
    def create_reservation():
        payload = request.get_json(silent=True) or {}
        provider_id = payload.get("provider_id")
        event_date = payload.get("event_date")
        guests_count = payload.get("guests_count")
        budget = payload.get("budget")
        notes = (payload.get("notes") or "").strip() or None

        if not provider_id or not event_date or guests_count is None or budget is None:
            return jsonify({"success": False, "message": "Tous les champs de reservation sont requis."}), 400

        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"success": False, "message": "Prestataire introuvable."}), 404

        reservation = Reservation(
            client_id=request.user_id,
            provider_id=provider.id,
            event_date=date.fromisoformat(event_date),
            guests_count=int(guests_count),
            budget=float(budget),
            notes=notes,
            status="pending",
        )
        db.session.add(reservation)
        db.session.commit()

        return jsonify({"success": True, "message": "Reservation enregistree.", "reservation": reservation_to_dict(reservation)}), 201

    @app.get("/api/reservations")
    @auth_required(role="Client")
    def list_reservations():
        reservations = Reservation.query.filter_by(client_id=request.user_id).order_by(Reservation.created_at.desc()).all()
        return jsonify({"success": True, "reservations": [reservation_to_dict(item) for item in reservations]})

    @app.get("/api/favorites")
    @auth_required(role="Client")
    def list_favorites():
        favorites = Favorite.query.filter_by(client_id=request.user_id).order_by(Favorite.created_at.desc()).all()
        return jsonify({"success": True, "favorites": [provider_to_dict(item.provider, request.user_id) for item in favorites]})

    @app.post("/api/favorites/<int:provider_id>")
    @auth_required(role="Client")
    def add_favorite(provider_id):
        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"success": False, "message": "Prestataire introuvable."}), 404

        favorite = Favorite.query.filter_by(client_id=request.user_id, provider_id=provider_id).first()
        if favorite:
            return jsonify({"success": True, "message": "Prestataire deja en favoris."})

        favorite = Favorite(client_id=request.user_id, provider_id=provider_id)
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"success": True, "message": "Prestataire ajoute aux favoris."}), 201

    @app.delete("/api/favorites/<int:provider_id>")
    @auth_required(role="Client")
    def remove_favorite(provider_id):
        favorite = Favorite.query.filter_by(client_id=request.user_id, provider_id=provider_id).first()
        if not favorite:
            return jsonify({"success": False, "message": "Favori introuvable."}), 404
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"success": True, "message": "Favori supprime."})

    @app.get("/api/messages")
    @auth_required(role="Client")
    def get_messages():
        provider_id = request.args.get("provider_id", type=int)
        if not provider_id:
            return jsonify({"success": False, "message": "provider_id est requis."}), 400

        messages = Message.query.filter_by(client_id=request.user_id, provider_id=provider_id).order_by(Message.created_at.asc()).all()
        return jsonify({"success": True, "messages": [message_to_dict(item) for item in messages]})

    @app.post("/api/messages")
    @auth_required(role="Client")
    def post_message():
        payload = request.get_json(silent=True) or {}
        provider_id = payload.get("provider_id")
        content = (payload.get("content") or "").strip()

        if not provider_id or not content:
            return jsonify({"success": False, "message": "provider_id et content sont requis."}), 400

        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"success": False, "message": "Prestataire introuvable."}), 404

        message = Message(client_id=request.user_id, provider_id=provider_id, sender_type="client", content=content)
        db.session.add(message)
        db.session.flush()

        auto_reply = Message(
            client_id=request.user_id,
            provider_id=provider_id,
            sender_type="provider",
            content=f"{provider.company_name} a bien recu votre message et vous repondra bientot.",
        )
        db.session.add(auto_reply)
        db.session.commit()

        messages = Message.query.filter_by(client_id=request.user_id, provider_id=provider_id).order_by(Message.created_at.asc()).all()
        return jsonify({"success": True, "messages": [message_to_dict(item) for item in messages]}), 201

    @app.get("/api/checklist")
    @auth_required(role="Client")
    def get_checklist():
        items = ChecklistItem.query.filter_by(client_id=request.user_id).order_by(ChecklistItem.created_at.asc()).all()
        return jsonify({"success": True, "items": [checklist_to_dict(item) for item in items]})

    @app.post("/api/checklist")
    @auth_required(role="Client")
    def create_checklist_item():
        payload = request.get_json(silent=True) or {}
        title = (payload.get("title") or "").strip()
        category = (payload.get("category") or "Organisation").strip()
        due_date = payload.get("due_date")

        if not title:
            return jsonify({"success": False, "message": "Le titre est requis."}), 400

        item = ChecklistItem(
            client_id=request.user_id,
            title=title,
            category=category,
            due_date=date.fromisoformat(due_date) if due_date else None,
        )
        db.session.add(item)
        db.session.commit()
        return jsonify({"success": True, "item": checklist_to_dict(item)}), 201

    @app.patch("/api/checklist/<int:item_id>")
    @auth_required(role="Client")
    def update_checklist_item(item_id):
        item = ChecklistItem.query.filter_by(id=item_id, client_id=request.user_id).first()
        if not item:
            return jsonify({"success": False, "message": "Element introuvable."}), 404

        payload = request.get_json(silent=True) or {}
        if "completed" in payload:
            item.completed = bool(payload["completed"])
        if "title" in payload and str(payload["title"]).strip():
            item.title = str(payload["title"]).strip()
        db.session.commit()
        return jsonify({"success": True, "item": checklist_to_dict(item)})

    @app.delete("/api/checklist/<int:item_id>")
    @auth_required(role="Client")
    def delete_checklist_item(item_id):
        item = ChecklistItem.query.filter_by(id=item_id, client_id=request.user_id).first()
        if not item:
            return jsonify({"success": False, "message": "Element introuvable."}), 404
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True, "message": "Element supprime."})

    @app.post("/api/payments")
    @auth_required(role="Client")
    def create_payment():
        payload = request.get_json(silent=True) or {}
        reservation_id = payload.get("reservation_id")
        card_number = (payload.get("card_number") or "").replace(" ", "")
        card_holder = (payload.get("card_holder") or "").strip()
        expiry = (payload.get("expiry") or "").strip()
        cvc = (payload.get("cvc") or "").strip()

        if not reservation_id or not card_number or not card_holder or not expiry or not cvc:
            return jsonify({"success": False, "message": "Tous les champs de paiement sont requis."}), 400

        reservation = Reservation.query.filter_by(id=reservation_id, client_id=request.user_id).first()
        if not reservation:
            return jsonify({"success": False, "message": "Reservation introuvable."}), 404

        if len(card_number) < 12 or len(cvc) < 3:
            return jsonify({"success": False, "message": "Informations de carte invalides."}), 400

        payment = Payment(
            reservation_id=reservation.id,
            amount=reservation.budget,
            provider_name=reservation.provider.company_name,
            status="paid",
            payment_method="card",
            transaction_reference=f"PAY-{uuid.uuid4().hex[:10].upper()}",
            card_last4=card_number[-4:],
        )
        reservation.status = "confirmed"
        db.session.add(payment)
        db.session.commit()

        return jsonify({"success": True, "message": "Paiement effectue avec succes.", "payment": payment_to_dict(payment)})

    return app

def seed_client_checklist(client_id):
    existing = ChecklistItem.query.filter_by(client_id=client_id).count()
    if existing:
        return

    db.session.add_all([
        ChecklistItem(client_id=client_id, title=title, category=category) for title, category in DEFAULT_CHECKLIST
    ])


def seed_data():
    if Provider.query.count() == 0:
        providers = [
            Provider(
                company_name="Studio Lumiere",
                email="studio@3arrasli.com",
                password_hash=bcrypt.generate_password_hash("Provider123!").decode("utf-8"),
                city="Tunis",
                service_type="Photographe",
                description="Reportage photo et video haut de gamme pour mariages intimistes et grands evenements.",
                price_min=1200,
                price_max=2800,
                rating=4.9,
            ),
            Provider(
                company_name="Palais Jasmine",
                email="palais@3arrasli.com",
                password_hash=bcrypt.generate_password_hash("Provider123!").decode("utf-8"),
                city="Sousse",
                service_type="Salle",
                description="Salle de reception elegante avec jardin, lumiere naturelle et coordination sur place.",
                price_min=3500,
                price_max=8000,
                rating=4.8,
            ),
            Provider(
                company_name="Saveurs Royales",
                email="saveurs@3arrasli.com",
                password_hash=bcrypt.generate_password_hash("Provider123!").decode("utf-8"),
                city="Tunis",
                service_type="Traiteur",
                description="Cuisine traditionnelle et menus signatures pour receptions de mariage sur mesure.",
                price_min=1800,
                price_max=4200,
                rating=4.7,
            ),
        ]
        providers[0].services = ["Shooting de couple", "Album premium", "Captation video"]
        providers[1].services = ["Salle climatisee", "Parking invite", "Coordination jour J"]
        providers[2].services = ["Menu tunisien", "Buffet desserts", "Service en salle"]
        db.session.add_all(providers)

    if Client.query.count() == 0:
        client = Client(
            full_name="Demo Client",
            email="client@3arrasli.com",
            password_hash=bcrypt.generate_password_hash("Client123!").decode("utf-8"),
            city="Tunis",
            wedding_date=date.today() + timedelta(days=90),
        )
        db.session.add(client)
        db.session.flush()
        seed_client_checklist(client.id)

    db.session.commit()

    demo_client = Client.query.filter_by(email="client@3arrasli.com").first()
    demo_provider = Provider.query.filter_by(email="studio@3arrasli.com").first()

    if demo_client and demo_provider and Reservation.query.count() == 0:
        reservation = Reservation(
            client_id=demo_client.id,
            provider_id=demo_provider.id,
            event_date=date.today() + timedelta(days=120),
            guests_count=180,
            budget=1900,
            notes="Nous voulons une couverture photo du matin jusqu'a la soiree.",
            status="pending",
        )
        db.session.add(reservation)

    if demo_client and demo_provider and Favorite.query.count() == 0:
        db.session.add(Favorite(client_id=demo_client.id, provider_id=demo_provider.id))

    if demo_client and demo_provider and Message.query.count() == 0:
        db.session.add_all([
            Message(client_id=demo_client.id, provider_id=demo_provider.id, sender_type="client", content="Bonjour, avez-vous des disponibilites pour septembre ?"),
            Message(client_id=demo_client.id, provider_id=demo_provider.id, sender_type="provider", content="Oui, nous avons encore quelques dates disponibles en septembre."),
        ])

    db.session.commit()


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
