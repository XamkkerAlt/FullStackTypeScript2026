import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
const router = Router();
import { Prisma } from "../generated/prisma/client.js";
router.get("/api/v1/posts", async (req: Request, res: Response) => {
    const { search, published, category, page = "1", limit = "10" } = req.query;
    const where: Prisma.PostWhereInput = {};
    if (published !== undefined) {
        where.published = published === "true";
    }
    if (search) {
        where.OR = [
            { title: { contains: String(search), mode: "insensitive" } },
            { content: { contains: String(search), mode: "insensitive" } },
        ];
    }
    if (category) {
        where.categories = { some: { name: String(category) } };
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);
    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { id: true, username: true } },
            },
        }),
        prisma.post.count({ where }),
    ]);
    res.status(200).json({
        data: posts,
        meta: { total, page: pageNum, totalPages: Math.ceil(total / pageSize) },
    });
});

// GET single post by id (with full author)
router.get("/api/v1/posts/:id", async (req: Request, res: Response) => {
    const post = await prisma.post.findUnique({
        where: { id: Number(req.params.id) },
        include: {
            author: {
                select: { id: true, username: true, email: true },
            },
        },
    });
    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }
    res.status(200).json(post);
});
// GET posts by a specific user
router.get("/api/v1/users/:id/posts",
    async (req: Request, res: Response) => {
        const posts = await prisma.post.findMany({
            where: { authorId: Number(req.params.id) },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(posts);
    }
);
// POST create a new post for a user
router.post("/api/v1/posts", async (req: Request, res: Response) => {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
        data: {
            title,
            content,
            author: { connect: { id: authorId } },
        },
        include: {
            author: {
                select: { id: true, username: true },
            },
        },
    });
    res.status(201).json(post);
});
// PUT update a post
router.put("/api/v1/posts/:id", async (req: Request, res: Response) => {
    const { title, content, published } = req.body;
    const post = await prisma.post.update({
        where: { id: Number(req.params.id) },
        data: { title, content, published },
    });
    res.status(200).json(post);
});
// PATCH publish a post
router.patch("/api/v1/posts/:id/publish",
    async (req: Request, res: Response) => {
        const post = await prisma.post.update({
            where: { id: Number(req.params.id) },
            data: { published: true },
        });
        res.status(200).json(post);
    }
);
// PATCH increment views
router.patch("/api/v1/posts/:id/view",
    async (req: Request, res: Response) => {
        const post = await prisma.post.update({
            where: { id: Number(req.params.id) },
            data: {
                views: { increment: 1 },
            },
        });
        res.status(200).json(post);
    }
);
// DELETE a post
router.delete("/api/v1/posts/:id",
    async (req: Request, res: Response) => {
        await prisma.post.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(204).send();
    }
);
// PATCH add categories to a post
router.patch("/api/v1/posts/:id/categories/add",
    async (req: Request, res: Response) => {
        const { categoryNames } = req.body;
        const post = await prisma.post.update({
            where: { id: Number(req.params.id) },
            data: {
                categories: {
                    connectOrCreate: categoryNames.map((name: string) => ({
                        where: { name },
                        create: { name },
                    })),
                },
            },
            include: { categories: true },
        });
        res.status(200).json(post);
    }
);
// PATCH remove a category from a post
router.patch("/api/v1/posts/:id/categories/remove",
    async (req: Request, res: Response) => {
        const { categoryName } = req.body;
        const post = await prisma.post.update({
            where: { id: Number(req.params.id) },
            data: {
                categories: {
                    disconnect: { name: categoryName },
                },
            },
            include: { categories: true },
        });
        res.status(200).json(post);
    }
);
export default router;