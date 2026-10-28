import React, { useState, useEffect, useCallback, useId, useRef } from "react";
import axios from "axios";
import api from "../utils/api.js";
import { useToast } from "../components/Shared/Toast.jsx";
import TaskSkeleton from "../components/Shared/TaskSkeleton.jsx";
import usePageTitle from "../utils/usePageTitle.js";

// ── Modal Component ───────────────────────
const Modal = ({ open, onClose, title, children }) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 id={titleId} className="text-base font-semibold text-white">{title}</h3>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ── Task Form inside modal ─────────────────
const TaskForm = ({ initial = {}, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    priority: initial.priority || "medium",
    status: initial.status || "todo",
    dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    try {
      await onSave({ ...form, dueDate: form.dueDate || null });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label htmlFor="task-title" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Title</label>
        <input id="task-title" name="title" value={form.title} maxLength={200} onChange={handleChange} placeholder="Task title…"
          className="w-full px-3 py-2 text-sm rounded-lg" />
      </div>

      <div>
        <label htmlFor="task-description" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
        <textarea id="task-description" name="description" value={form.description} maxLength={1000} onChange={handleChange} placeholder="Optional…" rows={3}
          aria-describedby="task-description-counter"
          className="w-full px-3 py-2 text-sm rounded-lg resize-none" />
        <p id="task-description-counter" className={`text-xs mt-1 ${
          form.description.length >= 950 ? "text-amber-400" : "text-slate-600"
        }`}>
          {form.description.length} / 1000<span className="sr-only"> characters used</span>
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="task-priority" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Priority</label>
          <select id="task-priority" name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg cursor-pointer">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="task-status" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
          <select id="task-status" name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 text-sm rounded-lg cursor-pointer">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="task-due-date" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Due date</label>
        <div className="flex items-center gap-2">
          <input id="task-due-date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange}
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg" />
          {form.dueDate && (
            <button type="button" onClick={() => handleChange({ target: { name: "dueDate", value: "" } })} aria-label="Clear due date"
              className="px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Clear</button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : (initial._id ? "Update Task" : "Create Task")}
        </button>
      </div>
    </form>
  );
};

// ── Due date, e.g. "31 Oct 2026" ────────────
// The API sends "2026-10-31T00:00:00.000Z". Reading only the date part as
// local midnight keeps the same day in every timezone; new Date() on the
// full value would show 30 Oct west of UTC.
const formatDueDate = (dueDate) =>
  new Date(`${dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ── Main Tasks Page ────────────────────────
const Tasks = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const abortControllerRef = useRef(null);

  useEffect(() => () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  usePageTitle("Tasks");

  const fetchTasks = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterPriority) params.set("priority", filterPriority);
      if (filterStatus) params.set("status", filterStatus);
      params.set("page", page);
      const { data } = await api.get(`/tasks?${params}`, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setTasks(data.tasks);
      setMeta(data.meta);
      if (data.meta.pages > 0 && page > data.meta.pages) {
        setPage(data.meta.pages);
      }
    } catch (err) {
      if (axios.isCancel(err) || err?.name === "CanceledError") return;
      console.error(err);
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, filterPriority, filterStatus, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Debounce the search. This runs after the fetch effect above, so when the debounced
  // value changes, that effect has already started the new request.
  useEffect(() => {
    if (search === debouncedSearch) {
      // Nothing to do on page load or once the debounced value has caught up, unless typing
      // cancelled a request and the text was then changed back (no new fetch would follow)
      if (abortControllerRef.current?.signal.aborted) fetchTasks();
      return;
    }

    // The search text changed, so a request still on its way is for an older search
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch, fetchTasks]);

  // ── CRUD handlers ──────────────────────
  const handleCreate = async (form) => {
    await api.post("/tasks", form);
    addToast("Task created!", "success");
    setModalOpen(false);
    fetchTasks();
  };

  const handleUpdate = async (form) => {
    await api.put(`/tasks/${editTask._id}`, form);
    addToast("Task updated!", "success");
    setEditTask(null);
    fetchTasks();
  };

  const handleDelete = async () => {
    await api.delete(`/tasks/${deleteId}`);
    addToast("Task deleted.", "info");
    setDeleteId(null);
    fetchTasks();
  };

  // ── Badges ─────────────────────────────
  const statusBadge = { todo: "text-slate-400 bg-slate-800", "in-progress": "text-yellow-400 bg-yellow-400/10", done: "text-emerald-400 bg-emerald-400/10" };
  const priorityBadge = { low: "text-emerald-400 bg-emerald-400/10", medium: "text-yellow-400 bg-yellow-400/10", high: "text-red-400 bg-red-400/10" };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* ── Header ──────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks</h1>
          <p className="text-slate-500 text-sm">{meta.total} task{meta.total !== 1 ? "s" : ""} found</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* ── Search + Filters ────────────── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[180px] relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg" />
        </div>
        <select value={filterPriority} onChange={(e) => {
              setFilterPriority(e.target.value);
              setPage(1);
            }}
          className="px-3 py-2 text-sm rounded-lg cursor-pointer min-w-[120px]">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={filterStatus} onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          className="px-3 py-2 text-sm rounded-lg cursor-pointer min-w-[120px]">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* ── Task List ───────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          {!search && !debouncedSearch && !filterPriority && !filterStatus ? (
            <>
              <div className="text-5xl mb-4" aria-hidden="true">📝</div>
              <h2 className="text-lg font-semibold text-white mb-2">You don't have any tasks yet</h2>
              <p className="text-slate-500 text-sm mb-5">Create your first task to get started.</p>
              <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <span className="text-lg leading-none">+</span> Create your first task
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-500 text-sm">No tasks match your filters.</p>
              <button onClick={() => { setSearch(""); setDebouncedSearch(""); setFilterPriority(""); setFilterStatus(""); setPage(1); }} className="text-primary-400 hover:text-primary-300 text-sm mt-2 transition-colors">Clear filters</button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div key={task._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4 hover:border-slate-700 transition-colors animate-fade-in">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{task.title}</p>
                {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
                {task.dueDate && (
                  <p className="text-xs text-slate-400 mt-1"><span aria-hidden="true">📅 </span>Due {formatDueDate(task.dueDate)}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[task.status]}`}>
                    {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button aria-label="Edit task" onClick={() => setEditTask(task)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors" title="Edit">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button aria-label="Delete task" onClick={() => setDeleteId(task._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination Controls ─────────── */}
      {meta.pages > 1 && (
        <div className="flex items-center justify-between mt-6">

          <button
            onClick={()=> setPage(page-1)}
            disabled={page === 1}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-slate-500 text-sm">Page {page} of {meta.pages}</span>

          <button
            onClick={()=> setPage(page+1)}
            disabled={page >= meta.pages}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Next
          </button>

        </div>
      )}

      {/* ── Create Modal ──────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <TaskForm onSave={handleCreate} onClose={() => setModalOpen(false)} />
      </Modal>

      {/* ── Edit Modal ────────────────── */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <TaskForm initial={editTask} onSave={handleUpdate} onClose={() => setEditTask(null)} />}
      </Modal>

      {/* ── Delete Confirm Modal ──────── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task">
        <p className="text-slate-400 text-sm mb-5">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
          <button type="button" aria-label="Delete task" onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
