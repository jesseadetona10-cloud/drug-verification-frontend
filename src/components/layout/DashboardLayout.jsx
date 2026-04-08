import Sidebar from "./Sidebar";
import { Search, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../ui/NotificationBell";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, darkMode, toggleDarkMode } = useAuth();

  return (
    <div className={darkMode ? "dark" : ""}>
      <Toaster position="top-right" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div>
              {title && <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 dark:text-white" />
              </div>
              <button onClick={toggleDarkMode} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#0A2647] flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.company_name || user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="bg-gradient-to-r from-[#0A2647] to-[#1B4F72] px-8 py-3">
            <p className="text-white text-sm">
              👋 Welcome back, <span className="font-bold">{user?.company_name || user?.email}</span>!
              <span className="text-blue-200 ml-2">Logged in as <span className="capitalize font-semibold">{user?.role}</span></span>
            </p>
          </div>

          <main className="flex-1 overflow-auto p-8 dark:bg-gray-900">{children}</main>
        </div>
      </div>
    </div>
  );
}
