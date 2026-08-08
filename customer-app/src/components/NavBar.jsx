import { NavLink } from "react-router-dom";

const links = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/card", label: "Card", icon: "🪪" },
  { to: "/receipts", label: "Receipts", icon: "🧾" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export function NavBar() {
  return (
    <nav className="bottom-nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `bottom-nav-link${isActive ? " active" : ""}`}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
