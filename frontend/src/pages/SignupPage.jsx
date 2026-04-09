import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "Tunis",
    wedding_date: "",
    role: "Client",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      navigate("/providers");
    } catch (err) {
      setError(err.response?.data?.message || "Inscription impossible.");
    }
  };

  return (
    <div className="auth-layout">
      <section className="surface-card auth-card-simple">
        <p className="section-label">Inscription</p>
        <h1>Creer un compte client</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nom complet
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </label>
          <label>
            Mot de passe
            <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required />
          </label>
          <label>
            Ville
            <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          </label>
          <label>
            Date du mariage
            <input type="date" value={form.wedding_date} onChange={(event) => setForm((prev) => ({ ...prev, wedding_date: event.target.value }))} />
          </label>
          <button className="btn btn-primary" type="submit">Creer mon compte</button>
        </form>
        {error ? <div className="notice">{error}</div> : null}
      </section>
    </div>
  );
};

export default SignupPage;
