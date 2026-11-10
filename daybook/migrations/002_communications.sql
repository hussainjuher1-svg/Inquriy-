-- Records only what staff enter. These entries do not send messages.
CREATE TABLE IF NOT EXISTS communications (
  id INTEGER PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  customer_id INTEGER,
  inquiry_id INTEGER,
  user_id INTEGER NOT NULL REFERENCES users(id),
  direction TEXT NOT NULL CHECK(direction IN ('Incoming','Outgoing','Internal')),
  channel TEXT NOT NULL CHECK(channel IN ('Phone','Email','In person','SMS','Other')),
  occurred_at TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(customer_id IS NOT NULL OR inquiry_id IS NOT NULL),
  FOREIGN KEY(customer_id,business_id) REFERENCES customers(id,business_id),
  FOREIGN KEY(inquiry_id,business_id) REFERENCES inquiries(id,business_id)
);
CREATE INDEX IF NOT EXISTS idx_communications_customer ON communications(business_id,customer_id,occurred_at);
CREATE INDEX IF NOT EXISTS idx_communications_inquiry ON communications(business_id,inquiry_id,occurred_at);
