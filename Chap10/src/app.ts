import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { prisma } from "./db.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
const app = express();
app.use(express.json());
app.use(userRouter);
app.use(postRouter);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
export default app;