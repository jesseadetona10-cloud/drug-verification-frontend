import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Search, CheckCircle, XCircle, AlertTriangle, Clock, ClipboardList } from "lucide-react";

export default function PharmacistDashboard() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try { const res = await API.get("/verification/history/"); setHistory(res.data); }
    catch(e) { console.error(e); }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const res = await API.post("/verification/verify/", { scanned_code: code, location: "Lagos, Nigeria" });
      setResult(res.data); fetchHistory();
    } catch { setError("Verification failed. Please try again."); }
    finally { setLoading(false); }
  };

  const resultConfig = {
    authentic: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: CheckCircle, iconColor: "text-emerald-500", label: "Authentic" },
    not_found: { bg: "bg-red-50 border-red-200", text: "text-red-800", icon: XCircle, iconColor: "text-red-500", label: "Not Found" },
    expired: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: Clock, iconColor: "text-amber-500", label: "Expired" },
    recalled: { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", icon: AlertTriangle, iconColor: "text-orange-500", label: "Recalled" },
    counterfeit: { bg: "bg-red-100 border-red-400", text: "text-red-900", icon: XCircle, iconColor: "text-red-600", label: "Counterfeit" },
  };

  const config = result ? (resultConfig[result.result] || resultConfig.not_found) : null;

  return (
    <DashboardLayout title="Drug Verification" subtitle="Enter or scan a batch code to verify drug authenticity">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><Search className="w-5 h-5 text-primary-700" /> Verify Drug</h2>
            <p className="text-sm text-gray-400 mb-6">Enter the batch number from the drug packaging</p>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Batch Number</label>
                <input value={code} onChange={e=>setCode(e.target.value)} required placeholder="e.g. BATCH-001" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-primary-500 transition tracking-widest" />
              </div>
              {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-[#0A2647] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1B4F72] transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                {loading ? "Verifying..." : "Verify Drug"}
              </button>
            </form>
          </div>

          {result && config && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className={"border-2 rounded-2xl p-6 " + config.bg}>
              <div className="flex items-center gap-4 mb-4">
                <config.icon className={"w-12 h-12 " + config.iconColor} />
                <div>
                  <h3 className={"text-2xl font-extrabold " + config.text}>{config.label}</h3>
                  <p className={"text-sm " + config.text + " opacity-70"}>Batch: {result.scanned_code}</p>
                </div>
              </div>
              {result.batch && <p className={"text-sm font-medium " + config.text}>{result.batch}</p>}
            </motion.div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary-700" /> Verification History</h2>
          <p className="text-sm text-gray-400 mb-6">Your recent drug verifications</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <ClipboardList className="w-12 h-12 mb-3" />
                <p className="text-gray-400 font-medium">No verifications yet</p>
              </div>
            ) : history.map(log => (
              <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition">
                <div>
                  <p className="font-semibold text-gray-900 text-sm font-mono">{log.scanned_code}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.verified_at).toLocaleString()}</p>
                </div>
                <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (log.result === "authentic" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : log.result === "not_found" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200")}>{log.result.replace("_"," ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
