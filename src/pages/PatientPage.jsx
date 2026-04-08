import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import VerificationCertificate from "../components/ui/VerificationCertificate";
import API from "../utils/api";
import { Search, CheckCircle, XCircle, AlertTriangle, Clock, Shield, QrCode, Award } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";

export default function PatientPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("qr-reader-patient", { fps: 10, qrbox: 250 });
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

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post("/verification/verify/", { scanned_code: code });
      setResult(res.data);
      if (res.data.result === "authentic") toast.success("Drug is authentic and safe!");
      else if (res.data.result === "counterfeit") toast.error("WARNING: Do not use this drug!");
      else if (res.data.result === "expired") toast.error("This drug has expired!");
      else toast.error("Could not verify this drug!");
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resultConfig = {
    authentic: { bg: "bg-emerald-50 border-emerald-300", icon: CheckCircle, iconColor: "text-emerald-500", title: "Drug is Authentic ✓", msg: "This drug is genuine and safe to use.", text: "text-emerald-800" },
    not_found: { bg: "bg-red-50 border-red-300", icon: XCircle, iconColor: "text-red-500", title: "Drug Not Found", msg: "This drug could not be verified. Do not use!", text: "text-red-800" },
    expired: { bg: "bg-amber-50 border-amber-300", icon: Clock, iconColor: "text-amber-500", title: "Drug is Expired", msg: "This drug has expired. Do not use!", text: "text-amber-800" },
    recalled: { bg: "bg-orange-50 border-orange-300", icon: AlertTriangle, iconColor: "text-orange-500", title: "Drug is Recalled", msg: "This drug has been recalled. Return to pharmacy!", text: "text-orange-800" },
    counterfeit: { bg: "bg-red-100 border-red-500", icon: XCircle, iconColor: "text-red-600", title: "⚠️ Counterfeit Detected", msg: "WARNING: This is a counterfeit drug. Do not use!", text: "text-red-900" },
  };

  const config = result ? (resultConfig[result.result] || resultConfig.not_found) : null;

  return (
    <DashboardLayout title="Verify Your Drug" subtitle="Scan the QR code or enter the batch number from your drug packaging">
      <AnimatePresence>
        {showCert && <VerificationCertificate result={result} onClose={() => setShowCert(false)} />}
      </AnimatePresence>

      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-[#0A2647] rounded-2xl mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Drug Verification</h2>
          <p className="text-gray-400 text-center text-sm mb-6">Scan QR code or enter batch number</p>

          <button onClick={() => setShowScanner(!showScanner)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 py-4 rounded-xl mb-4 hover:border-[#0A2647] hover:text-[#0A2647] transition font-medium">
            <QrCode className="w-5 h-5" />
            {showScanner ? "Close Scanner" : "Tap to Scan QR Code"}
          </button>

          {showScanner && <div id="qr-reader-patient" className="mb-4 rounded-xl overflow-hidden"></div>}

          <form onSubmit={handleVerify} className="space-y-4">
            <input value={code} onChange={e => setCode(e.target.value)} required placeholder="Or enter batch number e.g. BATCH-001" className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-5 py-4 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-[#0A2647] transition" />
            <button type="submit" disabled={loading} className="w-full bg-[#0A2647] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B4F72] transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {loading ? "Checking..." : "Verify Drug"}
            </button>
          </form>
        </div>

        {result && config && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={"border-2 rounded-2xl p-8 text-center " + config.bg}>
            <config.icon className={"w-16 h-16 mx-auto mb-4 " + config.iconColor} />
            <h3 className={"text-2xl font-extrabold mb-2 " + config.text}>{config.title}</h3>
            <p className={"text-sm mb-4 " + config.text}>{config.msg}</p>
            {result.drug_name && <p className={"text-sm font-semibold " + config.text}>Drug: {result.drug_name}</p>}
            {result.expiry_date && <p className={"text-sm " + config.text}>Expires: {result.expiry_date}</p>}
            <button onClick={() => setShowCert(true)} className="mt-4 flex items-center gap-2 mx-auto bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              <Award className="w-4 h-4" /> View Certificate
            </button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
