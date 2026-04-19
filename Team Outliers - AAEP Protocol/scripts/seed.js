// scripts/seed.js — Populate demo data for presentation
require("dotenv").config();
const { registerUser, bookGas, confirmDelivery } = require("../backend/agents/bookingAgent");

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  // Register users
  const users = [
    { name: "Ramesh Kumar", aadhaarNumber: "1111-2222-3333", walletAddress: "0xUser1Demo000000000000000000000000000001", phone: "+91 98765 43210", lat: "18.5204", lon: "73.8567", pincode: "411001" },
    { name: "Priya Sharma", aadhaarNumber: "4444-5555-6666", walletAddress: "0xUser2Demo000000000000000000000000000002", phone: "+91 87654 32109", lat: "18.6298", lon: "73.7997", pincode: "411045" },
    { name: "Mohammed Khan",aadhaarNumber: "7777-8888-9999", walletAddress: "0xUser3Demo000000000000000000000000000003", phone: "+91 76543 21098", lat: "18.4655", lon: "73.8710", pincode: "411028" },
  ];

  for (const u of users) {
    const r = await registerUser(u);
    console.log(`✅ Registered ${u.name} — SBT tx: ${r.txHash?.slice(0,20)}...`);
  }

  // Make bookings with different risk profiles
  const bookings = [
    { walletAddress: users[0].walletAddress, deviceId: "DEVICE-ABC123", deliveryLat: 18.5204, deliveryLon: 73.8567 },
    // Sybil-ish: same device different wallet (YELLOW/RED)
    { walletAddress: users[1].walletAddress, deviceId: "DEVICE-SUSPECT", deliveryLat: 18.6298, deliveryLon: 73.7997, historicalBookingIntervals: [15, 15, 16, 15] },
    { walletAddress: users[2].walletAddress, deviceId: "DEVICE-ABC123",  deliveryLat: 18.4655, deliveryLon: 73.8710 },
  ];

  const bookingIds = [];
  for (const b of bookings) {
    const r = await bookGas(b);
    console.log(`📦 Booked for ${b.walletAddress.slice(0,12)}... — Score: ${r.fraudScore} Tier: ${r.riskLabel}`);
    bookingIds.push({ id: r.bookingId, tier: r.riskTier, label: r.riskLabel });
  }

  // Confirm first delivery (GREEN — OTP)
  if (bookingIds[0]?.tier === 0) {
    const r = await confirmDelivery({ bookingId: bookingIds[0].id, proofType: "OTP", proofData: "123456", agentAddress: "0xAgentDemo", agentLat: 18.5204, agentLon: 73.8567 });
    console.log(`🚚 Delivered ${bookingIds[0].id} — Tx: ${r.releaseTxHash?.slice(0,20)}...`);
  }

  console.log("\n✅ Demo data seeded!");
  console.log("🌐 Start server: npm start");
  console.log("🖥️  Open: http://localhost:3001");
}

seed().catch(console.error);
