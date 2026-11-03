import { Router, Request, Response } from "express";
const router = Router();
// --- In-memory data (the problem we will solve) ---
interface User {
    id: number;
    username: string;
    email: string;
}
interface Post {
    id: number;
    title: string;
    content: string;
    published: boolean;
    authorId: number;
}
const users: User[] = [
    { id: 1, username: "jon", email: "jon@example.com" },
    { id: 2, username: "dave", email: "dave@example.com" },
    { id: 3, username: "lin", email: "lin@example.com" },
];
const posts: Post[] = [
    {
        id: 1, title: "First Post", content: "Hello world",
        published: true, authorId: 1
    },
    {
        id: 2, title: "Draft Post", content: "Work in progress",
        published: false, authorId: 1
    },
    {
        id: 3, title: "Another Post", content: "Some content here",
        published: true, authorId: 2
    },
];
router.get("/api/v1/users", (req: Request, res: Response) => {
    res.status(200).json(users);
});
router.get("/api/v1/users/:id", (req: Request, res: Response) => {
    const user = users.find((usr) => usr.id === Number(req.params.id));
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.status(200).json(user);
});
router.post("/api/v1/users", (req: Request, res: Response) => {
    const maxId = Math.max(...users.map((usr) => usr.id));
    const newUser: User = { id: maxId + 1, ...req.body };
    users.push(newUser);
    res.status(201).json(newUser);
});
// --- Post routes ---
router.get("/api/v1/posts", (req: Request, res: Response) => {
    res.status(200).json(posts);
});
router.get("/api/v1/posts/:id", (req: Request, res: Response) => {
    const post = posts.find((p) => p.id === Number(req.params.id));
    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }
    // manually attach the author
    const author = users.find((usr) => usr.id === post.authorId);
    res.status(200).json({ ...post, author });
});
export default router;