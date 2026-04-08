import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Pill, Package, Search, AlertTriangle, Plus, X, TrendingUp } from "lucide-react";

function StatCard({ title, value, icon: Icon, gradient, delay }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}} className={"relative overflow-hidden rounded-2xl p-6 text-white shadow-lg " + gradient}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
      <div className="relative">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-white" /></div>
        <p className="text-sm font-medium text-white text-opacity-80 mb-1">{title}</p>
        <p className="text-4xl font-extrabold">{value}</p>
      </div>
    </motion.div>
  );
}

export default function ManufacturerDashboard() {
  const { user } = useAuth();
  const [drugs, setDrugs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", generic_name: "", nafdac_number: "", description: "", dosage_form: "", strength: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [d, s] = await Promise.all([API.get("/drugs/"), API.get("/analytics/dashboard/")]);
      setDrugs(d.data.results || d.data);
      setStats(s.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await API.post("/drugs/", form);
      setShowAdd(false);
      setForm({ name: "", generic_name: "", nafdac_number: "", description: "", dosage_form: "", strength: "" });
      fetchData();
    } catch(e) { setError(e.response?.data?.nafdac_number?.[0] || e.response?.data?.detail || "Failed to add drug"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-700"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={"Welcome, " + (user?.company_name || user?.email)} subtitle="Manage your drugs, batches and monitor verifications">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Drugs" value={stats.total_drugs ?? 0} icon={Pill} gradient="bg-gradient-to-br from-[#0A2647] to-[#2E86C1]" delay={0} />
        <StatCard title="Total Batches" value={stats.total_batches ?? 0} icon={Package} gradient="bg-gradient-to-br from-emerald-600 to-emerald-400" delay={0.1} />
        <StatCard title="Verifications" value={stats.total_verifications ?? 0} icon={TrendingUp} gradient="bg-gradient-to-br from-violet-600 to-violet-400" delay={0.2} />
        <StatCard title="Active Alerts" value={stats.unresolved_alerts ?? 0} icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-600 to-rose-400" delay={0.3} />
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Drugs</h2>
            <p className="text-sm text-gray-400 mt-0.5">{drugs.length} drug{drugs.length !== 1 ? "s" : ""} registered</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-[#0A2647] text-white px-5 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm shadow-sm">
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Cancel" : "Add Drug"}
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="border-b border-gray-100 p-6 bg-blue-50 dark:bg-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Drug</h3>
            <p className="text-xs text-gray-500 mb-4">NAFDAC format: <span className="font-mono font-bold">A4-1234</span> (Letter + Number + dash + 4 digits)</p>
            {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[["name","Drug Name",true],["generic_name","Generic Name",false],["nafdac_number","NAFDAC Number (e.g. A4-1234)",true],["dosage_form","Dosage Form",true],["strength","Strength",true],["description","Description",false]].map(([key,label,req]) => (
                <div key={key} className={key === "description" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">{label}{req && <span className="text-red-400 ml-1">*</span>}</label>
                  <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required={req} className="w-full border border-gray-200 bg-white dark:bg-gray-600 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              ))}
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-6 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm disabled:opacity-50">{saving ? "Saving..." : "Save Drug"}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm text-gray-600">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="overflow-x-auto">
          {drugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Pill className="w-16 h-16 text-gray-200 mb-4" />
              <p className="font-semibold text-gray-500 text-lg">No drugs registered yet</p>
              <p className="text-sm mt-1">Click Add Drug to register your first drug</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  {["Drug Name","Generic Name","NAFDAC No.","Dosage Form","Strength","Status","Batches"].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {drugs.map(drug => (
                  <tr key={drug.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-4 px-5 font-semibold text-gray-900 dark:text-white">{drug.name}</td>
                    <td className="py-4 px-5 text-gray-500">{drug.generic_name || "-"}</td>
                    <td className="py-4 px-5 font-mono text-xs text-gray-500">{drug.nafdac_number}</td>
                    <td className="py-4 px-5 text-gray-500">{drug.dosage_form}</td>
                    <td className="py-4 px-5 text-gray-500">{drug.strength}</td>
                    <td className="py-4 px-5">
                      <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (drug.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : drug.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200")}>
                        {drug.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 font-semibold">{drug.batches?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
