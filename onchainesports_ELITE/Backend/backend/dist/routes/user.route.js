import { Router } from "express";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.config.js";
// import { upload, uploadFile } from "../imageKit.config.js";
const userRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "hello world";
function normalizeSignature(input) {
    if (!input)
        return null;
    if (Array.isArray(input))
        return new Uint8Array(input);
    if (typeof input === "string") {
        try {
            return new Uint8Array(Buffer.from(input, "base64"));
        }
        catch {
            return null;
        }
    }
    if (typeof input === "object") {
        const obj = input;
        if (Array.isArray(obj.data)) {
            return new Uint8Array(obj.data);
        }
        const numericKeys = Object.keys(obj).filter((k) => /^\d+$/.test(k));
        if (numericKeys.length > 0) {
            const arr = numericKeys
                .sort((a, b) => Number(a) - Number(b))
                .map((k) => Number(obj[k]));
            return new Uint8Array(arr);
        }
    }
    return null;
}
function getUserIdFromAuthHeader(authHeader) {
    if (!authHeader?.startsWith("Bearer "))
        return null;
    const token = authHeader.split(" ")[1];
    if (!token)
        return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string")
            return null;
        return typeof decoded.userId === "string" ? decoded.userId : null;
    }
    catch {
        return null;
    }
}
function parseWalletAddress(value) {
    if (typeof value !== "string" || !value.trim())
        return null;
    try {
        const wallet = new PublicKey(value.trim());
        return wallet.toBase58();
    }
    catch {
        return null;
    }
}
userRouter.get("/by-wallet/:walletAddress", async (req, res) => {
    try {
        const walletAddress = parseWalletAddress(req.params.walletAddress);
        if (!walletAddress) {
            return res.status(400).json({ message: "Invalid walletAddress" });
        }
        const user = await prisma.user.findUnique({
            where: { walletAddress },
            select: {
                id: true,
                walletAddress: true,
                username: true,
                avatarUrl: true,
                country: true,
                bio: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.json({
                exists: false,
                message: "No user",
            });
        }
        return res.json({
            exists: true,
            user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to check wallet user" });
    }
});
userRouter.post("/signin", async (req, res) => {
    try {
        const { publicKey, signature } = req.body;
        if (!publicKey) {
            return res.status(400).json({ message: "Missing publicKey" });
        }
        const sigBytes = normalizeSignature(signature);
        if (!sigBytes || sigBytes.length !== 64) {
            return res.status(400).json({
                message: "Invalid signature format/size (expected 64 bytes)",
            });
        }
        const message = new TextEncoder().encode("Sign into mechanical turks");
        const isValid = nacl.sign.detached.verify(message, sigBytes, new PublicKey(publicKey).toBytes());
        if (!isValid) {
            return res.status(401).json({
                message: "Incorrect signature",
            });
        }
        const existingUser = await prisma.user.findFirst({
            where: { walletAddress: publicKey },
        });
        if (existingUser) {
            const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET);
            return res.json({ message: "existing", token });
        }
        const user = await prisma.user.create({
            data: { walletAddress: publicKey },
        });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        return res.json({ message: "non-existing", token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to sign in",
        });
    }
});
userRouter.put("/profile", async (req, res) => {
    try {
        const userId = getUserIdFromAuthHeader(req.headers.authorization);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { username, country } = req.body;
        const data = {};
        if (typeof username === "string")
            data.username = username;
        if (typeof country === "string")
            data.country = country;
        // if (req.file?.buffer) {
        //     const uploaded = await uploadFile(req.file.buffer, req.file.originalname);
        //     data.avatar = uploaded.url;
        // }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
        });
        return res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
});
userRouter.get("/profile", async (req, res) => {
    try {
        const userId = getUserIdFromAuthHeader(req.headers.authorization);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                walletAddress: true,
                username: true,
                avatarUrl: true,
                country: true,
                bio: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({
            message: "Profile fetched successfully",
            user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch profile" });
    }
});
export default userRouter;
//# sourceMappingURL=user.route.js.map