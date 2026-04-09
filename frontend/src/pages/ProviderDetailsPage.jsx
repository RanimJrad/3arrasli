import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const ProviderDetailsPage = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const loadProvider = async () => {
      const response = await api.get(`/api/providers/${providerId}`);
      setProvider(response.data.provider);
    };

    loadProvider();
  }, [providerId]);

  if (!provider) {
    return <div className="surface-card">Chargement du profil...</div>;
  }

  return (
    <div className="page-stack">
      <section className="content-section details-layout">
        <div className="surface-card details-main">
          <p className="section-label">{provider.service_type}</p>
          <h1>{provider.company_name}</h1>
          <p className="muted">{provider.city} · Note {provider.rating.toFixed(1)}</p>
          <p className="provider-description">{provider.description}</p>
          <div className="tag-row">
            {provider.services.map((service) => (
              <span className="service-tag" key={service}>{service}</span>
            ))}
          </div>
        </div>

        <aside className="surface-card sticky-side">
          <h2>Budget</h2>
          <p className="pricing-highlight">{provider.price_min} - {provider.price_max} TND</p>
          <p className="muted">Services et disponibilites a confirmer par message.</p>
          <div className="stacked-actions">
            <Link className="btn btn-primary" to={`/booking?providerId=${provider.id}`}>
              Reserver ce prestataire
            </Link>
            <Link className="btn btn-secondary" to={`/chat?providerId=${provider.id}`}>
              Ouvrir le chat
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ProviderDetailsPage;
