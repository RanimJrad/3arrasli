import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo (2).png";
import "../pages/auth.css";
import { clearStoredUser, getStoredUser } from "../services/auth";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/provider", label: "Prestataires" },
  { href: "#!", label: "Services" },
];

const getLinkVariant = (link, user) => {
  if (link.label === "Sign Up" || link.label === "Mon espace") {
    return "auth-nav-link-primary";
  }

  if (link.label === "Login" || (user?.role === "Admin" && link.label === "Admin")) {
    return "auth-nav-link-soft";
  }

  return "";
};

const Navbar = ({ onLogoClick }) => {
  const location = useLocation();
  const user = getStoredUser();

  const links = [
    ...publicLinks,
    ...(user?.role === "Admin" ? [{ to: "/admin", label: "Admin" }] : []),
    ...(user?.role === "Prestataire" ? [{ to: "/provider", label: "Mon espace" }] : []),
    ...(user ? [] : [{ to: "/login", label: "Login" }, { to: "/signup", label: "Sign Up" }]),
  ];

  return (
    <header className="auth-navbar">
      <div className="auth-container auth-navbar-content">
        <Link className="auth-logo" to="/" onClick={onLogoClick}>
          <span className="auth-logo-mark">
            <img src={logo} alt="logo" className="auth-logo-image" />
          </span>
          <span className="auth-logo-copy">
            <strong>3arrasli.tn</strong>
            <span>Wedding marketplace</span>
          </span>
        </Link>

        <nav className="auth-nav-shell">
          <div className="auth-nav-links">
          {links.map((link) => (
            link.to ? (
              <Link
                key={link.label}
                className={`auth-nav-link ${getLinkVariant(link, user)} ${location.pathname === link.to ? "active" : ""}`}
                to={link.to}
              >
                {link.label}
              </Link>
            ) : (
              <a key={link.label} className={`auth-nav-link ${getLinkVariant(link, user)}`} href={link.href}>
                {link.label}
              </a>
            )
          ))}
          </div>

          {user && (
            <button
              type="button"
              className="auth-nav-link auth-nav-button auth-nav-link-soft"
              onClick={() => {
                clearStoredUser();
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
