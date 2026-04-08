import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import API from "../utils/api";
import { Users, Search } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter ? "/auth/users/?role=" + roleFilter : "/auth/users/";
      const res = await API.get(url);
      setUsers(res.data.results || res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || (u.company_name || "").toLowerCase().includes(search.toLowerCase()));

  const roleColors = {
    manufacturer: "bg-blue-50 text-blue-700 border-blue-200",
    pharmacist: "bg-emerald-50 text-emerald-700 border-emerald-200",
    regulator: "bg-purple-50 text-purple-700 border-purple-200",
    wholesaler: "bg-amber-50 text-amber-700 border-amber-200",
    patient: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <DashboardLayout title="Users" subtitle="Manage all registered users on the platform">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by email or company..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="regulator">Regulator</option>
            <option value="wholesaler">Wholesaler</option>
            <option value="patient">Patient</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-purple-700"></div></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-gray-400 font-medium text-lg">No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["User","Company","Role","Phone","License","Status","Joined"].map(h => <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0A2647] flex items-center justify-center text-white text-xs font-bold">{user.email[0].toUpperCase()}</div>
                        <span className="font-medium text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-gray-500">{user.company_name || "-"}</td>
                    <td className="py-4 px-5"><span className={"px-3 py-1 rounded-full text-xs font-semibold border capitalize " + (roleColors[user.role] || roleColors.patient)}>{user.role}</span></td>
                    <td className="py-4 px-5 text-gray-500">{user.phone || "-"}</td>
                    <td className="py-4 px-5 text-gray-500 font-mono text-xs">{user.license_number || "-"}</td>
                    <td className="py-4 px-5"><span className={"px-3 py-1 rounded-full text-xs font-semibold border " + (user.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>{user.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="py-4 px-5 text-gray-500">{new Date(user.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

