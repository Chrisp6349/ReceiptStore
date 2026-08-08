import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "..", "receiptstore.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

// Seed a single demo retailer for Prototype 001 — the Demo Till always
// sells as this retailer since there's no real EPOS/retailer integration.
const seedRetailer = db.prepare("INSERT OR IGNORE INTO retailers (id, name) VALUES (1, 'Demo Mart')");
seedRetailer.run();
