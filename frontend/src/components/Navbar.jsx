import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Sign Up" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="auth-navbar">
      <div className="auth-container auth-navbar-content">
        <Link className="auth-logo" to="/">
          3arrasli.tn
        </Link>

        <nav className="auth-nav-links">
          {links.map((link) => (
            <Link
              key={link.to}
              className={`auth-nav-link ${location.pathname === link.to ? "active" : ""}`}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
