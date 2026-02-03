import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import api from "../utils/api.js";
import Spinner from "../components/Shared/Spinner.jsx";

const StatCard = ({ title, value, icon, color, sub }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-slide-up">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-400 font-medium">{title}</span>
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/tasks?limit=50");
        const tasks = data.tasks;
        setStats({
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "todo").length,
          inProgress: tasks.filter((t) => t.status === "in-progress").length,
          done: tasks.filter((t) => t.status === "done").length,
        });
        setRecentTasks(tasks.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>;

  const statusColor = { todo: "text-slate-400 bg-slate-800", "in-progress": "text-yellow-400 bg-yellow-400/10", done: "text-emerald-400 bg-emerald-400/10" };
  const priorityDot = { low: "bg-emerald-500", medium: "bg-yellow-500", high: "bg-red-500" };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* ── Greeting ─────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good morning, <span className="text-primary-400">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's going on with your tasks.</p>
      </div>

      {/* ── Stat Cards ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tasks" value={stats.total} color="bg-primary-600/15" sub="All tasks" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        } />
        <StatCard title="To Do" value={stats.todo} color="bg-slate-700/50" sub="Pending" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /></svg>
        } />
        <StatCard title="In Progress" value={stats.inProgress} color="bg-yellow-500/15" sub="Working on" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        } />
        <StatCard title="Done" value={stats.done} color="bg-emerald-500/15" sub="Completed" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        } />
      </div>

      {/* ── Recent Tasks ─────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
          <Link to="/tasks" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">View all →</Link>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No tasks yet. <Link to="/tasks" className="text-primary-400 hover:underline">Create one →</Link></p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                <p className="text-sm text-slate-200 flex-1 truncate">{task.title}</p>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[task.status]}`}>
                  {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
