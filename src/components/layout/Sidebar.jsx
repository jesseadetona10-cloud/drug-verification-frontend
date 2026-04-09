import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Pill, Package, Bell, Search, ClipboardList, BarChart2, Users, LogOut, Shield, UserCircle, Sun, Moon, X } from "lucide-react";

const menuItems = {
  manufacturer: [
    { path: "/manufacturer", label: "Dashboard", icon: LayoutDashboard },
    { path: "/manufacturer/drugs", label: "My Drugs", icon: Pill },
    { path: "/manufacturer/batches", label: "Batches", icon: Package },
    { path: "/manufacturer/alerts", label: "Alerts", icon: Bell },
  ],
  pharmacist: [
    { path: "/pharmacist", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pharmacist/verify", label: "Verify Drug", icon: Search },
    { path: "/pharmacist/history", label: "History", icon: ClipboardList },
  ],
  regulator: [
    { path: "/regulator", label: "Dashboard", icon: LayoutDashboard },
    { path: "/regulator/drugs", label: "All Drugs", icon: Pill },
    { path: "/regulator/alerts", label: "Alerts", icon: Bell },
    { path: "/regulator/analytics", label: "Analytics", icon: BarChart2 },
    { path: "/regulator/users", label: "Users", icon: Users },
  ],
  patient: [
    { path: "/patient", label: "Verify Drug", icon: Search },
    { path: "/patient/history", label: "History", icon: ClipboardList },
  ],
};

const roleGradients = {
  manufacturer: "from-[#0A2647] to-[#1B4F72]",
  pharmacist: "from-emerald-900 to-emerald-700",
  regulator: "from-purple-900 to-purple-700",
  patient: "from-rose-900 to-rose-700",
};

export default function Sidebar({ onClose }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const items = menuItems[user?.role] || [];
  const gradient = roleGradients[user?.role] || "from-gray-900 to-gray-700";

  return (
    <div className={"w-64 min-h-screen bg-gradient-to-b " + gradient + " flex flex-col shadow-2xl"}>
      <div className="p-6 border-b border-white border-opacity-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-white" />
            <span className="text-xl font-bold text-white">DrugVerify</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white opacity-50 hover:opacity-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.company_name || user?.email}</p>
            <p className="text-xs text-white opacity-50 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs text-white opacity-30 uppercase tracking-widest px-3 mb-3 font-semibold">Navigation</p>
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} end onClick={onClose}
            className={({ isActive }) =>
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 " +
              (isActive ? "bg-white bg-opacity-20 text-white font-semibold shadow" : "text-white opacity-50 hover:bg-white hover:bg-opacity-10 hover:opacity-100")
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white border-opacity-10 space-y-1">
        <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 text-white opacity-50 hover:opacity-100 hover:bg-white hover:bg-opacity-10 rounded-xl transition">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-sm font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <NavLink to="/profile" onClick={onClose} className={({ isActive }) => "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition " + (isActive ? "bg-white bg-opacity-20 text-white font-semibold" : "text-white opacity-50 hover:opacity-100 hover:bg-white hover:bg-opacity-10")}>
          <UserCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Profile</span>
        </NavLink>
        <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 text-white opacity-50 hover:opacity-100 hover:bg-white hover:bg-opacity-10 rounded-xl transition">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
