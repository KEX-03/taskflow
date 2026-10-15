const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const Task = require("../src/models/Task");

const DEMO_USER = {
  name: "Demo User",
  email: "demo@example.com",
  password: "Demo@Pass1234",
  bio: "Demo account for testing TaskFlow.",
};

const seed = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("❌  Refusing to seed database in production environment.");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌  MONGO_URI is not defined in server/.env");
    process.exit(1);
  }

  const isLocal = /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(uri);
  if (!isLocal && !process.argv.includes("--allow-remote")) {
    console.error("❌  MONGO_URI is not a local database. Run with --allow-remote if you really want to seed it.");
    process.exit(1);
  }

  try {
    console.log("⏳  Connecting to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("✅  Connected to MongoDB.");

    // Create or reset demo user
    let user = await User.findOne({ email: DEMO_USER.email });
    if (user) {
      user.name = DEMO_USER.name;
      user.password = DEMO_USER.password;
      user.bio = DEMO_USER.bio;
      await user.save();
      console.log(`🔄  Reset existing demo user: ${DEMO_USER.email}`);
    } else {
      user = await User.create(DEMO_USER);
      console.log(`✨  Created new demo user: ${DEMO_USER.email}`);
    }

    // Delete only this demo user's tasks
    const { deletedCount } = await Task.deleteMany({ owner: user._id });
    if (deletedCount > 0) {
      console.log(`🧹  Cleared ${deletedCount} previous demo task(s).`);
    }

    // Create 8 sample tasks with mixed statuses and priorities
    const sampleTasks = [
      {
        title: "Explore the TaskFlow dashboard",
        description: "Check your stats and recent activity on the dashboard.",
        status: "done",
        priority: "low",
        owner: user._id,
      },
      {
        title: "Review pending pull requests",
        description: "Review open PRs and test changes locally before merging.",
        status: "in-progress",
        priority: "high",
        owner: user._id,
      },
      {
        title: "Update API documentation",
        description: "Ensure all endpoints have clear request and response examples in docs/API.md.",
        status: "in-progress",
        priority: "medium",
        owner: user._id,
      },
      {
        title: "Add unit tests for helper functions",
        description: "Improve test coverage for query parsers and string utilities.",
        status: "todo",
        priority: "high",
        owner: user._id,
      },
      {
        title: "Optimize database indexes",
        description: "Review query patterns and verify compound index performance.",
        status: "todo",
        priority: "medium",
        owner: user._id,
      },
      {
        title: "Implement rate limiting middleware",
        description: "Protect sensitive endpoints from brute-force attempts.",
        status: "todo",
        priority: "low",
        owner: user._id,
      },
      {
        title: "Set up local environment variables",
        description: "Copy .env.example files to .env and configure MongoDB connection.",
        status: "done",
        priority: "medium",
        owner: user._id,
      },
      {
        title: "Design mobile-friendly navigation",
        description: "Verify that the sidebar collapsible state works well on smaller screens.",
        status: "done",
        priority: "low",
        owner: user._id,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log(`📋  Created ${sampleTasks.length} demo tasks.`);

    console.log("\n🌱  Database seeded successfully!");
    console.log(`👤  Email:    ${DEMO_USER.email}`);
    console.log(`🔑  Password: ${DEMO_USER.password}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌  Failed to seed database:", err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

seed();
