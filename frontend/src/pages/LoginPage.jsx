import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "../context/AuthContext";
=======
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import api from "../services/api";
import { getDashboardPathForUser, saveStoredUser } from "../services/auth";
import "./auth.css";
>>>>>>> bd2db821f100514414b08d51bcff83e77a84069d

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "client@3arrasli.com", password: "Client123!" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
<<<<<<< HEAD
      const response = await login(form);
      navigate(response.user.role === "Client" ? "/providers" : "/provider");
=======
      const response = await api.post("/login", form);
      const loggedUser = response.data.user;
      saveStoredUser(loggedUser);
      setMessage(`${response.data.message} Bienvenue ${loggedUser.name}.`);

      window.setTimeout(() => {
        navigate(getDashboardPathForUser(loggedUser));
      }, 700);
>>>>>>> bd2db821f100514414b08d51bcff83e77a84069d
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

