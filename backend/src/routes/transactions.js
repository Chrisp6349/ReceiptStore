import { Router } from "express";
import { db } from "../db.js";
import { requireTillAuth } from "../middleware/tillAuth.js";
import { calculateTotals } from "../utils/vat.js";

export const transactionsRouter = Router();
transactionsRouter.use(requireTillAuth);

function getOrCreateRetailer(name) {
  const existing = db.prepare("SELECT id FROM retailers WHERE name = ?").get(name);
  if (existing) return existing.id;
  const result = db.prepare("INSERT INTO retailers (name) VALUES (?)").run(name);
  return result.lastInsertRowid;
}

transactionsRouter.post("/", (req, res) => {
  const { receiptstoreId, retailerName, items } = req.body || {};

  if (!receiptstoreId || !retailerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "receiptstoreId, retailerName and a non-empty items array are required" });
  }

  for (const item of items) {
    if (!item.sku || !item.name || !Number.isInteger(item.qty) || item.qty <= 0 || !Number.isInteger(item.unitPricePence) || item.unitPricePence < 0) {
      return res.status(400).json({ error: "Each item needs sku, name, a positive integer qty and a non-negative integer unitPricePence" });
    }
  }

  const customer = db
    .prepare("SELECT id FROM customers WHERE receiptstore_id = ?")
    .get(receiptstoreId.toUpperCase());
  if (!customer) {
    return res.status(404).json({ error: "No customer found for that ReceiptStore ID" });
  }

  const { subtotalPence, vatPence, totalPence } = calculateTotals(items);

  const insertTransaction = db.prepare(
    `INSERT INTO transactions (customer_id, retailer_id, subtotal_pence, vat_pence, total_pence)
     VALUES (?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO receipt_items (transaction_id, sku, name, qty, unit_price_pence, line_total_pence)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const transactionId = db.transaction(() => {
    const retailerId = getOrCreateRetailer(retailerName);
    const result = insertTransaction.run(customer.id, retailerId, subtotalPence, vatPence, totalPence);
    for (const item of items) {
      insertItem.run(
        result.lastInsertRowid,
        item.sku,
        item.name,
        item.qty,
        item.unitPricePence,
        item.qty * item.unitPricePence
      );
    }
    return result.lastInsertRowid;
  })();

  res.status(201).json({
    id: transactionId,
    retailerName,
    subtotalPence,
    vatPence,
    totalPence,
    items,
  });
});
