import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { BarChart2, Pill, Bell, TrendingUp, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#10B981","#EF4444","#F59E0B","#3B82F6","#8B5CF6"];

function StatCard({ title, value, icon: Icon, gradient, delay }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}} className={"relative overflow-hidden rounded-2xl p-6 text-white shadow-lg " + gradient}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      <div className="relative">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-white" /></div>
        <p className="text-sm font-medium text-white text-opacity-80 mb-1">{title}</p>
        <p className="text-4xl font-extrabold">{value}</p>
      </div>
    </motion.div>
  );
}

export default function RegulatorDashboard() {
  const [stats, setStats] = useState({});
  const [verStats, setVerStats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [pendingDrugs, setPendingDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s,v,a,d,p] = await Promise.all([
        API.get("/analytics/dashboard/"),
        API.get("/analytics/verifications/"),
        API.get("/alerts/"),
        API.get("/drugs/"),
        API.get("/drugs/pending/"),
      ]);
      setStats(s.data); setVerStats(v.data); setAlerts(a.data); setDrugs(d.data); setPendingDrugs(p.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const approveDrug = async (id) => {
    try { await API.post("/drugs/" + id + "/approve/"); fetchData(); }
    catch(e) { console.error(e); }
  };

  const rejectDrug = async (id) => {
    try { await API.post("/drugs/" + id + "/reject/"); fetchData(); }
    catch(e) { console.error(e); }
  };

  const resolveAlert = async (id) => {
    try { await API.post("/alerts/" + id + "/resolve/"); fetchData(); }
    catch(e) { console.error(e); }
  };

  if (loading) return <DashboardLayout title="Regulator Dashboard"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-purple-700"></div></div></DashboardLayout>;

  return (
    <DashboardLayout title="Regulator Dashboard" subtitle="Monitor all drugs, alerts and verifications across the system">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Drugs" value={stats.total_drugs ?? 0} icon={Pill} gradient="bg-gradient-to-br from-[#0A2647] to-[#2E86C1]" delay={0} />
        <StatCard title="Pending Approval" value={pendingDrugs.length} icon={Clock} gradient="bg-gradient-to-br from-amber-500 to-amber-700" delay={0.1} />
        <StatCard title="Verifications" value={stats.total_verifications ?? 0} icon={TrendingUp} gradient="bg-gradient-to-br from-emerald-600 to-emerald-400" delay={0.2} />
        <StatCard title="Unresolved Alerts" value={stats.unresolved_alerts ?? 0} icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-600 to-rose-400" delay={0.3} />
      </div>

      <div className="flex gap-2 mb-6">
        {["overview","pending","drugs","alerts"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={"px-4 py-2 rounded-xl text-sm font-semibold capitalize transition " + (activeTab === tab ? "bg-[#0A2647] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300")}>
            {tab} {tab === "pending" && pendingDrugs.length > 0 && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingDrugs.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary-700" /> Verification Results</h2>
            {verStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={verStats} dataKey="count" nameKey="result" cx="50%" cy="50%" outerRadius={90} label={({result,percent}) => result + " " + (percent*100).toFixed(0) + "%"}>{verStats.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-48 text-gray-300"><p>No verification data yet</p></div>}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-red-500" /> Active Alerts</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {alerts.filter(a => !a.is_resolved).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300"><CheckCircle className="w-10 h-10 mb-2" /><p className="text-gray-400">No active alerts</p></div>
              ) : alerts.filter(a => !a.is_resolved).map(alert => (
                <div key={alert.id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{alert.title}</p>
                    <span className="text-xs text-gray-400 capitalize">{alert.severity} - {alert.alert_type}</span>
                  </div>
                  <button onClick={() => resolveAlert(alert.id)} className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition font-medium">Resolve</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Pending Drug Approvals</h2>
            <p className="text-sm text-gray-400 mt-0.5">{pendingDrugs.length} drug{pendingDrugs.length !== 1 ? "s" : ""} awaiting your approval</p>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingDrugs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <CheckCircle className="w-16 h-16 mb-4" />
                <p className="text-gray-400 font-medium text-lg">No pending approvals</p>
              </div>
            ) : pendingDrugs.map(drug => (
              <div key={drug.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{drug.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                  </div>
                  <p className="text-sm text-gray-500">NAFDAC: <span className="font-mono">{drug.nafdac_number}</span> | {drug.dosage_form} | {drug.strength}</p>
                  <p className="text-sm text-gray-400 mt-0.5">Manufacturer: {drug.manufacturer_name}</p>
                  {drug.description && <p className="text-sm text-gray-400 mt-1 italic">{drug.description}</p>}
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => approveDrug(drug.id)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition font-medium text-sm">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => rejectDrug(drug.id)} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition font-medium text-sm">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "drugs" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">All Drugs</h2>
            <p className="text-sm text-gray-400 mt-0.5">{drugs.length} drugs in the system</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{["Drug Name","NAFDAC No.","Manufacturer","Dosage Form","Status"].map(h => <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {drugs.map(drug => (
                  <tr key={drug.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5 font-semibold text-gray-900">{drug.name}</td>
                    <td className="py-4 px-5 font-mono text-xs text-gray-500">{drug.nafdac_number}</td>
                    <td className="py-4 px-5 text-gray-500">{drug.manufacturer_name}</td>
                    <td className="py-4 px-5 text-gray-500">{drug.dosage_form}</td>
                    <td className="py-4 px-5">
                      <span className={"px-3 py-1 rounded-full text-xs font-semibold border " +
                        (drug.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        drug.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        drug.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-gray-50 text-gray-700 border-gray-200")}>
                        {drug.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">All Alerts</h2>
          </div>
          <div className="p-6 space-y-3">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300"><Bell className="w-16 h-16 mb-4" /><p className="text-gray-400 font-medium">No alerts</p></div>
            ) : alerts.map(alert => (
              <div key={alert.id} className={"border rounded-xl p-4 flex justify-between items-start " + (alert.is_resolved ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200")}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{alert.title}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">{alert.severity}</span>
                  </div>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                {!alert.is_resolved && (
                  <button onClick={() => resolveAlert(alert.id)} className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition font-medium ml-4">Resolve</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
