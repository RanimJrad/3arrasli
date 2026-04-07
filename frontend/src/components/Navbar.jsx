import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo (2).png";
import "../pages/auth.css";
import { clearStoredUser, getStoredUser } from "../services/auth";

const publicLinks = [
  { to: "/", label: "Home" },
  { href: "#!", label: "Prestataires" },
  { href: "#!", label: "Services" },
];

const Navbar = () => {
  const location = useLocation();
  const user = getStoredUser();

  const links = [
    ...publicLinks,
    ...(user?.role === "Admin" ? [{ to: "/admin", label: "Admin" }] : []),
    ...(user ? [] : [{ to: "/login", label: "Login" }, { to: "/signup", label: "Sign Up" }]),
  ];

  return (
    <header className="auth-navbar">
      <div className="auth-container auth-navbar-content">
        <Link className="auth-logo" to="/">
          <img src={logo} alt="logo" className="auth-logo-image" />
        </Link>

        <nav className="auth-nav-links">
          {links.map((link) => (
            link.to ? (
              <Link
                key={link.label}
                className={`auth-nav-link ${location.pathname === link.to ? "active" : ""}`}
                to={link.to}
              >
                {link.label}
              </Link>
            ) : (
              <a key={link.label} className="auth-nav-link" href={link.href}>
                {link.label}
              </a>
            )
          ))}

          {user && (
            <button
              type="button"
              className="auth-nav-link auth-nav-button"
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
