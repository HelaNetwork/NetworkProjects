import express from "express";
import { runAgent } from "../aiAgent.js";
import { saveOutputToFile } from "../outputService.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const input = req.body.input || "";
    const result = await runAgent(input);
    const outputPath = await saveOutputToFile(result);

    res.json({
      success: true,
      outputPath,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Agent execution failed",
      error: error.message,
    });
  }
});

export default router;
