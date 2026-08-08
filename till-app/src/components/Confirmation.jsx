import { formatPence } from "../format.js";

export function Confirmation({ sale, onDone }) {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-card">
        <p className="confirmation-check">✓</p>
        <h2>Sale Complete</h2>
        <p className="muted">Receipt sent to {sale.customerName}'s ReceiptStore app</p>
        <p className="confirmation-total">{formatPence(sale.totalPence)}</p>
        <button type="button" className="primary-button" onClick={onDone}>
          New Sale
        </button>
      </div>
    </div>
  );
}
