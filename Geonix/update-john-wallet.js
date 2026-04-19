const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "backend/data/paystream.db");

function updateJohnDoeWallet() {
  console.log("🔧 Updating John Doe's wallet address...");
  
  const db = new Database(DB_PATH);
  
  try {
    const newWallet = "0x4B8808Dd42Ea425A79A484337218A3C5BEAc00C5";
    const email = "john.doe@paystream.io";
    
    // Check if John Doe exists
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      console.error("❌ User john.doe@paystream.io not found in database!");
      console.log("\n💡 Available users:");
      const allUsers = db.prepare("SELECT id, email, name, wallet_address FROM users").all();
      allUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}): ${u.wallet_address || 'No wallet'}`);
      });
      db.close();
      return;
    }
    
    console.log(`\n📋 Current wallet: ${user.wallet_address}`);
    console.log(`📋 New wallet: ${newWallet}`);
    
    // Update the wallet address
    const result = db.prepare(`
      UPDATE users 
      SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `).run(newWallet, email);
    
    if (result.changes > 0) {
      console.log("\n✅ Successfully updated John Doe's wallet address!");
      
      // Verify the update
      const updated = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      console.log("\n📝 Verified new wallet:");
      console.log(`   Name: ${updated.name}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Wallet: ${updated.wallet_address}`);
      
      // Check if there are any streams for this user
      const streams = db.prepare(`
        SELECT stream_id, total_amount, active 
        FROM streams 
        WHERE employee_id = ?
      `).all(user.id);
      
      if (streams.length > 0) {
        console.log(`\n💰 Found ${streams.length} stream(s) for John Doe:`);
        streams.forEach(s => {
          console.log(`   - Stream #${s.stream_id}: ${s.total_amount} HLUSD (${s.active ? 'Active' : 'Ended'})`);
        });
        console.log("\n⚠️  Note: Existing streams still use the OLD wallet address from creation.");
        console.log("   New streams will use the updated wallet address.");
      } else {
        console.log("\n📭 No streams found for John Doe yet.");
      }
      
    } else {
      console.log("❌ No changes made - something went wrong!");
    }
    
  } catch (error) {
    console.error("❌ Error updating wallet:", error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run the update
if (require.main === module) {
  try {
    updateJohnDoeWallet();
    console.log("\n🎉 Update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n💥 Update failed:", error);
    process.exit(1);
  }
}

module.exports = { updateJohnDoeWallet };
