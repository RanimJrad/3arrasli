import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const BookingPage = () => {
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    provider_id: searchParams.get("providerId") || "",
    event_date: "",
    guests_count: 120,
    budget: "",
    notes: "",
  });

  useEffect(() => {
    const loadProviders = async () => {
      const response = await api.get("/api/providers");
      setProviders(response.data.providers);
    };

    loadProviders();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/api/reservations", form);
      setMessage(response.data.message);
      setForm((prev) => ({ ...prev, event_date: "", budget: "", notes: "" }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Impossible de creer la reservation.");
    }
  };

  return (
    <div className="page-stack">
      <section className="content-section two-columns">
        <div className="surface-card">
          <p className="section-label">Reservation</p>
          <h1>Envoyer une demande de reservation</h1>
          <p className="muted">Cette page envoie les donnees vers `POST /api/reservations`.</p>

          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Prestataire
              <select value={form.provider_id} onChange={(event) => setForm((prev) => ({ ...prev, provider_id: event.target.value }))} required>
                <option value="">Selectionnez</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.company_name} - {provider.service_type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date du mariage
              <input type="date" value={form.event_date} onChange={(event) => setForm((prev) => ({ ...prev, event_date: event.target.value }))} required />
            </label>

            <label>
              Nombre d'invites
              <input type="number" min="1" value={form.guests_count} onChange={(event) => setForm((prev) => ({ ...prev, guests_count: Number(event.target.value) }))} required />
            </label>

            <label>
              Budget prevu
              <input type="number" min="0" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))} required />
            </label>

            <label className="full-width">
              Notes complementaires
              <textarea rows="5" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Style souhaite, horaire, livrables..." />
            </label>

            <button className="btn btn-primary" type="submit">Confirmer la reservation</button>
          </form>

          {message ? <div className="notice">{message}</div> : null}
        </div>

        <aside className="surface-card warm-card">
          <p className="section-label">Bonnes pratiques</p>
          <ul className="feature-list compact">
            <li>Valider la date cote client et cote serveur</li>
            <li>Verifier que le budget est positif</li>
            <li>Lier la reservation au client authentifie</li>
            <li>Passer le statut a `confirmed` apres paiement</li>
          </ul>
        </aside>
      </section>
    </div>
  );
};

export default BookingPage;
