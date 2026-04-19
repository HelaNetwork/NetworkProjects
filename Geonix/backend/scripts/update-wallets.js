const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/paystream.db");

// ⭐ UPDATE THESE WITH YOUR ACTUAL METAMASK ADDRESSES ⭐
const EMPLOYEE_WALLETS = {
  "john.doe@paystream.io": "0xYourEmployeeWallet1Address",
  "jane.smith@paystream.io": "0xYourEmployeeWallet2Address", 
  "bob.wilson@paystream.io": "0xYourEmployeeWallet3Address",
  "alice.brown@paystream.io": "0xYourEmployeeWallet4Address",
  "charlie.davis@paystream.io": "0xYourEmployeeWallet5Address"
};

function updateWallets() {
  const db = new Database(DB_PATH);
  
  console.log("\n🔐 Updating employee wallet addresses...\n");

  for (const [email, wallet] of Object.entries(EMPLOYEE_WALLETS)) {
    try {
      // Validate wallet address format
      if (!wallet.startsWith("0x") || wallet.length !== 42) {
        console.log(`❌ Invalid wallet for ${email}: ${wallet}`);
        continue;
      }

      const result = db.prepare(`
        UPDATE users 
        SET wallet_address = ? 
        WHERE email = ? AND role = 'employee'
      `).run(wallet, email);

      if (result.changes > 0) {
        console.log(`✅ Updated ${email}`);
        console.log(`   Wallet: ${wallet}\n`);
      } else {
        console.log(`⚠️  No employee found with email: ${email}\n`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${email}:`, error.message);
    }
  }

  // Show all employees with their wallets
  console.log("\n📋 Current Employee Wallets:\n");
  const employees = db.prepare(`
    SELECT name, email, wallet_address 
    FROM users 
    WHERE role = 'employee'
    ORDER BY name
  `).all();

  employees.forEach(emp => {
    const status = emp.wallet_address ? '✅' : '❌';
    console.log(`${status} ${emp.name}`);
    console.log(`   Email: ${emp.email}`);
    console.log(`   Wallet: ${emp.wallet_address || 'NOT SET'}\n`);
  });

  db.close();
  console.log("✨ Done!\n");
}

// Run the update
updateWallets();
