import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Shield, Mail, Lock, Building, ArrowLeft, User } from "lucide-react";
import toast from "react-hot-toast";

const roles = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "regulator", label: "Regulator" },
  { value: "patient", label: "Patient" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "patient", company_name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success("Account created! Welcome to DrugVerify!");
      const routes = { manufacturer: "/manufacturer", pharmacist: "/pharmacist", regulator: "/regulator", patient: "/patient", wholesaler: "/pharmacist" };
      navigate(routes[user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] to-[#1B4F72] flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white opacity-70 hover:opacity-100 transition font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join DrugVerify today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2647]">
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {["manufacturer", "pharmacist", "wholesaler", "regulator"].includes(form.role) && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Company Name</label>
              <div className="relative">
                <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Your company name" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-sm" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-sm" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#0A2647] text-white py-3.5 rounded-xl font-bold hover:bg-[#1B4F72] transition disabled:opacity-50 text-sm">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0A2647] font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
