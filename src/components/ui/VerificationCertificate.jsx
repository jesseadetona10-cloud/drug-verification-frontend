import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";

const resultConfig = {
  authentic: { icon: CheckCircle, color: "text-emerald-600", bg: "from-emerald-50 to-green-50", border: "border-emerald-200", label: "AUTHENTIC", badge: "bg-emerald-500" },
  not_found: { icon: XCircle, color: "text-red-600", bg: "from-red-50 to-rose-50", border: "border-red-200", label: "NOT FOUND", badge: "bg-red-500" },
  expired: { icon: Clock, color: "text-amber-600", bg: "from-amber-50 to-yellow-50", border: "border-amber-200", label: "EXPIRED", badge: "bg-amber-500" },
  recalled: { icon: AlertTriangle, color: "text-orange-600", bg: "from-orange-50 to-amber-50", border: "border-orange-200", label: "RECALLED", badge: "bg-orange-500" },
  counterfeit: { icon: XCircle, color: "text-red-700", bg: "from-red-100 to-rose-100", border: "border-red-400", label: "COUNTERFEIT", badge: "bg-red-700" },
};

export default function VerificationCertificate({ result, onClose }) {
  if (!result) return null;
  const cfg = resultConfig[result.result] || resultConfig.not_found;
  const Icon = cfg.icon;
  const date = new Date().toLocaleString();
  const certId = "CERT-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handlePrint = () => window.print();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={"bg-gradient-to-br " + cfg.bg + " border-2 " + cfg.border + " rounded-3xl p-8 max-w-md w-full shadow-2xl"}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-[#0A2647]" />
            <span className="font-bold text-[#0A2647] text-lg">DrugVerify</span>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Verification Certificate</p>
          <Icon className={"w-20 h-20 mx-auto mb-3 " + cfg.color} />
          <span className={"inline-block px-6 py-2 rounded-full text-white font-black text-xl tracking-widest " + cfg.badge}>
            {cfg.label}
          </span>
        </div>

        <div className="space-y-3 bg-white bg-opacity-60 rounded-2xl p-4 mb-6">
          {[
            ["Certificate ID", certId],
            ["Batch Number", result.scanned_code],
            ["Drug Name", result.drug_name || "N/A"],
            ["Manufacturer", result.manufacturer || "N/A"],
            ["Expiry Date", result.expiry_date || "N/A"],
            ["Verified At", date],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="font-bold text-gray-900 text-right max-w-48 truncate">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-[#0A2647] text-white py-3 rounded-xl font-semibold hover:bg-[#1B4F72] transition text-sm">
            <Download className="w-4 h-4" /> Save Certificate
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
