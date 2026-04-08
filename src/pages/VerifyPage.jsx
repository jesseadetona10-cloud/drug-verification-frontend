import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import QRScanner from "../components/ui/QRScanner";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  MapPin,
  ArrowLeft
} from "lucide-react";

export default function VerifyPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleScan = async (scannedData) => {
    setLoading(true);
    try {
      const response = await API.post("/verification/verify/", {
        scanned_data: scannedData,
        location: "Web App"
      });
      setVerificationResult(response.data);
    } catch (error) {
      setVerificationResult({
        result: "error",
        detail: error.response?.data?.detail || "Verification failed"
      });
    } finally {
      setLoading(false);
      setShowScanner(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualCode.trim()) return;
    setLoading(true);
    try {
      const response = await API.post("/verification/verify/", {
        scanned_code: manualCode,
        location: "Web App"
      });
      setVerificationResult(response.data);
    } catch (error) {
      setVerificationResult({
        result: "error",
        detail: error.response?.data?.detail || "Verification failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case "authentic":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "counterfeit":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "expired":
        return <Clock className="w-12 h-12 text-orange-500" />;
      case "recalled":
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case "not_found":
        return <XCircle className="w-12 h-12 text-gray-500" />;
      default:
        return <XCircle className="w-12 h-12 text-gray-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "authentic":
        return "text-green-600 bg-green-50 border-green-200";
      case "counterfeit":
        return "text-red-600 bg-red-50 border-red-200";
      case "expired":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "recalled":
        return "text-red-600 bg-red-50 border-red-200";
      case "not_found":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setManualCode("");
  };

  return (
    <DashboardLayout title="Drug Verification" subtitle="Scan QR codes or enter batch numbers to verify drug authenticity">
      <div className="max-w-2xl mx-auto">
        {!verificationResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* QR Scan Option */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Scan QR Code
              </h2>
              <p className="text-gray-600 mb-6">
                Use your camera to scan the QR code on the drug packaging
              </p>
              <button
                onClick={() => setShowScanner(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                <Search className="w-5 h-5 inline mr-2" />
                Start Scanning
              </button>
            </div>

            {/* Manual Entry Option */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Or Enter Batch Number Manually
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter batch number..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualVerify()}
                />
                <button
                  onClick={handleManualVerify}
                  disabled={!manualCode.trim() || loading}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Verification Result */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl shadow-lg border-2 p-8 text-center ${getResultColor(verificationResult.result)}`}
          >
            {getResultIcon(verificationResult.result)}

            <h2 className="text-2xl font-bold mt-4 mb-2 capitalize">
              {verificationResult.result === "authentic" ? "Authentic Drug" :
               verificationResult.result === "counterfeit" ? "Counterfeit Alert" :
               verificationResult.result === "expired" ? "Expired Drug" :
               verificationResult.result === "recalled" ? "Recalled Drug" :
               "Drug Not Found"}
            </h2>

            <p className="text-lg mb-6">
              {verificationResult.result === "authentic" && "This drug has been verified as authentic and safe to use."}
              {verificationResult.result === "counterfeit" && "This drug has been identified as counterfeit. Do not use!"}
              {verificationResult.result === "expired" && "This drug has expired. Please dispose of it properly."}
              {verificationResult.result === "recalled" && "This drug batch has been recalled. Do not use!"}
              {verificationResult.result === "not_found" && "This batch number was not found in our database."}
              {verificationResult.result === "error" && verificationResult.detail}
            </p>

            {verificationResult.drug && (
              <div className="bg-white bg-opacity-50 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Drug Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Drug:</span>
                    <p className="font-medium">{verificationResult.drug}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Batch:</span>
                    <p className="font-medium">{verificationResult.batch}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetVerification}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition border border-gray-200"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Verify Another
              </button>
              <button
                onClick={() => navigate(`/${user.role}/history`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                View History
              </button>
            </div>
          </motion.div>
        )}

        {showScanner && (
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}