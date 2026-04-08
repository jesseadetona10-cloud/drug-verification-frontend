import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import VerificationCertificate from "../components/ui/VerificationCertificate";
import API from "../utils/api";
import { Search, CheckCircle, XCircle, AlertTriangle, Clock, ClipboardList, QrCode, Award } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";

export default function PharmacistDashboard() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            setCode(data.batch_number || decodedText);
          } catch {
            setCode(decodedText);
          }
          scanner.clear();
          setShowScanner(false);
          toast.success("QR code scanned!");
        },
        (err) => console.log(err)
      );
      return () => scanner.clear().catch(() => {});
    }
  }, [showScanner]);

  const fetchHistory = async () => {
    try { const res = await API.get("/verification/history/"); setHistory(res.data.results || res.data); }
    catch(e) { console.error(e); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post("/verification/verify/", { scanned_code: code, location: "Lagos, Nigeria" });
      setResult(res.data);
      fetchHistory();
      if (res.data.result === "authentic") toast.success("Drug verified as authentic!");
      else if (res.data.result === "counterfeit") toast.error("WARNING: Counterfeit drug detected!");
      else if (res.data.result === "expired") toast.error("Drug is expired!");
      else if (res.data.result === "recalled") toast.error("Drug has been recalled!");
      else toast.error("Drug not found in system!");
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resultConfig = {
    authentic: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: CheckCircle, iconColor: "text-emerald-500", label: "Authentic ✓" },
    not_found: { bg: "bg-red-50 border-red-200", text: "text-red-800", icon: XCircle, iconColor: "text-red-500", label: "Not Found" },
    expired: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: Clock, iconColor: "text-amber-500", label: "Expired" },
    recalled: { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", icon: AlertTriangle, iconColor: "text-orange-500", label: "Recalled" },
    counterfeit: { bg: "bg-red-100 border-red-400", text: "text-red-900", icon: XCircle, iconColor: "text-red-600", label: "⚠️ COUNTERFEIT" },
  };

  const config = result ? (resultConfig[result.result] || resultConfig.not_found) : null;

  return (
    <DashboardLayout title="Drug Verification" subtitle="Scan or enter a batch code to verify drug authenticity">
      <AnimatePresence>
        {showCert && <VerificationCertificate result={result} onClose={() => setShowCert(false)} />}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0A2647]" /> Verify Drug
            </h2>
            <p className="text-sm text-gray-400 mb-6">Enter batch number or scan QR code</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setShowScanner(!showScanner)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                <QrCode className="w-4 h-4" /> {showScanner ? "Close Scanner" : "Scan QR Code"}
              </button>
            </div>

            {showScanner && <div id="qr-reader" className="mb-4 rounded-xl overflow-hidden"></div>}

            <form onSubmit={handleVerify} className="space-y-4">
              <input value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. BATCH-001" className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-[#0A2647] transition tracking-widest" />
              <button type="submit" disabled={loading} className="w-full bg-[#0A2647] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1B4F72] transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                {loading ? "Verifying..." : "Verify Drug"}
              </button>
            </form>
          </div>

          {result && config && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={"border-2 rounded-2xl p-6 " + config.bg}>
              <div className="flex items-center gap-4 mb-4">
                <config.icon className={"w-12 h-12 " + config.iconColor} />
                <div>
                  <h3 className={"text-2xl font-extrabold " + config.text}>{config.label}</h3>
                  <p className={"text-sm opacity-70 " + config.text}>Batch: {result.scanned_code}</p>
                </div>
              </div>
              {result.drug_name && <p className={"text-sm font-semibold " + config.text}>Drug: {result.drug_name}</p>}
              {result.manufacturer && <p className={"text-sm " + config.text}>Manufacturer: {result.manufacturer}</p>}
              {result.expiry_date && <p className={"text-sm " + config.text}>Expires: {result.expiry_date}</p>}
              <button onClick={() => setShowCert(true)} className="mt-4 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                <Award className="w-4 h-4" /> View Certificate
              </button>
            </motion.div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0A2647]" /> Verification History
          </h2>
          <p className="text-sm text-gray-400 mb-6">Your recent drug verifications</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <ClipboardList className="w-12 h-12 mb-3" />
                <p className="text-gray-400 font-medium">No verifications yet</p>
              </div>
            ) : history.map(log => (
              <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono">{log.scanned_code}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.verified_at).toLocaleString()}</p>
                </div>
                <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (log.result === "authentic" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : log.result === "not_found" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                  {log.result.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
