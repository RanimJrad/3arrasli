import React, { useEffect, useState } from "react";
import ProviderCard from "../components/ProviderCard";
import api from "../services/api";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState("");

  const loadFavorites = async () => {
    try {
      const response = await api.get("/api/favorites");
      setFavorites(response.data.favorites);
    } catch (error) {
      setMessage(error.response?.data?.message || "Impossible de charger les favoris.");
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (provider) => {
    await api.delete(`/api/favorites/${provider.id}`);
    loadFavorites();
  };

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="section-label">Favoris</p>
        <h1>Vos prestataires sauvegardes</h1>
      </section>

      {message ? <div className="notice">{message}</div> : null}

      <div className="provider-grid">
        {favorites.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} canFavorite onToggleFavorite={handleRemove} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
