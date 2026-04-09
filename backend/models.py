from datetime import datetime
import json

from extensions import db


class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(120), nullable=True)
    wedding_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reservations = db.relationship("Reservation", back_populates="client", cascade="all, delete-orphan")
    favorites = db.relationship("Favorite", back_populates="client", cascade="all, delete-orphan")
    messages = db.relationship("Message", back_populates="client", cascade="all, delete-orphan")
    checklist_items = db.relationship("ChecklistItem", back_populates="client", cascade="all, delete-orphan")


class Provider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(120), nullable=False)
    service_type = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_min = db.Column(db.Float, nullable=False)
    price_max = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float, nullable=False, default=4.5)
    services_json = db.Column(db.Text, nullable=False, default="[]")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reservations = db.relationship("Reservation", back_populates="provider", cascade="all, delete-orphan")
    favorites = db.relationship("Favorite", back_populates="provider", cascade="all, delete-orphan")
    messages = db.relationship("Message", back_populates="provider", cascade="all, delete-orphan")

    @property
    def services(self):
        try:
            return json.loads(self.services_json or "[]")
        except json.JSONDecodeError:
            return []

    @services.setter
    def services(self, value):
        self.services_json = json.dumps(value or [])


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("provider.id"), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    guests_count = db.Column(db.Integer, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(40), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    client = db.relationship("Client", back_populates="reservations")
    provider = db.relationship("Provider", back_populates="reservations")
    payments = db.relationship("Payment", back_populates="reservation", cascade="all, delete-orphan")


class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("provider.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    client = db.relationship("Client", back_populates="favorites")
    provider = db.relationship("Provider", back_populates="favorites")

    __table_args__ = (db.UniqueConstraint("client_id", "provider_id", name="uq_client_provider_favorite"),)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("provider.id"), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    client = db.relationship("Client", back_populates="messages")
    provider = db.relationship("Provider", back_populates="messages")


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey("reservation.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    provider_name = db.Column(db.String(160), nullable=False)
    status = db.Column(db.String(40), nullable=False, default="paid")
    payment_method = db.Column(db.String(40), nullable=False, default="card")
    transaction_reference = db.Column(db.String(120), unique=True, nullable=False)
    card_last4 = db.Column(db.String(4), nullable=False)
    paid_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reservation = db.relationship("Reservation", back_populates="payments")


class ChecklistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("client.id"), nullable=False)
    title = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    client = db.relationship("Client", back_populates="checklist_items")
