import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy-block">
          <p className="eyebrow">Wedding marketplace</p>
          <h1>Organisez votre mariage, trouvez vos prestataires et reservez sans friction.</h1>
          <p className="hero-text">
            Cette base React + Flask couvre la recherche avancee, les favoris, le chat,
            les reservations, le planificateur et le paiement en ligne avec une architecture claire.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/providers">
              Explorer les prestataires
            </Link>
            <Link className="btn btn-secondary" to="/planner">
              Ouvrir mon planificateur
            </Link>
          </div>
        </div>

        <div className="hero-card-grid">
          <article className="info-card accent-card">
            <span>Recherche avancee</span>
            <strong>Filtres par ville, budget et type</strong>
          </article>
          <article className="info-card">
            <span>Reservation</span>
            <strong>Creation rapide via `POST /api/reservations`</strong>
          </article>
          <article className="info-card">
            <span>Messagerie</span>
            <strong>Polling simple pret a evoluer vers WebSocket</strong>
          </article>
          <article className="info-card">
            <span>Paiement</span>
            <strong>Validation front + transaction backend</strong>
          </article>
        </div>
      </section>

      <section className="content-section two-columns">
        <div className="surface-card">
          <p className="section-label">Fonctionnalites client</p>
          <h2>Ce que la base inclut</h2>
          <ul className="feature-list">
            <li>Liste et fiche detail des prestataires</li>
            <li>Ajout et suppression des favoris</li>
            <li>Creation et suivi des reservations</li>
            <li>Checklist mariage personnalisee</li>
            <li>Messagerie temps reel simplifiee</li>
            <li>Paiement securise cote interface</li>
          </ul>
        </div>

        <div className="surface-card warm-card">
          <p className="section-label">Compte de demonstration</p>
          <h2>Pour tester immediatement</h2>
          <ul className="feature-list compact">
            <li>Client: `client@3arrasli.com`</li>
            <li>Mot de passe: `Client123!`</li>
            <li>Prestataire seed: `studio@3arrasli.com`</li>
            <li>Mot de passe: `Provider123!`</li>
          </ul>
          <Link className="btn btn-primary" to="/login">
            Se connecter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
