import express from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create User
app.post("/user", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await prisma.user.create({
      data: { username, password },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Create Profile
app.post("/profile", async (req, res) => {
  try {
    const { email, name, address, phone, userId } = req.body;
    const data = await prisma.profile.create({
      data: { email, name, address, phone, userId },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create profile" });
  }
});

// Update User
app.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const data = await prisma.user.update({
      where: { id: Number(id) },
      data: { username, password },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete User
app.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Create Category
app.post("/category", async (req, res) => {
  try {
    const { name } = req.body;

    const data = await prisma.category.create({
      data: { name },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Create Post and Assign Category
app.post("/post", async (req, res) => {
  try {
    const { title, content, published, authorId, categoryId, assignedBy } = req.body;

    const data = await prisma.$transaction(async (prisma) => {
      const post = await prisma.post.create({
        data: { title, content, published, authorId },
      });

      await prisma.categoriesOnPosts.create({
        data: {
          postId: post.id,
          categoryId,
          assignedBy,
        },
      });

      return post;
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create post and assign category" });
  }
});

// Get All Users
app.get("/users", async (req, res) => {
  try {
    const data = await prisma.user.findMany();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get Single Profile
app.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get Post By ID
app.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        CategoriesOnPosts: {
          include: {
            category: true,
          },
        },
      },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
