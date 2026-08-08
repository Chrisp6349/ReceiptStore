import { Router } from "express";
import { db } from "../db.js";
import { requireTillAuth } from "../middleware/tillAuth.js";

export const barcodeRouter = Router();
barcodeRouter.use(requireTillAuth);

barcodeRouter.post("/validate", (req, res) => {
  const { receiptstoreId } = req.body || {};
  if (!receiptstoreId) {
    return res.status(400).json({ error: "receiptstoreId is required" });
  }

  const row = db
    .prepare(
      `SELECT users.name FROM customers JOIN users ON users.id = customers.user_id
       WHERE customers.receiptstore_id = ?`
    )
    .get(receiptstoreId.toUpperCase());

  if (!row) {
    return res.status(404).json({ recognised: false });
  }

  res.json({ recognised: true, name: row.name });
});
