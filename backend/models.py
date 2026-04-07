from extensions import db
from datetime import datetime


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    provider_profile = db.relationship("ProviderProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


class ProviderProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    company_name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(120), nullable=False)
    created_by_admin = db.Column(db.Boolean, nullable=False, default=False)

    user = db.relationship("User", back_populates="provider_profile")


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(160), nullable=False)
    client_name = db.Column(db.String(120), nullable=False)
    provider_name = db.Column(db.String(120), nullable=False)
    scheduled_for = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(40), nullable=False, default="En attente")
    amount = db.Column(db.Float, nullable=False, default=0.0)


class OnlineContract(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    client_name = db.Column(db.String(120), nullable=False)
    provider_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(40), nullable=False, default="En attente de signature")
    signed_by_client = db.Column(db.Boolean, nullable=False, default=False)
    signed_by_provider = db.Column(db.Boolean, nullable=False, default=False)
    signed_at = db.Column(db.DateTime, nullable=True)


class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(60), nullable=False, unique=True)
    customer_name = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(40), nullable=False, default="A payer")
    due_date = db.Column(db.DateTime, nullable=False)


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String(120), nullable=False)
    target_name = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(40), nullable=False, default="Visible")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Pack(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    discount_percent = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)


class ChatThread(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(120), nullable=False)
    provider_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(40), nullable=False, default="Ouvert")
    flagged = db.Column(db.Boolean, nullable=False, default=False)

    messages = db.relationship("ChatMessage", back_populates="thread", cascade="all, delete-orphan")


class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey("chat_thread.id"), nullable=False)
    sender_name = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    thread = db.relationship("ChatThread", back_populates="messages")
