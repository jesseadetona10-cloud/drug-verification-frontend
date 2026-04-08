import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Building, Shield, Lock, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ company_name: user?.company_name || "", phone: user?.phone || "", license_number: user?.license_number || "" });
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await API.patch("/auth/profile/", form);
      setSuccess("Profile updated successfully!");
    } catch(err) { setError("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwSaving(true); setError(""); setSuccess("");
    if (pwForm.new_password !== pwForm.confirm_password) { setError("Passwords do not match"); setPwSaving(false); return; }
    try {
      await API.post("/auth/change-password/", { old_password: pwForm.old_password, new_password: pwForm.new_password });
      setSuccess("Password changed successfully!");
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch(err) { setError(err.response?.data?.detail || "Failed to change password"); }
    finally { setPwSaving(false); }
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0A2647] flex items-center justify-center text-white text-2xl font-extrabold">{user?.email?.[0]?.toUpperCase()}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.company_name || user?.email}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">{user?.role}</span>
                {user?.is_verified && <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>

          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="font-bold text-gray-900">Update Profile</h3>
            {[["company_name","Company Name",Building],["phone","Phone Number",Phone],["license_number","License Number",Shield]].map(([key,label,Icon]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-sm" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-6 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-gray-500" /> Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[["old_password","Current Password"],["new_password","New Password"],["confirm_password","Confirm New Password"]].map(([key,label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={pwForm[key]} onChange={e=>setPwForm({...pwForm,[key]:e.target.value})} required className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-sm" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwSaving} className="bg-[#0A2647] text-white px-6 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm disabled:opacity-50">{pwSaving ? "Changing..." : "Change Password"}</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
