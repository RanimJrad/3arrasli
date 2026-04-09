import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import "./auth.css";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      // Keep confirmPassword on client side only, API expects these fields.
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      const response = await api.post("/register", payload);
      setMessage(`${response.data.message} Vous pouvez maintenant vous connecter.`);
      setForm({ name: "", email: "", password: "", confirmPassword: "", role: "Client" });
    } catch (err) {
      const apiMessage = err.response?.data?.message || "Echec de l'inscription.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-main">
        <section className="auth-shell auth-shell-reverse">
          <div className="auth-visual-panel">
            <div className="auth-visual-backdrop auth-visual-signup" />
            <div className="auth-visual-overlay" />
            <div className="auth-visual-glow auth-visual-glow-one" />
            <div className="auth-visual-glow auth-visual-glow-two" />

            <div className="auth-visual-content">
              <span className="auth-kicker">Commencez votre histoire</span>
              <h1>Creez un compte dans un univers mariage moderne, romantique et soigneusement pense.</h1>
              <p>
                Rejoignez la plateforme pour explorer des prestations elegantes, construire votre
                projet plus sereinement et profiter d'une experience visuelle digne d'un mariage luxe.
              </p>

              <div className="auth-visual-points">
                <span>Inscription simple en quelques secondes</span>
                <span>Acces couples et prestataires</span>
                <span>Direction artistique coherente avec la Home</span>
              </div>
            </div>
          </div>

          <section className="auth-card auth-card-signup">
            <div className="auth-card-top">
              <span className="auth-eyebrow">Inscription</span>
              <h2>Rejoignez 3arrasli.tn</h2>
              <p className="auth-subtitle">Creez votre compte et entrez dans un espace plus premium, plus fluide et plus inspirant.</p>
            </div>

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="name">Nom</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Votre nom complet"
                  value={form.name}
                  onChange={onChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={onChange}
                />
              </div>

              <div className="auth-field auth-field-split">
                <div className="auth-field">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 caracteres"
                    value={form.password}
                    onChange={onChange}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repetez le mot de passe"
                    value={form.confirmPassword}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={onChange}>
                  <option value="Client">Client</option>
                  <option value="Prestataire">Prestataire</option>
                </select>
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
