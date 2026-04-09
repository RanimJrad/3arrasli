import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "client@3arrasli.com", password: "Client123!" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await login(form);
      navigate(response.user.role === "Client" ? "/providers" : "/provider");
    } catch (err) {
      setError(err.response?.data?.message || "Connexion impossible.");
    }
  };

  return (
    <div className="auth-layout">
      <section className="surface-card auth-card-simple">
        <p className="section-label">Connexion</p>
        <h1>Acceder a votre espace client</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
          <label>
            Mot de passe
            <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          </label>
          <button className="btn btn-primary" type="submit">Se connecter</button>
        </form>
        {error ? <div className="notice">{error}</div> : null}
        <p className="muted">Pas encore de compte ? <Link to="/signup">Creer un compte</Link></p>
      </section>
    </div>
  );
};

export default LoginPage;
