import { useState } from "react";
import { Catalogue } from "./components/Catalogue.jsx";
import { Cart, calculateCartTotals } from "./components/Cart.jsx";
import { CustomerPanel } from "./components/CustomerPanel.jsx";
import { Confirmation } from "./components/Confirmation.jsx";
import { RETAILER_NAME } from "./catalogue.js";
import { api } from "./api.js";

export function App() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [sale, setSale] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const addItem = (product) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.sku === product.sku);
      if (existing) {
        return prev.map((line) => (line.sku === product.sku ? { ...line, qty: line.qty + 1 } : line));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (sku) => {
    setCart((prev) => prev.filter((line) => line.sku !== sku));
  };

  const completeSale = async () => {
    setError("");
    setCompleting(true);
    try {
      const { ok, data } = await api.completeSale({
        receiptstoreId: customer.receiptstoreId,
        retailerName: RETAILER_NAME,
        items: cart.map(({ sku, name, qty, unitPricePence }) => ({ sku, name, qty, unitPricePence })),
      });
      if (!ok) throw new Error(data.error || "Sale failed");
      const { totalPence } = calculateCartTotals(cart);
      setSale({ totalPence, customerName: customer.name });
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const resetForNextSale = () => {
    setCart([]);
    setCustomer(null);
    setSale(null);
    setError("");
  };

  const canCompleteSale = Boolean(customer) && cart.length > 0 && !completing;

  return (
    <div className="till-shell">
      <header className="till-header">
        <div>
          <p className="till-brand">ReceiptStore</p>
          <h1>Demo Till</h1>
        </div>
        <p className="till-retailer">{RETAILER_NAME}</p>
      </header>

      <div className="till-columns">
        <div className="till-column">
          <h2>Products</h2>
          <Catalogue onAdd={addItem} />
        </div>

        <div className="till-column">
          <CustomerPanel
            customer={customer}
            onRecognised={setCustomer}
            onCleared={() => setCustomer(null)}
          />
          <Cart cart={cart} onRemove={removeItem} />

          {error && <p className="form-error">{error}</p>}

          <button type="button" className="complete-sale-button" disabled={!canCompleteSale} onClick={completeSale}>
            {completing ? "Completing…" : "COMPLETE SALE"}
          </button>
          {!customer && <p className="hint">Recognise a customer before completing a sale.</p>}
        </div>
      </div>

      {sale && <Confirmation sale={sale} onDone={resetForNextSale} />}
    </div>
  );
}
