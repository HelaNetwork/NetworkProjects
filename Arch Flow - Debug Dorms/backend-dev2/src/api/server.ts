import dotenv from "dotenv";
dotenv.config();
console.log("GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Repository Architecture Analyzer running on http://localhost:${PORT}`);
});

export default app;
