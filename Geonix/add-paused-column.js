const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "backend/data/paystream.db");

function addPausedColumn() {
  console.log("🔧 Adding 'paused' column to streams table...");
  
  const db = new Database(DB_PATH);
  
  try {
    // Check if column already exists
    const tableInfo = db.pragma("table_info(streams)");
    const hasPausedColumn = tableInfo.some(col => col.name === 'paused');
    
    if (hasPausedColumn) {
      console.log("✅ 'paused' column already exists!");
      db.close();
      return;
    }
    
    // Add the paused column with default value 0 (not paused)
    db.exec(`
      ALTER TABLE streams 
      ADD COLUMN paused INTEGER DEFAULT 0
    `);
    
    console.log("✅ Successfully added 'paused' column to streams table!");
    
    // Verify the column was added
    const updatedTableInfo = db.pragma("table_info(streams)");
    console.log("\n📋 Updated table structure:");
    updatedTableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
  } catch (error) {
    console.error("❌ Error adding column:", error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run the migration
if (require.main === module) {
  try {
    addPausedColumn();
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  }
}

module.exports = { addPausedColumn };
