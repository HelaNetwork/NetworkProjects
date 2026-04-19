const sqlite3 = require('better-sqlite3');
const path = require('path');

// Database migration to add pause/resume support
function migrateDatabaseForPause() {
  const dbPath = process.env.DATABASE_URL || './data/paystream.db';
  const db = sqlite3(dbPath);

  console.log('🔄 Starting database migration for pause/resume feature...');

  try {
    // Check if paused column already exists
    const columns = db.prepare(`PRAGMA table_info(streams)`).all();
    const hasPausedColumn = columns.some(col => col.name === 'paused');

    if (hasPausedColumn) {
      console.log('✅ Database already has pause/resume support');
      db.close();
      return;
    }

    // Add paused column
    console.log('📝 Adding paused column to streams table...');
    db.prepare(`
      ALTER TABLE streams 
      ADD COLUMN paused INTEGER DEFAULT 0
    `).run();

    console.log('✅ Migration completed successfully!');
    console.log('   - Added paused column (0 = not paused, 1 = paused)');

    db.close();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    db.close();
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  migrateDatabaseForPause();
}

module.exports = { migrateDatabaseForPause };
