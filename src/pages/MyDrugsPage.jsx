import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Pill, Plus, X, Package, QrCode, Clock, CheckCircle, XCircle } from "lucide-react";

export default function MyDrugsPage() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBatch, setShowBatch] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [form, setForm] = useState({ name: "", generic_name: "", nafdac_number: "", description: "", dosage_form: "", strength: "" });
  const [batchForm, setBatchForm] = useState({ batch_number: "", manufacture_date: "", expiry_date: "", quantity: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDrugs(); }, []);

  const fetchDrugs = async () => {
    try { const res = await API.get("/drugs/"); setDrugs(res.data.results || res.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddDrug = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await API.post("/drugs/", form);
      setShowAdd(false);
      setForm({ name: "", generic_name: "", nafdac_number: "", description: "", dosage_form: "", strength: "" });
      fetchDrugs();
    } catch(e) { setError(e.response?.data?.nafdac_number?.[0] || "Failed to add drug"); }
    finally { setSaving(false); }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post("/drugs/" + showBatch + "/batches/", batchForm);
      setShowBatch(null);
      setBatchForm({ batch_number: "", manufacture_date: "", expiry_date: "", quantity: "" });
      fetchDrugs();
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleGenerateQR = async (batchId) => {
    try {
      const res = await API.get("/drugs/batches/" + batchId + "/qr/");
      setQrData(res.data);
      setShowQR(batchId);
    } catch(e) { console.error(e); }
  };

  const statusConfig = {
    pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Pending Approval" },
    active: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Active" },
    rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Rejected" },
    recalled: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: XCircle, label: "Recalled" },
  };

  return (
    <DashboardLayout title="My Drugs" subtitle="Register and manage your drug products">

      {showQR && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">QR Code</h3>
              <button onClick={() => { setShowQR(null); setQrData(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={"data:image/png;base64," + qrData.qr_image_base64} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">Batch: <span className="font-mono font-semibold">{qrData.batch_number}</span></p>
            <a href={"data:image/png;base64," + qrData.qr_image_base64} download={"qr-" + qrData.batch_number + ".png"} className="w-full flex items-center justify-center gap-2 bg-[#0A2647] text-white py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm">
              Download QR Code
            </a>
          </motion.div>
        </div>
      )}

      {showBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Batch Number</h3>
              <button onClick={() => setShowBatch(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              {[["batch_number","Batch Number",true,"text"],["manufacture_date","Manufacture Date",true,"date"],["expiry_date","Expiry Date",true,"date"],["quantity","Quantity",true,"number"]].map(([key,label,req,type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                  <input type={type} value={batchForm[key]} onChange={e=>setBatchForm({...batchForm,[key]:e.target.value})} required={req} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full bg-[#0A2647] text-white py-3 rounded-xl font-semibold hover:bg-[#1B4F72] transition disabled:opacity-50">{saving ? "Saving..." : "Add Batch"}</button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registered Drugs</h2>
            <p className="text-sm text-gray-400 mt-0.5">{drugs.length} drug{drugs.length !== 1 ? "s" : ""} registered</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-[#0A2647] text-white px-5 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm">
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Cancel" : "Add Drug"}
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="border-b border-gray-100 p-6 bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Drug</h3>
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">Note: New drugs require regulator approval before they become active.</p>
            {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleAddDrug} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[["name","Drug Name",true],["generic_name","Generic Name",false],["nafdac_number","NAFDAC Number",true],["dosage_form","Dosage Form",true],["strength","Strength",true],["description","Description",false]].map(([key,label,req]) => (
                <div key={key} className={key === "description" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}{req && <span className="text-red-400 ml-1">*</span>}</label>
                  <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required={req} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-6 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm disabled:opacity-50">{saving ? "Saving..." : "Submit for Approval"}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-700"></div></div>
          ) : drugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Pill className="w-16 h-16 mb-4" />
              <p className="text-gray-400 font-medium text-lg">No drugs registered yet</p>
              <p className="text-sm text-gray-400 mt-1">Click Add Drug to get started</p>
            </div>
          ) : drugs.map(drug => {
            const sc = statusConfig[drug.status] || statusConfig.pending;
            return (
              <div key={drug.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{drug.name}</h3>
                      <span className={"px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 " + sc.color}>
                        <sc.icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">NAFDAC: <span className="font-mono">{drug.nafdac_number}</span> | {drug.dosage_form} | {drug.strength}</p>
                    {drug.generic_name && <p className="text-sm text-gray-400 mt-0.5">Generic: {drug.generic_name}</p>}
                  </div>
                  {drug.status === "active" && (
                    <button onClick={() => setShowBatch(drug.id)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
                      <Package className="w-4 h-4" /> Add Batch
                    </button>
                  )}
                </div>

                {drug.status === "pending" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Awaiting regulator approval. You cannot add batches until this drug is approved.
                  </div>
                )}

                {drug.status === "rejected" && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> This drug was rejected by the regulator.
                  </div>
                )}

                {drug.batches && drug.batches.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Batches ({drug.batches.length})</p>
                    <div className="space-y-2">
                      {drug.batches.map(batch => (
                        <div key={batch.id} className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-100">
                          <div>
                            <p className="font-mono font-semibold text-sm text-gray-900">{batch.batch_number}</p>
                            <p className="text-xs text-gray-400">Expires: {batch.expiry_date} | Qty: {batch.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={"px-2 py-0.5 rounded-full text-xs font-semibold border " + (batch.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>{batch.status}</span>
                            <button onClick={() => handleGenerateQR(batch.id)} className="flex items-center gap-1 text-xs bg-[#0A2647] text-white px-3 py-1.5 rounded-lg hover:bg-[#1B4F72] transition">
                              <QrCode className="w-3 h-3" /> QR Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

