import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import { getDashboardPathForUser, saveStoredUser } from "../services/auth";
import "./auth.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "Tunis",
    wedding_date: "",
    role: "Client",
  });
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

    if (!form.name || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register", form);
      const signedUser = response.data.user;
      const token = response.data.token || "";
      saveStoredUser({ user: signedUser, token });
      setMessage(response.data.message || "Inscription reussie.");
      window.setTimeout(() => navigate(getDashboardPathForUser(signedUser)), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <section className="auth-shell">
          <div className="auth-visual-panel">
            <div className="auth-visual-backdrop auth-visual-signup" />
            <div className="auth-visual-overlay" />
            <div className="auth-visual-content">
              <span className="auth-kicker">Inscription</span>
              <h1>Creez votre compte et commencez votre organisation mariage.</h1>
            </div>
          </div>

          <section className="auth-card auth-card-signup">
            <div className="auth-card-top">
              <span className="auth-eyebrow">Nouveau compte</span>
              <h2>Rejoignez 3arrasli</h2>
            </div>

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="name">Nom complet</label>
                <input id="name" name="name" value={form.name} onChange={onChange} />
              </div>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={onChange} />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Mot de passe</label>
                <input id="password" name="password" type="password" value={form.password} onChange={onChange} />
              </div>
              <div className="auth-field">
                <label htmlFor="city">Ville</label>
                <input id="city" name="city" value={form.city} onChange={onChange} />
              </div>
              <div className="auth-field">
                <label htmlFor="wedding_date">Date du mariage</label>
                <input id="wedding_date" name="wedding_date" type="date" value={form.wedding_date} onChange={onChange} />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner /> Inscription...
                  </>
                ) : (
                  "Creer mon compte"
                )}
              </button>
            </form>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            <p className="auth-link-text">
              Vous avez deja un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default SignupPage;
