import { Router } from "express";
import { db } from "../db.js";
import { requireCustomerAuth } from "../middleware/auth.js";

export const receiptsRouter = Router();
receiptsRouter.use(requireCustomerAuth);

const SORT_COLUMNS = {
  date_desc: "transactions.created_at DESC",
  date_asc: "transactions.created_at ASC",
  amount_desc: "transactions.total_pence DESC",
  amount_asc: "transactions.total_pence ASC",
};

receiptsRouter.get("/", (req, res) => {
  const { q, retailer, sort } = req.query;
  const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.date_desc;

  const clauses = ["transactions.customer_id = ?"];
  const params = [req.customer.customerId];

  if (retailer) {
    clauses.push("retailers.name = ?");
    params.push(retailer);
  }

  if (q) {
    clauses.push(
      `(retailers.name LIKE ? OR EXISTS (
         SELECT 1 FROM receipt_items
         WHERE receipt_items.transaction_id = transactions.id AND receipt_items.name LIKE ?
       ))`
    );
    params.push(`%${q}%`, `%${q}%`);
  }

  const rows = db
    .prepare(
      `SELECT transactions.id, transactions.subtotal_pence, transactions.vat_pence,
              transactions.total_pence, transactions.status, transactions.created_at,
              retailers.name AS retailer_name,
              (SELECT COUNT(*) FROM receipt_items WHERE receipt_items.transaction_id = transactions.id) AS item_count
       FROM transactions JOIN retailers ON retailers.id = transactions.retailer_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY ${orderBy}`
    )
    .all(...params);

  res.json({
    receipts: rows.map((row) => ({
      id: row.id,
      retailerName: row.retailer_name,
      itemCount: row.item_count,
      subtotalPence: row.subtotal_pence,
      vatPence: row.vat_pence,
      totalPence: row.total_pence,
      status: row.status,
      createdAt: row.created_at,
    })),
  });
});

receiptsRouter.get("/:id", (req, res) => {
  const transaction = db
    .prepare(
      `SELECT transactions.*, retailers.name AS retailer_name
       FROM transactions JOIN retailers ON retailers.id = transactions.retailer_id
       WHERE transactions.id = ?`
    )
    .get(req.params.id);

  // Return 404 (not 403) for another customer's receipt so the endpoint
  // doesn't confirm which receipt IDs exist to someone probing it.
  if (!transaction || transaction.customer_id !== req.customer.customerId) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  const items = db
    .prepare(
      `SELECT sku, name, qty, unit_price_pence, line_total_pence
       FROM receipt_items WHERE transaction_id = ? ORDER BY id ASC`
    )
    .all(transaction.id);

  res.json({
    id: transaction.id,
    retailerName: transaction.retailer_name,
    status: transaction.status,
    createdAt: transaction.created_at,
    subtotalPence: transaction.subtotal_pence,
    vatPence: transaction.vat_pence,
    totalPence: transaction.total_pence,
    items: items.map((item) => ({
      sku: item.sku,
      name: item.name,
      qty: item.qty,
      unitPricePence: item.unit_price_pence,
      lineTotalPence: item.line_total_pence,
    })),
  });
});
