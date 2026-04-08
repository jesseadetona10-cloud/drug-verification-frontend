import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../utils/api";

const severityConfig = {
  critical: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
  high: { color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: AlertTriangle },
  medium: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  low: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: CheckCircle },
};

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await API.get("/alerts/?is_resolved=false");
      setAlerts(res.data.results || res.data);
    } catch(e) { console.error(e); }
  };

  const resolveAlert = async (id) => {
    try {
      await API.post(`/alerts/${id}/resolve/`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch(e) { console.error(e); }
  };

  const unread = alerts.filter(a => !a.is_resolved).length;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">{unread} unread</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <Bell className="w-10 h-10 mb-2" />
                  <p className="text-gray-400 text-sm">No notifications</p>
                </div>
              ) : alerts.map(alert => {
                const cfg = severityConfig[alert.severity] || severityConfig.medium;
                return (
                  <div key={alert.id} className={"m-3 p-3 rounded-xl border " + cfg.bg}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-2">
                        <cfg.icon className={"w-4 h-4 mt-0.5 flex-shrink-0 " + cfg.color} />
                        <div>
                          <p className={"text-sm font-bold " + cfg.color}>{alert.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => resolveAlert(alert.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
