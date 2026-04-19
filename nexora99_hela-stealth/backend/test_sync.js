const http = require("http");

const data = JSON.stringify({
    invoiceId: "0xTEST_INTERNAL_456",
    description: "Manual Test Sync",
    amount: "10.0",
    merchantAddress: "0x73f48a8f773737b67eb4635848e00123"
});

const options = {
    hostname: "localhost",
    port: 4000,
    path: "/invoice/save-metadata",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
    }
};

const req = http.request(options, (res) => {
    console.log("Status Code:", res.statusCode);
    res.on("data", (d) => {
        process.stdout.write(d);
    });
});

req.on("error", (error) => {
    console.error("Error:", error);
});

req.write(data);
req.end();
