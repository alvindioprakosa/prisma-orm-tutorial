import express from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper untuk async error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });
};

// ------------------- USER -------------------
app.post("/user", asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.create({ data: { username, password } });
  res.status(201).json(user);
}));

app.put("/user/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { username, password },
  });
  res.json(user);
}));

app.delete("/user/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.delete({ where: { id: Number(id) } });
  res.json(user);
}));

app.get("/users", asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
}));

// ------------------- PROFILE -------------------
app.post("/profile", asyncHandler(async (req, res) => {
  const { email, name, address, phone, userId } = req.body;
  const profile = await prisma.profile.create({
    data: { email, name, address, phone, userId },
  });
  res.status(201).json(profile);
}));

app.get("/profile/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await prisma.profile.findUnique({
    where: { id: Number(id) },
  });
  res.json(profile);
}));

// ------------------- CATEGORY -------------------
app.post("/category", asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
}));

// ------------------- POST -------------------
app.post("/post", asyncHandler(async (req, res) => {
  const { title, content, published, authorId, categoryId, assignedBy } = req.body;

  const post = await prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: { title, content, published, authorId },
    });

    await tx.categoriesOnPosts.create({
      data: {
        postId: newPost.id,
        categoryId,
        assignedBy,
      },
    });

    return newPost;
  });

  res.status(201).json(post);
}));

app.get("/post/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      CategoriesOnPosts: {
        include: { category: true },
      },
    },
  });

  res.json(post);
}));

// ------------------- SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
