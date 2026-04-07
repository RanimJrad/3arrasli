import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo (2).png";
import "../pages/auth.css";

const links = [
  { to: "/", label: "Home" },
  { href: "#!", label: "Prestataires" },
  { href: "#!", label: "Services" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Sign Up" },
];

const Navbar = () => {
  const location = useLocation();

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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
