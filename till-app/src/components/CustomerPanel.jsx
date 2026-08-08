import { useState } from "react";
import { api } from "../api.js";

export function CustomerPanel({ customer, onRecognised, onCleared }) {
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const lookUp = async (value) => {
    const id = value.trim();
    if (!id) return;
    setError("");
    setScanning(true);
    try {
      // A brief pause stands in for the moment a real barcode scanner
      // would take to read the card — there's no camera in Prototype 001.
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { data } = await api.validateBarcode(id);
      if (data.recognised) {
        onRecognised({ receiptstoreId: id.toUpperCase(), name: data.name });
      } else {
        setError("Not recognised. Check the ReceiptStore ID and try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  if (customer) {
    return (
      <div className="customer-panel recognised">
        <p className="recognised-badge">CUSTOMER RECOGNISED ✓</p>
        <p className="recognised-name">{customer.name}</p>
        <p className="recognised-id">{customer.receiptstoreId}</p>
        <button type="button" className="link-button" onClick={onCleared}>
          Not {customer.name}? Clear
        </button>
      </div>
    );
  }

  return (
    <div className="customer-panel">
      <label htmlFor="rsid" className="panel-label">Customer ReceiptStore ID</label>
      <input
        id="rsid"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="RS-XXXXXXXX"
        disabled={scanning}
      />
      <div className="panel-buttons">
        <button type="button" className="secondary-button" onClick={() => lookUp(input)} disabled={scanning || !input.trim()}>
          Look Up
        </button>
        <button type="button" className="primary-button" onClick={() => lookUp(input)} disabled={scanning || !input.trim()}>
          {scanning ? "Scanning…" : "Simulate Scan"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
