import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      displayValue: false,
      height: 70,
      margin: 0,
      background: "transparent",
      lineColor: "#12221c",
    });
  }, [value]);

  return <svg ref={svgRef} className="barcode-svg" role="img" aria-label={`Barcode for ${value}`} />;
}
