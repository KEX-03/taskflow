const test = require("node:test");
const assert = require("node:assert/strict");
const Task = require("../src/models/Task");
const { createTask, getTasks, updateTask } = require("../src/controllers/taskController");

const user = { _id: "670c5b369a421ef8841a0101" };

const response = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("createTask stores normalized tags", async (t) => {
  const create = t.mock.method(Task, "create", async (doc) => doc);
  const res = response();
  await createTask({ user, body: { title: "Plan", tags: ["Work", "urgent", "work "] } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(create.mock.calls[0].arguments[0].tags, ["work", "urgent"]);
});

test("createTask without tags stores an empty list", async (t) => {
  const create = t.mock.method(Task, "create", async (doc) => doc);
  await createTask({ user, body: { title: "Plan" } }, response());
  assert.deepEqual(create.mock.calls[0].arguments[0].tags, []);
});

test("createTask rejects invalid tags with 400 and saves nothing", async (t) => {
  const create = t.mock.method(Task, "create", async (doc) => doc);
  for (const tags of [["a", "b", "c", "d", "e", "f"], ["x".repeat(25)], "work"]) {
    const res = response();
    await createTask({ user, body: { title: "Plan", tags } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
  }
  assert.equal(create.mock.callCount(), 0);
});

test("getTasks filters by tag together with the other filters", async (t) => {
  let filter;
  t.mock.method(Task, "countDocuments", async (f) => {
    filter = f;
    return 0;
  });
  const chain = { sort: () => chain, skip: () => chain, limit: async () => [] };
  t.mock.method(Task, "find", () => chain);
  await getTasks({ user, query: { tag: " Work ", status: "todo" } }, response());
  assert.deepEqual(filter, { owner: user._id, status: "todo", tags: "work" });
});

test("updateTask replaces tags and rejects invalid ones", async (t) => {
  const task = { save: async () => {} };
  t.mock.method(Task, "findOne", async () => task);
  const id = "670c5c189a421ef8841a0105";

  const ok = response();
  await updateTask({ user, params: { id }, body: { tags: ["Review"] } }, ok);
  assert.equal(ok.statusCode, 200);
  assert.deepEqual(task.tags, ["review"]);

  const bad = response();
  await updateTask({ user, params: { id }, body: { tags: [5] } }, bad);
  assert.equal(bad.statusCode, 400);
  assert.deepEqual(task.tags, ["review"]);
});
