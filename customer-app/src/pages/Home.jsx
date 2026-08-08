import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { formatPence, formatDate } from "../format.js";

export function Home() {
  const { customer } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .receipts({ sort: "date_desc" })
      .then((data) => setRecent(data.receipts.slice(0, 5)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = customer?.name?.split(" ")[0] || "there";

  return (
    <div className="screen">
      <header className="page-header">
        <h1>Hi {firstName} 👋</h1>
      </header>

      <section className="spend-card">
        <p className="spend-label">This month</p>
        <p className="spend-amount">{formatPence(customer?.monthSpendPence || 0)}</p>
        <p className="spend-sub">
          across {customer?.monthReceiptCount || 0} receipt{customer?.monthReceiptCount === 1 ? "" : "s"}
        </p>
      </section>

      <div className="quick-links">
        <Link to="/card" className="quick-link">
          <span>🪪</span> My Card
        </Link>
        <Link to="/receipts" className="quick-link">
          <span>🧾</span> All Receipts
        </Link>
      </div>

      <section>
        <h2 className="section-title">Recent receipts</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && recent.length === 0 && (
          <p className="muted">No receipts yet — shop at a Demo Till to see one appear here.</p>
        )}
        <ul className="receipt-list">
          {recent.map((r) => (
            <li key={r.id}>
              <Link to={`/receipts/${r.id}`} className="receipt-row">
                <div>
                  <p className="receipt-retailer">{r.retailerName}</p>
                  <p className="receipt-meta">{formatDate(r.createdAt)} · {r.itemCount} item{r.itemCount === 1 ? "" : "s"}</p>
                </div>
                <p className="receipt-total">{formatPence(r.totalPence)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
