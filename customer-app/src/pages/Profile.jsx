import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../format.js";

export function Profile() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="screen">
      <header className="page-header">
        <h1>Profile</h1>
      </header>

      <div className="profile-card">
        <div className="profile-row">
          <span className="muted">Name</span>
          <span>{customer?.name}</span>
        </div>
        <div className="profile-row">
          <span className="muted">Email</span>
          <span>{customer?.email}</span>
        </div>
        <div className="profile-row">
          <span className="muted">ReceiptStore ID</span>
          <span>{customer?.receiptstoreId}</span>
        </div>
        <div className="profile-row">
          <span className="muted">Member since</span>
          <span>{customer?.memberSince ? formatDate(customer.memberSince) : "—"}</span>
        </div>
      </div>

      <button type="button" className="secondary-button" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
}
