import { Router } from "express";
import { db } from "../db.js";
import { requireCustomerAuth } from "../middleware/auth.js";

export const customerRouter = Router();
customerRouter.use(requireCustomerAuth);

customerRouter.get("/me", (req, res) => {
  const row = db
    .prepare(
      `SELECT users.name, users.email, customers.receiptstore_id, customers.created_at
       FROM customers JOIN users ON users.id = customers.user_id
       WHERE customers.id = ?`
    )
    .get(req.customer.customerId);

  const monthSpend = db
    .prepare(
      `SELECT COALESCE(SUM(total_pence), 0) AS total_pence, COUNT(*) AS receipt_count
       FROM transactions
       WHERE customer_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    )
    .get(req.customer.customerId);

  res.json({
    name: row.name,
    email: row.email,
    receiptstoreId: row.receiptstore_id,
    memberSince: row.created_at,
    monthSpendPence: monthSpend.total_pence,
    monthReceiptCount: monthSpend.receipt_count,
  });
});

customerRouter.get("/card", (req, res) => {
  const row = db
    .prepare(
      `SELECT users.name, customers.receiptstore_id
       FROM customers JOIN users ON users.id = customers.user_id
       WHERE customers.id = ?`
    )
    .get(req.customer.customerId);

  res.json({ name: row.name, receiptstoreId: row.receiptstore_id });
});
