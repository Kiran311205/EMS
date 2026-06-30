import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, UserCheck, Laptop, CreditCard, IndianRupee,
  CalendarCheck, FileBarChart, ShieldCheck,
  Menu, X, LogOut, User, ChevronDown, Building2, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/employees', label: 'Employees', icon: UserCheck },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/assets', label: 'Assets', icon: Laptop },
  { to: '/bank', label: 'Bank Details', icon: CreditCard, hrOnly: true },
  { to: '/salary', label: 'Salary', icon: IndianRupee },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },

  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/users', label: 'User Management', icon: Users, adminOnly: true },

]

function SidebarLink({ item, collapsed, onClick }) {
  const { isAdmin } = useAuth()
  if (item.adminOnly && !isAdmin) return null
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200'
          : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`
      }
    >
      <Icon size={17} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white border-r border-gray-100 shadow-xl shadow-gray-200/60
        transition-all duration-300 ease-in-out
        w-64 lg:static lg:flex lg:w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-bold text-lg tracking-tight">SSKATT</span>
              <p className="text-gray-400 text-[10px] -mt-0.5 font-medium uppercase tracking-widest">Management System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-gray-100">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            ${isAdmin
              ? 'bg-violet-100 text-violet-700'
              : 'bg-teal-100 text-teal-700'}`}>
            {isAdmin ? '⚡ Admin' : '👤 HR Manager'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => navigate('/profile')}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow shadow-indigo-200">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm font-semibold truncate">{user?.full_name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-gray-800 font-semibold">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
            >
              <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block">{user?.full_name}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
