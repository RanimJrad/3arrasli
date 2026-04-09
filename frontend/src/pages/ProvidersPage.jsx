import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProviderCard from "../components/ProviderCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const defaultFilters = {
  city: "",
  budget: "",
  type: "",
};

const ProvidersPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilters = useMemo(
    () => ({
      city: searchParams.get("city") || "",
      budget: searchParams.get("budget") || "",
      type: searchParams.get("type") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/providers", { params: activeFilters });
      setProviders(response.data.providers);
    } catch (error) {
      setFeedback(error.response?.data?.message || "Impossible de charger les prestataires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [searchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      )
    );
  };

  const handleToggleFavorite = async (provider) => {
    if (!isAuthenticated || user?.role !== "Client") {
      setFeedback("Connectez-vous comme client pour gerer vos favoris.");
      return;
    }

    try {
      if (provider.is_favorite) {
        await api.delete(`/api/favorites/${provider.id}`);
      } else {
        await api.post(`/api/favorites/${provider.id}`);
      }
      await loadProviders();
      setFeedback("Favoris mis a jour.");
    } catch (error) {
      setFeedback(error.response?.data?.message || "Impossible de mettre a jour le favori.");
    }
  };

  return (
    <div className="page-stack">
      <section className="content-section split-layout">
        <form className="surface-card filter-panel" onSubmit={handleSubmit}>
          <p className="section-label">Recherche avancee</p>
          <h2>Filtrer les prestataires</h2>

          <label>
            Ville
            <input value={filters.city} onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))} placeholder="Tunis" />
          </label>

          <label>
            Budget maximum
            <input value={filters.budget} onChange={(event) => setFilters((prev) => ({ ...prev, budget: event.target.value }))} placeholder="2500" type="number" min="0" />
          </label>

          <label>
            Type de service
            <select value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="">Tous</option>
              <option value="Photographe">Photographe</option>
              <option value="Salle">Salle</option>
              <option value="Traiteur">Traiteur</option>
              <option value="Wedding planner">Wedding planner</option>
            </select>
          </label>

          <div className="action-row">
            <button className="btn btn-primary" type="submit">Rechercher</button>
            <button className="btn btn-secondary" type="button" onClick={() => { setFilters(defaultFilters); setSearchParams({}); }}>
              Reinitialiser
            </button>
          </div>
        </form>

        <div className="results-column">
          <div className="section-intro">
            <p className="section-label">Prestataires</p>
            <h1>Choisissez les meilleurs partenaires pour votre mariage</h1>
            <p className="muted">Cette page consomme `GET /api/providers` avec filtres `city`, `budget` et `type`.</p>
          </div>

          {feedback ? <div className="notice">{feedback}</div> : null}
          {loading ? <div className="surface-card">Chargement des prestataires...</div> : null}

          <div className="provider-grid">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                canFavorite={isAuthenticated && user?.role === "Client"}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProvidersPage;
