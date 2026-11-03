import express, { Request, Response, NextFunction } from "express";
import router from "./routes.js";
const app = express();
app.use(express.json());
app.use(router);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
export default app;