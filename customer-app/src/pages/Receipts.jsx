import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { formatPence, formatDate } from "../format.js";

export function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [q, setQ] = useState("");
  const [retailer, setRetailer] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .receipts({ q, retailer, sort })
        .then((data) => setReceipts(data.receipts))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [q, retailer, sort]);

  const retailerOptions = [...new Set(receipts.map((r) => r.retailerName))];

  return (
    <div className="screen">
      <header className="page-header">
        <h1>Receipts</h1>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder="Search retailer or item…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search-input"
        />
        <div className="filter-row">
          <select value={retailer} onChange={(e) => setRetailer(e.target.value)}>
            <option value="">All retailers</option>
            {retailerOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && receipts.length === 0 && <p className="muted">No receipts match.</p>}

      <ul className="receipt-list">
        {receipts.map((r) => (
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
    </div>
  );
}
