import React from "react";

const providerHighlights = [
  { title: "Demandes du jour", value: "06" },
  { title: "Disponibilites ouvertes", value: "14" },
  { title: "Messages recents", value: "11" },
  { title: "Taux de reponse", value: "97%" },
];

const ProviderDashboard = () => {
  return (
    <div className="page-stack">
      <section className="page-hero page-hero-provider">
        <div>
          <p className="section-label">Espace prestataire</p>
          <h1>Une vue prestataire alignee avec le nouvel univers visuel du projet</h1>
          <p className="muted">
            Le dashboard provider adopte maintenant les memes codes couleurs que le cote client,
            avec une ambiance plus chaleureuse et plus haut de gamme.
          </p>
        </div>
      </section>

      <section className="admin-preview-grid">
        {providerHighlights.map((item) => (
          <article key={item.title} className="surface-card stat-card-soft provider-stat-card">
            <p className="section-label">Prestataire</p>
            <strong className="metric-value">{item.value}</strong>
            <span className="muted">{item.title}</span>
          </article>
        ))}
      </section>

      <section className="content-section two-columns">
        <article className="surface-card">
          <p className="section-label">Pages conseillees</p>
          <ul className="feature-list">
            <li>Profil et services</li>
            <li>Calendrier de disponibilite</li>
            <li>Demandes de reservation</li>
            <li>Messagerie client</li>
          </ul>
        </article>

        <article className="surface-card warm-card provider-note-card">
          <p className="section-label">Theme visuel</p>
          <h2>Un rendu plus adapte au contexte mariage</h2>
          <p className="muted">
            Tons doux, lumiere creme, accents roses et sauge pour inspirer confiance sans tomber
            dans des couleurs trop agressives.
          </p>
        </article>
      </section>
    </div>
  );
};

export default ProviderDashboard;
