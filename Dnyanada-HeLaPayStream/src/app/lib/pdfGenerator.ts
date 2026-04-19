import jsPDF from 'jspdf';

export const generatePayStub = (data: { account: string; balance: string; rate: string }) => {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("HeLa PayStream - Verified Pay-Stub", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Employee Wallet: ${data.account}`, 20, 40);
  doc.text(`Total Earnings Claimed: $${data.balance}`, 20, 50);
  doc.text(`Streaming Rate: $${data.rate}/sec`, 20, 60);
  doc.text(`Network: HeLa Mainnet (Verified via Smart Contract)`, 20, 70);
  
  doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 90);
  
  doc.save(`PayStream_Stub_${data.account.slice(0,6)}.pdf`);
};