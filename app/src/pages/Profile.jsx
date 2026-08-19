import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Shared/Toast.jsx";
import api from "../utils/api.js";

const Profile = () => {
  const { user, updateLocalUser } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ── Save profile ─────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters." });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put("/me", { name: form.name, bio: form.bio, avatar: form.avatar });
      updateLocalUser(data.user);
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Change password ──────────────────
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) { setErrors({ currentPassword: "Current password is required." }); return; }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) { setErrors({ newPassword: "New password must be at least 6 characters." }); return; }
    if (pwForm.newPassword !== pwForm.confirmNew) { setErrors({ confirmNew: "Passwords do not match." }); return; }

    setPwLoading(true);
    try {
      await api.put("/me", { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
      addToast("Password changed!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const avatarUrl = form.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "U"}&backgroundColor=3b82f6`;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-xl font-bold text-white mb-6">Profile</h1>

      <div className="max-w-xl space-y-6">
        {/* ── Avatar + Name Header ────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-5">
          <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
          <div>
            <p className="text-lg font-semibold text-white">{form.name || "—"}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* ── Edit Profile ──────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Edit Profile</h2>
          <form onSubmit={handleProfileSave} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={`w-full px-3 py-2 text-sm rounded-lg ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself…" className="w-full px-3 py-2 text-sm rounded-lg resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Avatar URL</label>
              <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="https://…" className="w-full px-3 py-2 text-sm rounded-lg" />
              <p className="text-xs text-slate-600 mt-1">Leave blank to use auto-generated avatar.</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : "Save Profile"}
            </button>
          </form>
        </div>

        {/* ── Change Password ────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Change Password</h2>
          <form onSubmit={handlePasswordSave} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Current Password</label>
              <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} placeholder="••••••••"
                className={`w-full px-3 py-2 text-sm rounded-lg ${errors.currentPassword ? "border-red-500 ring-1 ring-red-500" : ""}`} />
              {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">New Password</label>
              <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} placeholder="••••••••"
                className={`w-full px-3 py-2 text-sm rounded-lg ${errors.newPassword ? "border-red-500 ring-1 ring-red-500" : ""}`} />
              {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
              <input type="password" name="confirmNew" value={pwForm.confirmNew} onChange={handlePwChange} placeholder="••••••••"
                className={`w-full px-3 py-2 text-sm rounded-lg ${errors.confirmNew ? "border-red-500 ring-1 ring-red-500" : ""}`} />
              {errors.confirmNew && <p className="text-red-400 text-xs mt-1">{errors.confirmNew}</p>}
            </div>
            <button type="submit" disabled={pwLoading} className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              {pwLoading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
