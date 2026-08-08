import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { generateReceiptStoreId } from "../utils/ids.js";

export const authRouter = Router();

function signToken(customer) {
  return jwt.sign(
    { userId: customer.user_id, customerId: customer.id, receiptstoreId: customer.receiptstore_id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function customerWithUser(customerId) {
  return db
    .prepare(
      `SELECT customers.id, customers.receiptstore_id, customers.created_at,
              users.id AS user_id, users.name, users.email
       FROM customers JOIN users ON users.id = customers.user_id
       WHERE customers.id = ?`
    )
    .get(customerId);
}

authRouter.post("/register", (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password and name are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)");
  const insertCustomer = db.prepare("INSERT INTO customers (user_id, receiptstore_id) VALUES (?, ?)");

  const result = db.transaction(() => {
    const userResult = insertUser.run(email.toLowerCase(), passwordHash, name);

    // Collisions are astronomically unlikely at 33^8 possibilities, but a
    // demo shouldn't ever hard-fail account creation over one — retry.
    let receiptstoreId;
    for (let attempt = 0; attempt < 5; attempt++) {
      receiptstoreId = generateReceiptStoreId();
      const clash = db.prepare("SELECT id FROM customers WHERE receiptstore_id = ?").get(receiptstoreId);
      if (!clash) break;
    }

    const customerResult = insertCustomer.run(userResult.lastInsertRowid, receiptstoreId);
    return customerResult.lastInsertRowid;
  })();

  const customer = customerWithUser(result);
  const token = signToken(customer);
  res.status(201).json({ token, customer });
});

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const customerRow = db.prepare("SELECT id FROM customers WHERE user_id = ?").get(user.id);
  const customer = customerWithUser(customerRow.id);
  const token = signToken(customer);
  res.json({ token, customer });
});
