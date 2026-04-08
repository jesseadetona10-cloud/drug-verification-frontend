import { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";
import { Camera, X, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function QRScanner({ onScan, onClose }) {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScanning(false);
          setScanResult(decodedText);
          onScan(decodedText);
        },
        (error) => {
          console.warn(`QR scan error: ${error}`);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning, onScan]);

  const resetScanner = () => {
    setScanResult(null);
    setScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {scanning && !scanResult && (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <p className="text-sm text-gray-500 text-center mt-4">
                Position the QR code within the frame to scan
              </p>
            </div>
          )}

          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                QR Code Scanned!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Code: {scanResult.substring(0, 50)}...
              </p>
              <button
                onClick={resetScanner}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Scan Another
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}