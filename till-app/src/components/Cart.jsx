import { formatPence } from "../format.js";

const VAT_RATE = 0.2;

export function calculateCartTotals(cart) {
  const subtotalPence = cart.reduce((sum, line) => sum + line.qty * line.unitPricePence, 0);
  const vatPence = Math.round(subtotalPence * VAT_RATE);
  const totalPence = subtotalPence + vatPence;
  return { subtotalPence, vatPence, totalPence };
}

export function Cart({ cart, onRemove }) {
  const { subtotalPence, vatPence, totalPence } = calculateCartTotals(cart);

  return (
    <div className="cart">
      <h2>Basket</h2>
      {cart.length === 0 && <p className="muted">No items yet — tap a product to add it.</p>}
      <div className="cart-lines">
        {cart.map((line) => (
          <div className="cart-line" key={line.sku}>
            <div>
              <p className="cart-line-name">{line.name}</p>
              <p className="cart-line-meta">{line.qty} × {formatPence(line.unitPricePence)}</p>
            </div>
            <div className="cart-line-right">
              <span>{formatPence(line.qty * line.unitPricePence)}</span>
              <button type="button" className="remove-button" onClick={() => onRemove(line.sku)} aria-label={`Remove ${line.name}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-totals">
        <div className="cart-totals-row">
          <span>Subtotal</span>
          <span>{formatPence(subtotalPence)}</span>
        </div>
        <div className="cart-totals-row">
          <span>VAT (20%)</span>
          <span>{formatPence(vatPence)}</span>
        </div>
        <div className="cart-totals-row cart-totals-final">
          <span>Total</span>
          <span>{formatPence(totalPence)}</span>
        </div>
      </div>
    </div>
  );
}
