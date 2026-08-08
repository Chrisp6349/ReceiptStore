import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { StubButton } from "../components/StubButton.jsx";
import { formatPence, formatDateTime } from "../format.js";

export function ReceiptDetail() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.receipt(id).then(setReceipt).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="screen">
        <p className="form-error">{error}</p>
        <Link to="/receipts">← Back to receipts</Link>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <Link to="/receipts" className="back-link">← Back</Link>

      <header className="page-header">
        <h1>{receipt.retailerName}</h1>
        <p className="muted">{formatDateTime(receipt.createdAt)}</p>
      </header>

      <div className="items-table">
        {receipt.items.map((item) => (
          <div className="items-row" key={item.sku}>
            <div>
              <p className="item-name">{item.name}</p>
              <p className="item-meta">{item.qty} × {formatPence(item.unitPricePence)}</p>
            </div>
            <p className="item-total">{formatPence(item.lineTotalPence)}</p>
          </div>
        ))}
      </div>

      <div className="totals-block">
        <div className="totals-row">
          <span>Subtotal</span>
          <span>{formatPence(receipt.subtotalPence)}</span>
        </div>
        <div className="totals-row">
          <span>VAT (20%)</span>
          <span>{formatPence(receipt.vatPence)}</span>
        </div>
        <div className="totals-row totals-row-final">
          <span>Total</span>
          <span>{formatPence(receipt.totalPence)}</span>
        </div>
      </div>

      <div className="stub-row">
        <StubButton>Export</StubButton>
        <StubButton>Share</StubButton>
        <StubButton>Warranty</StubButton>
        <StubButton>Return</StubButton>
      </div>
    </div>
  );
}
