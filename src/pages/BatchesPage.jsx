import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Package, QrCode, X, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function BatchesPage() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [form, setForm] = useState({ batch_number: "", manufacture_date: "", expiry_date: "", quantity: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDrugs(); }, []);

  const fetchDrugs = async () => {
    try { const res = await API.get("/drugs/"); setDrugs((res.data.results || res.data).filter(d => d.status === "active")); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post("/drugs/" + showAdd + "/batches/", form);
      setShowAdd(null);
      setForm({ batch_number: "", manufacture_date: "", expiry_date: "", quantity: "" });
      fetchDrugs();
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleQR = async (batchId) => {
    try { const res = await API.get("/drugs/batches/" + batchId + "/qr/"); setQrData(res.data); setShowQR(batchId); }
    catch(e) { console.error(e); }
  };

  const allBatches = drugs.flatMap(d => (d.batches || []).map(b => ({...b, drug_name: d.name, nafdac: d.nafdac_number})));

  return (
    <DashboardLayout title="Batch Management" subtitle="Manage batch numbers and generate QR codes">

      {showQR && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">QR Code - {qrData.batch_number}</h3>
              <button onClick={() => { setShowQR(null); setQrData(null); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={"data:image/png;base64," + qrData.qr_image_base64} alt="QR" className="w-48 h-48" />
            </div>
            <a href={"data:image/png;base64," + qrData.qr_image_base64} download={"qr-" + qrData.batch_number + ".png"} className="w-full flex items-center justify-center gap-2 bg-[#0A2647] text-white py-3 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm">
              Download QR Code
            </a>
          </motion.div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Add Batch Number</h3>
              <button onClick={() => setShowAdd(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              {[["batch_number","Batch Number","text"],["manufacture_date","Manufacture Date","date"],["expiry_date","Expiry Date","date"],["quantity","Quantity","number"]].map(([key,label,type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2647]" />
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full bg-[#0A2647] text-white py-3 rounded-xl font-semibold hover:bg-[#1B4F72] transition disabled:opacity-50">{saving ? "Saving..." : "Add Batch"}</button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3"><Package className="w-5 h-5 text-blue-600" /></div>
          <p className="text-sm text-gray-400 font-medium">Total Batches</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">{allBatches.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
          <p className="text-sm text-gray-400 font-medium">Active Batches</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">{allBatches.filter(b => b.status === "active").length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
          <p className="text-sm text-gray-400 font-medium">Expiring Soon</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">{allBatches.filter(b => b.is_expired).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All Batches</h2>
            <p className="text-sm text-gray-400 mt-0.5">Only approved drugs can have batches</p>
          </div>
          <div className="flex gap-2">
            {drugs.map(d => (
              <button key={d.id} onClick={() => setShowAdd(d.id)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
                <Plus className="w-4 h-4" /> {d.name}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-700"></div></div>
          ) : allBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Package className="w-16 h-16 mb-4" />
              <p className="text-gray-400 font-medium text-lg">No batches yet</p>
              <p className="text-sm text-gray-400 mt-1">Add a batch to an approved drug above</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{["Drug","Batch Number","Manufactured","Expires","Quantity","Status","QR Code"].map(h => <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {allBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5 font-semibold text-gray-900">{batch.drug_name}</td>
                    <td className="py-4 px-5 font-mono text-sm text-gray-700">{batch.batch_number}</td>
                    <td className="py-4 px-5 text-gray-500">{batch.manufacture_date}</td>
                    <td className="py-4 px-5 text-gray-500">{batch.expiry_date}</td>
                    <td className="py-4 px-5 text-gray-500">{batch.quantity}</td>
                    <td className="py-4 px-5">
                      <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (batch.is_expired ? "bg-red-50 text-red-700 border-red-200" : batch.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-700 border-gray-200")}>
                        {batch.is_expired ? "Expired" : batch.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <button onClick={() => handleQR(batch.id)} className="flex items-center gap-1 text-xs bg-[#0A2647] text-white px-3 py-1.5 rounded-lg hover:bg-[#1B4F72] transition">
                        <QrCode className="w-3 h-3" /> Generate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

