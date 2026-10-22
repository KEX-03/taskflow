process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_tasks_api_only";

const test = require("node:test");
const { before, after } = test;
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const User = require("../src/models/User");
const Task = require("../src/models/Task");

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/taskflow_test";

// Safety check: refuse to run unless the database name ends in _test
const dbNameMatch = TEST_MONGO_URI.match(/\/([a-zA-Z0-9_-]+)(?:\?.*)?$/);
const dbName = dbNameMatch ? dbNameMatch[1] : "";
if (!dbName || !dbName.endsWith("_test")) {
  throw new Error(`Refusing to run tests: test database name must end in "_test", got "${dbName}".`);
}

let server;
let baseUrl;
let user1;
let user2;
let user1Token;
let user2Token;

before(async () => {
  await mongoose.connect(TEST_MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  if (!mongoose.connection.name.endsWith("_test")) {
    throw new Error(`Refusing to run tests: connected database "${mongoose.connection.name}" must end in "_test".`);
  }

  await User.deleteMany({});
  await Task.deleteMany({});

  user1 = await User.create({
    name: "User One",
    email: "user1@example.com",
    password: "StrongPass123!",
  });

  user2 = await User.create({
    name: "User Two",
    email: "user2@example.com",
    password: "StrongPass123!",
  });

  user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET);
  user2Token = jwt.sign({ id: user2._id }, process.env.JWT_SECRET);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name.endsWith("_test")) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("GET /api/v1/tasks without a token returns 401", async () => {
  const res = await fetch(`${baseUrl}/api/v1/tasks`);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
});

test("creating a task returns 201 with default priority and status", async () => {
  const res = await fetch(`${baseUrl}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "My first task" }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.task.title, "My first task");
  assert.equal(data.task.priority, "medium");
  assert.equal(data.task.status, "todo");
  assert.equal(data.task.description, "");
});

test("creating a task with an empty title returns 400", async () => {
  const res = await fetch(`${baseUrl}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "   " }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.equal(data.message, "Title is required.");
});

test("listing tasks returns only your own tasks", async () => {
  await Task.deleteMany({});

  await Task.create({ title: "User 1 Only Task", owner: user1._id });
  await Task.create({ title: "User 2 Only Task", owner: user2._id });

  const res1 = await fetch(`${baseUrl}/api/v1/tasks`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.tasks.length, 1);
  assert.equal(data1.tasks[0].title, "User 1 Only Task");

  const res2 = await fetch(`${baseUrl}/api/v1/tasks`, {
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.tasks.length, 1);
  assert.equal(data2.tasks[0].title, "User 2 Only Task");
});

test("?status= and ?search= filter correctly", async () => {
  await Task.deleteMany({ owner: user1._id });

  await Task.create([
    { title: "Fix search bug", status: "in-progress", owner: user1._id },
    { title: "Write documentation", status: "todo", owner: user1._id },
    { title: "Deploy app to production", status: "done", owner: user1._id },
  ]);

  const statusRes = await fetch(`${baseUrl}/api/v1/tasks?status=in-progress`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(statusRes.status, 200);
  const statusData = await statusRes.json();
  assert.equal(statusData.tasks.length, 1);
  assert.equal(statusData.tasks[0].title, "Fix search bug");

  const searchRes = await fetch(`${baseUrl}/api/v1/tasks?search=documentation`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(searchRes.status, 200);
  const searchData = await searchRes.json();
  assert.equal(searchData.tasks.length, 1);
  assert.equal(searchData.tasks[0].title, "Write documentation");
});

test("updating with an invalid priority returns 400, and a valid update returns 200", async () => {
  const task = await Task.create({ title: "Update Test Task", owner: user1._id });

  const invalidRes = await fetch(`${baseUrl}/api/v1/tasks/${task._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ priority: "urgent" }),
  });
  assert.equal(invalidRes.status, 400);
  const invalidData = await invalidRes.json();
  assert.equal(invalidData.success, false);
  assert.equal(invalidData.message, "Invalid priority.");

  const validRes = await fetch(`${baseUrl}/api/v1/tasks/${task._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ priority: "high", status: "done", title: "Updated Title" }),
  });
  assert.equal(validRes.status, 200);
  const validData = await validRes.json();
  assert.equal(validData.success, true);
  assert.equal(validData.task.priority, "high");
  assert.equal(validData.task.status, "done");
  assert.equal(validData.task.title, "Updated Title");
});

test("an invalid id returns 404 Task not found. for GET, PUT and DELETE", async () => {
  const badId = "not-an-id";

  const getRes = await fetch(`${baseUrl}/api/v1/tasks/${badId}`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(getRes.status, 404);
  const getData = await getRes.json();
  assert.equal(getData.success, false);
  assert.equal(getData.message, "Task not found.");

  const putRes = await fetch(`${baseUrl}/api/v1/tasks/${badId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "Something" }),
  });
  assert.equal(putRes.status, 404);
  const putData = await putRes.json();
  assert.equal(putData.success, false);
  assert.equal(putData.message, "Task not found.");

  const deleteRes = await fetch(`${baseUrl}/api/v1/tasks/${badId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(deleteRes.status, 404);
  const deleteData = await deleteRes.json();
  assert.equal(deleteData.success, false);
  assert.equal(deleteData.message, "Task not found.");
});

test("another user's task id returns 404 for GET, PUT and DELETE", async () => {
  const user2Task = await Task.create({ title: "User 2 Secret Task", owner: user2._id });

  const getRes = await fetch(`${baseUrl}/api/v1/tasks/${user2Task._id}`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(getRes.status, 404);
  const getData = await getRes.json();
  assert.equal(getData.success, false);
  assert.equal(getData.message, "Task not found.");

  const putRes = await fetch(`${baseUrl}/api/v1/tasks/${user2Task._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "Hacked" }),
  });
  assert.equal(putRes.status, 404);
  const putData = await putRes.json();
  assert.equal(putData.success, false);
  assert.equal(putData.message, "Task not found.");

  const deleteRes = await fetch(`${baseUrl}/api/v1/tasks/${user2Task._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(deleteRes.status, 404);
  const deleteData = await deleteRes.json();
  assert.equal(deleteData.success, false);
  assert.equal(deleteData.message, "Task not found.");
});

test("deleting a task, then GET on it returns 404", async () => {
  const task = await Task.create({ title: "Task to Delete", owner: user1._id });

  const deleteRes = await fetch(`${baseUrl}/api/v1/tasks/${task._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.equal(deleteData.success, true);
  assert.equal(deleteData.message, "Task deleted.");

  const getRes = await fetch(`${baseUrl}/api/v1/tasks/${task._id}`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  assert.equal(getRes.status, 404);
  const getData = await getRes.json();
  assert.equal(getData.success, false);
  assert.equal(getData.message, "Task not found.");
});
