import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Bell, CheckCircle, AlertTriangle, Plus, X } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [form, setForm] = useState({ drug: "", alert_type: "counterfeit", severity: "high", title: "", message: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [a, d] = await Promise.all([API.get("/alerts/"), API.get("/drugs/")]);
      setAlerts(a.data); setDrugs(d.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await API.post("/alerts/", form); setShowAdd(false); fetchData(); }
    catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const resolveAlert = async (id) => {
    try { await API.post("/alerts/" + id + "/resolve/"); fetchData(); }
    catch(e) { console.error(e); }
  };

  const severityColors = {
    low: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <DashboardLayout title="Alerts" subtitle="Manage drug alerts and counterfeit reports">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All Alerts</h2>
            <p className="text-sm text-gray-400 mt-0.5">{alerts.filter(a => !a.is_resolved).length} unresolved alerts</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-[#0A2647] text-white px-5 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm">
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Cancel" : "Create Alert"}
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="border-b border-gray-100 p-6 bg-blue-50">
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Drug</label>
                <select value={form.drug} onChange={e=>setForm({...form,drug:e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select drug</option>
                  {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Alert Type</label>
                <select value={form.alert_type} onChange={e=>setForm({...form,alert_type:e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="counterfeit">Counterfeit</option>
                  <option value="recall">Recall</option>
                  <option value="expiry">Expiry</option>
                  <option value="suspicious">Suspicious</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Severity</label>
                <select value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Title</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Message</label>
                <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required rows={3} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="bg-[#0A2647] text-white px-6 py-2.5 rounded-xl hover:bg-[#1B4F72] transition font-medium text-sm disabled:opacity-50">{saving ? "Saving..." : "Create Alert"}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="p-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-700"></div></div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Bell className="w-16 h-16 mb-4" />
              <p className="text-gray-400 font-medium text-lg">No alerts yet</p>
            </div>
          ) : alerts.map(alert => (
            <motion.div key={alert.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={"border rounded-xl p-4 flex justify-between items-start " + (alert.is_resolved ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200")}>
              <div className="flex items-start gap-4">
                <div className={"p-2 rounded-lg " + (alert.is_resolved ? "bg-gray-100" : "bg-red-50")}>
                  {alert.is_resolved ? <CheckCircle className="w-5 h-5 text-gray-400" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{alert.title}</p>
                    <span className={"px-2 py-0.5 rounded-full text-xs font-semibold border " + (severityColors[alert.severity] || severityColors.medium)}>{alert.severity}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">{alert.alert_type}</span>
                  </div>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
              </div>
              {!alert.is_resolved && (
                <button onClick={() => resolveAlert(alert.id)} className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition font-medium whitespace-nowrap ml-4">Resolve</button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
