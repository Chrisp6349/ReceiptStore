import { customAlphabet } from "nanoid";

// Unambiguous uppercase alphanumeric alphabet (no 0/O or 1/I) so IDs are
// easy to read off a card or type in manually at the till.
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(alphabet, 8);

export function generateReceiptStoreId() {
  return `RS-${generate()}`;
}
