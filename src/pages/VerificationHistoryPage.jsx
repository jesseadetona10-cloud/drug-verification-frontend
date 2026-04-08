import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  MapPin
} from "lucide-react";

export default function VerificationHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await API.get("/verification/history/");
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch verification history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case "authentic":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "counterfeit":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "expired":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "recalled":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "not_found":
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getResultBadge = (result) => {
    const colors = {
      authentic: "bg-green-100 text-green-800",
      counterfeit: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800",
      recalled: "bg-red-100 text-red-800",
      not_found: "bg-gray-100 text-gray-800"
    };
    return colors[result] || "bg-gray-100 text-gray-800";
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.scanned_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.batch && log.batch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = !filterResult || log.result === filterResult;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout title="Verification History">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Verification History" subtitle="Track all your drug verification attempts">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by batch number or drug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Results</option>
                <option value="authentic">Authentic</option>
                <option value="counterfeit">Counterfeit</option>
                <option value="expired">Expired</option>
                <option value="recalled">Recalled</option>
                <option value="not_found">Not Found</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Verification Logs ({filteredLogs.length})
            </h2>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No verifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filterResult ? "Try adjusting your search or filters." : "Start verifying drugs to see your history here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getResultIcon(log.result)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultBadge(log.result)}`}>
                            {log.result.charAt(0).toUpperCase() + log.result.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(log.verified_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Batch:</strong> {log.scanned_code}</p>
                          {log.batch && <p><strong>Drug:</strong> {log.batch}</p>}
                          {log.location && (
                            <p className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {log.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}