import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import { getStoredUser } from "../services/auth";
import "./admin.css";

const emptyProviderForm = {
  name: "",
  email: "",
  password: "",
  company_name: "",
  category: "",
  city: "",
};

const emptyPackForm = {
  name: "",
  description: "",
  discount_percent: 10,
};

const statsConfig = [
  { key: "providers_total", label: "Prestataires" },
  { key: "providers_active", label: "Prestataires actifs" },
  { key: "appointments_total", label: "Rendez-vous" },
  { key: "contracts_signed", label: "Contrats signes" },
  { key: "invoices_pending", label: "Factures en attente" },
  { key: "reviews_flagged", label: "Avis a traiter" },
  { key: "packs_active", label: "Packs actifs" },
  { key: "flagged_chats", label: "Chats a superviser" },
];

const adminSections = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Vue generale",
    description: "Vision rapide de la plateforme, des volumes et des alertes.",
  },
  {
    id: "providers",
    label: "Prestataires",
    title: "Gestion compte prestataire",
    description: "Creation, consultation et desactivation des comptes prestataires.",
  },
  {
    id: "appointments",
    label: "Rendez-vous",
    title: "Gestion des rendez-vous",
    description: "Suivi des reservations, des dates et des montants.",
  },
  {
    id: "contracts",
    label: "Contrats",
    title: "Contrat en ligne",
    description: "Suivi des signatures numeriques et des contrats en attente.",
  },
  {
    id: "invoices",
    label: "Facturation",
    title: "Facturation",
    description: "Pilotage des references, paiements et echeances.",
  },
  {
    id: "reviews",
    label: "Avis",
    title: "Gestion des commentaires et avis",
    description: "Moderation des retours clients et supervision qualitative.",
  },
  {
    id: "packs",
    label: "Packs",
    title: "Packs promotionnels",
    description: "Creation d'offres et de reductions commerciales.",
  },
  {
    id: "chats",
    label: "Chats",
    title: "Supervision des chats",
    description: "Controle des echanges entre client et prestataire.",
  },
];

const AdminDashboard = () => {
  const user = getStoredUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [providerForm, setProviderForm] = useState(emptyProviderForm);
  const [packForm, setPackForm] = useState(emptyPackForm);
  const [submittingProvider, setSubmittingProvider] = useState(false);
  const [submittingPack, setSubmittingPack] = useState(false);

  const currentSection = adminSections.find((section) => section.id === activeSection) || adminSections[0];

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/admin/dashboard");
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le tableau de bord admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!user || user.role !== "Admin") {
    return <Navigate to="/login" replace />;
  }

  const onProviderChange = (event) => {
    const { name, value } = event.target;
    setProviderForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPackChange = (event) => {
    const { name, value } = event.target;
    setPackForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitProvider = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmittingProvider(true);

    try {
      await api.post("/api/admin/providers", providerForm);
      setMessage("Prestataire cree avec succes.");
      setProviderForm(emptyProviderForm);
      await loadDashboard();
      setActiveSection("providers");
    } catch (err) {
      setError(err.response?.data?.message || "Creation du prestataire impossible.");
    } finally {
      setSubmittingProvider(false);
    }
  };

  const toggleProviderStatus = async (provider) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/api/admin/providers/${provider.id}/status`, {
        is_active: !provider.is_active,
      });
      setMessage(`Compte ${provider.company_name || provider.name} mis a jour.`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Mise a jour du statut impossible.");
    }
  };

  const submitPack = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmittingPack(true);

    try {
      await api.post("/api/admin/packs", {
        ...packForm,
        discount_percent: Number(packForm.discount_percent),
      });
      setMessage("Pack promotionnel ajoute.");
      setPackForm(emptyPackForm);
      await loadDashboard();
      setActiveSection("packs");
    } catch (err) {
      setError(err.response?.data?.message || "Creation du pack impossible.");
    } finally {
      setSubmittingPack(false);
    }
  };

  const moderateReview = async (reviewId, status) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/api/admin/reviews/${reviewId}`, { status });
      setMessage("Moderation des avis mise a jour.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Moderation impossible.");
    }
  };

  const renderDashboard = () => (
    <>
      <section className="admin-stats-grid">
        {statsConfig.map((item) => (
          <article key={item.key} className="admin-stat-card">
            <span>{item.label}</span>
            <strong>{dashboard?.stats?.[item.key] ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="admin-overview-grid">
        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Ce que contient l'espace admin</h2>
            <p>Chaque page de la sidebar se concentre sur un bloc fonctionnel clair.</p>
          </div>
          <div className="admin-summary-list">
            {adminSections.slice(1).map((section) => (
              <button
                key={section.id}
                type="button"
                className="admin-summary-card"
                onClick={() => {
                  setActiveSection(section.id);
                  setIsSidebarOpen(false);
                }}
              >
                <strong>{section.label}</strong>
                <p>{section.description}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-head">
            <h2>Priorites</h2>
            <p>Les indicateurs les plus sensibles sont visibles en un coup d'oeil.</p>
          </div>
          <div className="admin-priority-list">
            <div className="admin-priority-item">
              <strong>{dashboard?.stats?.reviews_flagged ?? 0}</strong>
              <span>Avis a moderer</span>
            </div>
            <div className="admin-priority-item">
              <strong>{dashboard?.stats?.invoices_pending ?? 0}</strong>
              <span>Factures en attente</span>
            </div>
            <div className="admin-priority-item">
              <strong>{dashboard?.stats?.flagged_chats ?? 0}</strong>
              <span>Chats a surveiller</span>
            </div>
          </div>
        </article>
      </section>
    </>
  );

  const renderProviders = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Gestion de compte prestataire</h2>
        <p>Creation, consultation et desactivation des prestataires.</p>
      </div>

      <form className="admin-form" onSubmit={submitProvider}>
        <input name="name" placeholder="Nom du contact" value={providerForm.name} onChange={onProviderChange} />
        <input name="email" placeholder="Email" type="email" value={providerForm.email} onChange={onProviderChange} />
        <input
          name="password"
          placeholder="Mot de passe temporaire"
          type="password"
          value={providerForm.password}
          onChange={onProviderChange}
        />
        <input
          name="company_name"
          placeholder="Nom de l'entreprise"
          value={providerForm.company_name}
          onChange={onProviderChange}
        />
        <input name="category" placeholder="Categorie" value={providerForm.category} onChange={onProviderChange} />
        <input name="city" placeholder="Ville" value={providerForm.city} onChange={onProviderChange} />

        <button type="submit" className="auth-btn" disabled={submittingProvider}>
          {submittingProvider ? (
            <>
              <Spinner /> Creation...
            </>
          ) : (
            "Creer un prestataire"
          )}
        </button>
      </form>

      <div className="admin-list">
        {dashboard?.providers?.map((provider) => (
          <div key={provider.id} className="admin-list-item">
            <div>
              <strong>{provider.company_name || provider.name}</strong>
              <p>{provider.category} - {provider.city}</p>
              <small>{provider.email}</small>
            </div>

            <button
              type="button"
              className={`admin-chip ${provider.is_active ? "warn" : "ok"}`}
              onClick={() => toggleProviderStatus(provider)}
            >
              {provider.is_active ? "Desactiver" : "Reactiver"}
            </button>
          </div>
        ))}
      </div>
    </article>
  );

  const renderAppointments = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Gestion des rendez-vous</h2>
        <p>Suivi des reservations et des statuts.</p>
      </div>
      <div className="admin-list">
        {dashboard?.appointments?.map((appointment) => (
          <div key={appointment.id} className="admin-list-item">
            <div>
              <strong>{appointment.service_name}</strong>
              <p>{appointment.client_name} avec {appointment.provider_name}</p>
              <small>{new Date(appointment.scheduled_for).toLocaleString("fr-FR")}</small>
            </div>
            <span className="admin-chip neutral">
              {appointment.status} - {appointment.amount} TND
            </span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderContracts = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Contrat en ligne</h2>
        <p>Contrats numeriques et signatures.</p>
      </div>
      <div className="admin-list">
        {dashboard?.contracts?.map((contract) => (
          <div key={contract.id} className="admin-list-item">
            <div>
              <strong>{contract.title}</strong>
              <p>{contract.client_name} / {contract.provider_name}</p>
              <small>
                Client: {contract.signed_by_client ? "signe" : "en attente"} - Prestataire:{" "}
                {contract.signed_by_provider ? "signe" : "en attente"}
              </small>
            </div>
            <span className="admin-chip neutral">{contract.status}</span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderInvoices = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Facturation</h2>
        <p>Suivi des references, montants et echeances.</p>
      </div>
      <div className="admin-list">
        {dashboard?.invoices?.map((invoice) => (
          <div key={invoice.id} className="admin-list-item">
            <div>
              <strong>{invoice.reference}</strong>
              <p>{invoice.customer_name}</p>
              <small>Echeance: {new Date(invoice.due_date).toLocaleDateString("fr-FR")}</small>
            </div>
            <span className="admin-chip neutral">
              {invoice.status} - {invoice.amount} TND
            </span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderReviews = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Gestion des commentaires et avis</h2>
        <p>Moderation rapide des avis clients.</p>
      </div>
      <div className="admin-list">
        {dashboard?.reviews?.map((review) => (
          <div key={review.id} className="admin-review-item">
            <div>
              <strong>{review.author_name} vers {review.target_name}</strong>
              <p>{review.comment}</p>
              <small>Note: {review.rating}/5 - Statut: {review.status}</small>
            </div>
            <div className="admin-inline-actions">
              <button type="button" className="admin-chip ok" onClick={() => moderateReview(review.id, "Visible")}>
                Valider
              </button>
              <button type="button" className="admin-chip warn" onClick={() => moderateReview(review.id, "Masque")}>
                Masquer
              </button>
              <button type="button" className="admin-chip neutral" onClick={() => moderateReview(review.id, "Signale")}>
                Signaler
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );

  const renderPacks = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Packs promotionnels</h2>
        <p>Creation d'offres et de reductions commerciales.</p>
      </div>

      <form className="admin-form compact" onSubmit={submitPack}>
        <input name="name" placeholder="Nom du pack" value={packForm.name} onChange={onPackChange} />
        <input
          name="discount_percent"
          type="number"
          min="1"
          max="100"
          placeholder="Reduction %"
          value={packForm.discount_percent}
          onChange={onPackChange}
        />
        <textarea
          name="description"
          placeholder="Description du pack"
          value={packForm.description}
          onChange={onPackChange}
        />

        <button type="submit" className="auth-btn" disabled={submittingPack}>
          {submittingPack ? (
            <>
              <Spinner /> Ajout...
            </>
          ) : (
            "Ajouter un pack"
          )}
        </button>
      </form>

      <div className="admin-list">
        {dashboard?.packs?.map((pack) => (
          <div key={pack.id} className="admin-list-item">
            <div>
              <strong>{pack.name}</strong>
              <p>{pack.description}</p>
            </div>
            <span className="admin-chip ok">{pack.discount_percent}%</span>
          </div>
        ))}
      </div>
    </article>
  );

  const renderChats = () => (
    <article className="admin-panel">
      <div className="admin-panel-head">
        <h2>Superviser les chats</h2>
        <p>Conversations client / prestataire placees sous surveillance.</p>
      </div>
      <div className="admin-chat-grid">
        {dashboard?.chats?.map((chat) => (
          <div key={chat.id} className="admin-chat-card">
            <div className="admin-chat-head">
              <strong>{chat.client_name} / {chat.provider_name}</strong>
              <span className={`admin-chip ${chat.flagged ? "warn" : "neutral"}`}>
                {chat.flagged ? "Sous surveillance" : chat.status}
              </span>
            </div>

            <div className="admin-chat-messages">
              {chat.messages.map((chatMessage) => (
                <div key={chatMessage.id} className="admin-message">
                  <strong>{chatMessage.sender_name}</strong>
                  <p>{chatMessage.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "providers":
        return renderProviders();
      case "appointments":
        return renderAppointments();
      case "contracts":
        return renderContracts();
      case "invoices":
        return renderInvoices();
      case "reviews":
        return renderReviews();
      case "packs":
        return renderPacks();
      case "chats":
        return renderChats();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-main auth-container">
        <section className="admin-shell">
          <button
            type="button"
            className="admin-hamburger"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Fermer le menu admin" : "Ouvrir le menu admin"}
            aria-expanded={isSidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          {isSidebarOpen ? (
            <button
              type="button"
              className="admin-sidebar-backdrop"
              aria-label="Fermer la sidebar"
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : null}

          <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <div className="admin-sidebar-brand">
              <p className="admin-eyebrow">Administration</p>
              <h1>Espace admin</h1>
              <span>{user.name}</span>
            </div>

            <nav className="admin-sidebar-nav">
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`admin-sidebar-link ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <strong>{section.label}</strong>
                  <small>{section.title}</small>
                </button>
              ))}
            </nav>
          </aside>

          <section className="admin-content">
            <header className="admin-content-header">
              <div>
                <p className="admin-section-label">{currentSection.label}</p>
                <h2>{currentSection.title}</h2>
                <p>{currentSection.description}</p>
              </div>
            </header>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            {loading ? (
              <div className="admin-loading">
                <Spinner /> Chargement du dashboard...
              </div>
            ) : (
              renderContent()
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
