import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Barcode } from "../components/Barcode.jsx";
import { StubButton } from "../components/StubButton.jsx";
import { api } from "../api.js";

export function Card() {
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.card().then(setCard).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="screen">
      <header className="page-header">
        <h1>My ReceiptStore Card</h1>
      </header>

      {error && <p className="form-error">{error}</p>}

      {card && (
        <>
          <div className="rs-card">
            <p className="rs-card-brand">ReceiptStore</p>
            <p className="rs-card-name">{card.name}</p>
            <p className="rs-card-id">{card.receiptstoreId}</p>
            <div className="rs-card-barcode">
              <Barcode value={card.receiptstoreId} />
            </div>
          </div>

          <div className="qr-card">
            <p className="muted">Or let the till scan this QR code</p>
            <div className="qr-wrap">
              <QRCode value={card.receiptstoreId} size={160} />
            </div>
          </div>

          <p className="hint">Show this card's barcode or QR code at the till to be recognised automatically.</p>

          <StubButton>Add to Apple Wallet</StubButton>
        </>
      )}
    </div>
  );
}
