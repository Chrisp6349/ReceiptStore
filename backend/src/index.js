import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import { authRouter } from "./routes/auth.js";
import { customerRouter } from "./routes/customer.js";
import { receiptsRouter } from "./routes/receipts.js";
import { transactionsRouter } from "./routes/transactions.js";
import { barcodeRouter } from "./routes/barcode.js";

const requiredEnv = ["JWT_SECRET", "TILL_API_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var ${key}. Copy backend/.env.example to backend/.env and set it.`);
    process.exit(1);
  }
}

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/customer", customerRouter);
app.use("/api/receipts", receiptsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/barcode", barcodeRouter);

// Kept deliberately generic — never echoes internals back to the client.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`ReceiptStore backend listening on http://localhost:${port}`);
});
