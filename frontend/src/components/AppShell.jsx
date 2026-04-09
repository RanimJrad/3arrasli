import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppShell = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">3A</span>
          <div>
            <strong>3arrasli</strong>
            <span>Wedding client app</span>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/providers">Prestataires</NavLink>
          <NavLink to="/booking">Reservations</NavLink>
          <NavLink to="/favorites">Favoris</NavLink>
          <NavLink to="/planner">Checklist</NavLink>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/payments">Paiements</NavLink>
        </nav>

        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                <span>{user?.name}</span>
                <small>{user?.role}</small>
              </div>
              <button className="btn btn-secondary" type="button" onClick={handleLogout}>
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary" to="/login">
                Connexion
              </Link>
              <Link className="btn btn-primary" to="/signup">
                Inscription
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
