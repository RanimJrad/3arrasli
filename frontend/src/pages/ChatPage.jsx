import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const ChatPage = () => {
  const [providers, setProviders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const providerId = searchParams.get("providerId") || "";

  const currentProvider = useMemo(
    () => providers.find((item) => String(item.id) === String(providerId)),
    [providers, providerId]
  );

  const loadProviders = async () => {
    const response = await api.get("/api/providers");
    setProviders(response.data.providers);
  };

  const loadMessages = async (selectedProviderId) => {
    if (!selectedProviderId) {
      setMessages([]);
      return;
    }

    const response = await api.get("/api/messages", {
      params: { provider_id: selectedProviderId },
    });
    setMessages(response.data.messages);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    loadMessages(providerId);
    if (!providerId) {
      return undefined;
    }

    const interval = window.setInterval(() => loadMessages(providerId), 5000);
    return () => window.clearInterval(interval);
  }, [providerId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!providerId || !draft.trim()) {
      return;
    }

    const response = await api.post("/api/messages", {
      provider_id: Number(providerId),
      content: draft,
    });
    setMessages(response.data.messages);
    setDraft("");
  };

  return (
    <div className="page-stack">
      <section className="page-hero page-hero-chat">
        <div>
          <p className="section-label">Messagerie mariage</p>
          <h1>Discutez avec vos prestataires dans une interface plus douce et plus claire</h1>
          <p className="muted">
            Le style visuel suit maintenant la meme ambiance que la recherche, la reservation
            et le planificateur.
          </p>
        </div>
      </section>

      <section className="chat-layout">
        <aside className="surface-card chat-sidebar">
          <p className="section-label">Conversations</p>
          <h2>Choisir un prestataire</h2>
          <div className="provider-list-mini">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className={`conversation-item ${String(provider.id) === String(providerId) ? "active" : ""}`}
                onClick={() => setSearchParams({ providerId: provider.id })}
              >
                <strong>{provider.company_name}</strong>
                <span>{provider.service_type}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="surface-card chat-window">
          <div className="chat-header">
            <div>
              <p className="section-label">Chat temps reel simplifie</p>
              <h1>{currentProvider ? currentProvider.company_name : "Selectionnez une conversation"}</h1>
            </div>
          </div>

          <div className="messages-column">
            {messages.length === 0 ? (
              <div className="empty-state">
                <strong>Aucun message pour le moment</strong>
                <p className="muted">Selectionnez un prestataire puis envoyez votre premiere demande.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message-bubble ${message.sender_type}`}>
                  <span>{message.content}</span>
                  <small>{new Date(message.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ecrire un message..." />
            <button className="btn btn-primary" type="submit">Envoyer</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
