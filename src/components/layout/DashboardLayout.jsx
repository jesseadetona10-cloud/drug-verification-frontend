import { useState } from "react";
import Sidebar from "./Sidebar";
import { Sun, Moon, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../ui/NotificationBell";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, darkMode, toggleDarkMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <Toaster position="top-right" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={"fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:static lg:translate-x-0 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                {title && <h1 className="text-base md:text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>}
                {subtitle && <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden md:block">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button onClick={toggleDarkMode} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0A2647] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.company_name || user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="bg-gradient-to-r from-[#0A2647] to-[#1B4F72] px-4 md:px-8 py-3">
            <p className="text-white text-xs md:text-sm">
              👋 Welcome back, <span className="font-bold">{user?.company_name || user?.email}</span>!
              <span className="text-blue-200 ml-2 hidden md:inline">Logged in as <span className="capitalize font-semibold">{user?.role}</span></span>
            </p>
          </div>

          <main className="flex-1 overflow-auto p-4 md:p-8 dark:bg-gray-900">{children}</main>
        </div>
      </div>
    </div>
  );
}
