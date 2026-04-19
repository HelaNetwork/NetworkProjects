const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../../data/paystream.db");

function initDatabase() {
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // ── Users table (HR and Employees) ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('hr', 'employee')),
      wallet_address TEXT,
      company TEXT DEFAULT 'PayStream Corp',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Streams table (FIXED: Added paused column) ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS streams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stream_id TEXT NOT NULL UNIQUE,
      hr_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      withdrawn_amount REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      paused INTEGER DEFAULT 0,
      tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hr_id) REFERENCES users(id),
      FOREIGN KEY (employee_id) REFERENCES users(id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_streams_hr ON streams(hr_id);
    CREATE INDEX IF NOT EXISTS idx_streams_employee ON streams(employee_id);
    CREATE INDEX IF NOT EXISTS idx_streams_active ON streams(active);
    CREATE INDEX IF NOT EXISTS idx_streams_stream_id ON streams(stream_id);
  `);

  console.log("✅ Database initialized at", DB_PATH);

  // Seed default HR admin if none exists
  const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'hr' LIMIT 1").get();
  if (!existingAdmin) {
    const adminHash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, role, wallet_address)
      VALUES (?, ?, ?, ?, ?)
    `).run("admin@paystream.io", adminHash, "HR Admin", "hr", null);
    console.log("🔑 Default HR admin created: admin@paystream.io / admin123");
  }

  // Seed pre-defined employees if they don't exist
  const employees = [
    {
      email: "john.doe@paystream.io",
      password: "employee123",
      name: "John Doe",
      wallet: "0x3b40a274DE74cCe246947f756E29019894bb3c9c"
    },
    {
      email: "jane.smith@paystream.io",
      password: "employee123",
      name: "Jane Smith",
      wallet: "0x2345678901234567890123456789012345678901"
    },
    {
      email: "bob.wilson@paystream.io",
      password: "employee123",
      name: "Bob Wilson",
      wallet: "0x3456789012345678901234567890123456789012"
    },
    {
      email: "alice.brown@paystream.io",
      password: "employee123",
      name: "Alice Brown",
      wallet: "0x4567890123456789012345678901234567890123"
    },
    {
      email: "charlie.davis@paystream.io",
      password: "employee123",
      name: "Charlie Davis",
      wallet: "0x5678901234567890123456789012345678901234"
    }
  ];

  employees.forEach(emp => {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(emp.email);
    if (!existing) {
      const hash = bcrypt.hashSync(emp.password, 10);
      db.prepare(`
        INSERT INTO users (email, password_hash, name, role, wallet_address)
        VALUES (?, ?, ?, ?, ?)
      `).run(emp.email, hash, emp.name, "employee", emp.wallet);
      console.log(`👤 Employee created: ${emp.email} / ${emp.password}`);
    }
  });

  db.close();
  return true;
}

// Run directly
if (require.main === module) {
  initDatabase();
  process.exit(0);
}

module.exports = { initDatabase, DB_PATH };
