import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Search, CheckCircle, XCircle, AlertTriangle, Clock, Shield } from "lucide-react";

export default function PatientPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setResult(null);
    try { const res = await API.post("/verification/verify/", { scanned_code: code }); setResult(res.data); }
    catch { setError("Verification failed. Please try again."); }
    finally { setLoading(false); }
  };

  const resultConfig = {
    authentic: { bg: "bg-emerald-50 border-emerald-300", icon: CheckCircle, iconColor: "text-emerald-500", title: "Drug is Authentic", msg: "This drug is genuine and safe to use.", text: "text-emerald-800" },
    not_found: { bg: "bg-red-50 border-red-300", icon: XCircle, iconColor: "text-red-500", title: "Drug Not Found", msg: "This drug could not be verified. Do not use!", text: "text-red-800" },
    expired: { bg: "bg-amber-50 border-amber-300", icon: Clock, iconColor: "text-amber-500", title: "Drug is Expired", msg: "This drug has expired. Do not use!", text: "text-amber-800" },
    recalled: { bg: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-500", title: "Drug is Recalled", msg: "This drug has been recalled. Return to pharmacy!", text: "text-orange-800" },
    counterfeit: { bg: "bg-red-100 border-red-500", icon: XCircle, iconColor: "text-red-600", title: "Counterfeit Detected", msg: "WARNING: This is a counterfeit drug. Do not use!", text: "text-red-900" },
  };

  const config = result ? (resultConfig[result.result] || resultConfig.not_found) : null;

  return (
    <DashboardLayout title="Verify Your Drug" subtitle="Enter the batch number from your drug packaging to verify authenticity">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mx-auto mb-6"><Shield className="w-8 h-8 text-primary-700" /></div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Drug Verification</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Enter the batch number printed on your drug packaging</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input value={code} onChange={e=>setCode(e.target.value)} required placeholder="Enter batch number e.g. BATCH-001" className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-primary-500 transition" />
            {error && <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-sm text-center">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-[#0A2647] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B4F72] transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {loading ? "Checking..." : "Verify Drug"}
            </button>
          </form>
        </div>

        {result && config && (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className={"border-2 rounded-2xl p-8 text-center " + config.bg}>
            <config.icon className={"w-16 h-16 mx-auto mb-4 " + config.iconColor} />
            <h3 className={"text-2xl font-extrabold mb-2 " + config.text}>{config.title}</h3>
            <p className={"text-lg mb-4 " + config.text}>{config.msg}</p>
            {result.batch && <p className={"text-sm font-medium opacity-70 " + config.text}>{result.batch}</p>}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
