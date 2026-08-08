import { CATALOGUE } from "../catalogue.js";
import { formatPence } from "../format.js";

export function Catalogue({ onAdd }) {
  return (
    <div className="catalogue">
      {CATALOGUE.map((product) => (
        <button key={product.sku} type="button" className="catalogue-item" onClick={() => onAdd(product)}>
          <span className="catalogue-name">{product.name}</span>
          <span className="catalogue-price">{formatPence(product.unitPricePence)}</span>
        </button>
      ))}
    </div>
  );
}
