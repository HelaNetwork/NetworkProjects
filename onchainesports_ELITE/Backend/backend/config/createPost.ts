import dotenv from "dotenv";
import multer from "multer";
import { uploadFile } from "../src/config/imageKit.config";
import cors from "cors";
import express from 'express'


const app = express();
app.use(express.json());
dotenv.config();
app.use(cors())

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/create-post", upload.single("image"), async (req: any, res: any) => {
    const data = req.body;
    const fileBuffer = req.file.buffer;
    const uploadResult = await uploadFile(fileBuffer);
    data.image = uploadResult.url;

});