import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "12px",
          fontWeight: "600",
          fontSize: "14px",
        },
        success: {
          style: { background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" },
        },
        error: {
          style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
        },
      }}
    />
  );
}
