import React from "react";
import { Link } from "react-router-dom";

const ProviderCard = ({ provider, onToggleFavorite, canFavorite = false }) => {
  return (
    <article className="provider-card">
      <div className="provider-card-head">
        <div>
          <p className="service-badge">{provider.service_type}</p>
          <h3>{provider.company_name}</h3>
          <p className="muted">{provider.city}</p>
        </div>
        <div className="rating-pill">{provider.rating.toFixed(1)}</div>
      </div>

      <p className="provider-description">{provider.description}</p>

      <div className="tag-row">
        {provider.services.map((service) => (
          <span key={service} className="service-tag">
            {service}
          </span>
        ))}
      </div>

      <div className="provider-card-footer">
        <div>
          <strong>{provider.price_min} - {provider.price_max} TND</strong>
          <p className="muted">Budget estime</p>
        </div>
        <div className="action-row">
          {canFavorite ? (
            <button className="icon-btn" type="button" onClick={() => onToggleFavorite(provider)}>
              {provider.is_favorite ? "Retirer" : "Favori"}
            </button>
          ) : null}
          <Link className="btn btn-secondary" to={`/providers/${provider.id}`}>
            Profil
          </Link>
          <Link className="btn btn-primary" to={`/booking?providerId=${provider.id}`}>
            Reserver
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProviderCard;
