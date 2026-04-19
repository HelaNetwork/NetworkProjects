const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/paystream.db");

function addStreamsTable() {
  const db = new Database(DB_PATH);

  console.log("\n📊 Adding streams table to database...\n");

  try {
    // Create streams table
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
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES users(id),
        FOREIGN KEY (employee_id) REFERENCES users(id)
      )
    `);

    console.log("✅ Streams table created successfully");

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_streams_hr ON streams(hr_id);
      CREATE INDEX IF NOT EXISTS idx_streams_employee ON streams(employee_id);
      CREATE INDEX IF NOT EXISTS idx_streams_active ON streams(active);
      CREATE INDEX IF NOT EXISTS idx_streams_stream_id ON streams(stream_id);
    `);

    console.log("✅ Indexes created");

    // Show table structure
    const tableInfo = db.prepare("PRAGMA table_info(streams)").all();
    console.log("\n📋 Streams table structure:");
    tableInfo.forEach(col => {
      console.log(`   ${col.name} (${col.type})`);
    });

    console.log("\n✨ Database migration complete!\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  addStreamsTable();
}

module.exports = { addStreamsTable };
