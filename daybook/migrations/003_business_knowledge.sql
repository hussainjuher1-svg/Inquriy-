CREATE TABLE IF NOT EXISTS business_knowledge (
 id INTEGER PRIMARY KEY,
 business_id INTEGER NOT NULL REFERENCES businesses(id),
 title TEXT NOT NULL,
 content TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_knowledge_business ON business_knowledge(business_id);
