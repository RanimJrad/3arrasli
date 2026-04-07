import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import "./auth.css";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      // Call Flask login endpoint and display returned user feedback.
      const response = await api.post("/login", form);
      setMessage(`${response.data.message} Bienvenue ${response.data.user.name}.`);
    } catch (err) {
      const apiMessage = err.response?.data?.message || "Echec de la connexion.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <h1>Connexion</h1>
          <p className="auth-subtitle">Accedez a votre espace 3arrasli.tn</p>

          <form onSubmit={onSubmit} className="auth-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={onChange}
            />

            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={form.password}
              onChange={onChange}
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {error && <p className="auth-alert error">{error}</p>}
          {message && <p className="auth-alert success">{message}</p>}

          <p className="auth-link-text">
            Vous n'avez pas de compte ? <Link to="/signup">Creer un compte</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
