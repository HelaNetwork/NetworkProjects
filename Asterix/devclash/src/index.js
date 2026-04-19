import express from "express";
import agentRouter from "./routes/agentRoutes.js";

const app = express();
app.use(express.json());
app.use("/agent", agentRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ai-agent-backend" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AI Agent backend listening on http://localhost:${port}`);
});
