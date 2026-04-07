import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import { saveStoredUser } from "../services/auth";
import "./auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
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
      const response = await api.post("/login", form);
      const loggedUser = response.data.user;
      saveStoredUser(loggedUser);
      setMessage(`${response.data.message} Bienvenue ${loggedUser.name}.`);

      window.setTimeout(() => {
        navigate(loggedUser.role === "Admin" ? "/admin" : "/");
      }, 700);
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
          <p className="auth-hint">
            L'administrateur est cree directement en base de donnees et se connecte ici, sans passer par
            l'inscription publique.
          </p>

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
