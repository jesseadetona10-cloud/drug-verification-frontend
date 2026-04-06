import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "patient", company_name: "", phone: "", license_number: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await register(form);
      const routes = { manufacturer: "/manufacturer", pharmacist: "/pharmacist", regulator: "/regulator", patient: "/patient", wholesaler: "/pharmacist" };
      navigate(routes[user.role] || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = ["manufacturer", "wholesaler", "pharmacist", "regulator", "patient"];
  const showCompany = ["manufacturer", "wholesaler", "pharmacist"].includes(form.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-600 flex items-center justify-center px-4 py-8">
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💊</div>
          <h1 className="text-2xl font-bold text-primary-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join DrugVerify today</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="min 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="08012345678" />
          </div>
          {showCompany && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your company name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input type="text" value={form.license_number} onChange={e=>setForm({...form,license_number:e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your license number" />
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="w-full bg-primary-700 text-white py-3 rounded-lg font-semibold hover:bg-primary-800 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">Already have an account? <Link to="/login" className="text-primary-700 font-semibold hover:underline">Login</Link></p>
      </motion.div>
    </div>
  );
}
