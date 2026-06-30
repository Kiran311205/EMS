import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/dashboard/Dashboard'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import EmployeeForm from './pages/employees/EmployeeForm'
import AssetList from './pages/assets/AssetList'
import BankList from './pages/bank/BankList'
import SalaryList from './pages/salary/SalaryList'
import AttendancePage from './pages/attendance/AttendancePage'

import ReportsPage from './pages/reports/ReportsPage'
import UsersPage from './pages/users/UsersPage'

import ProfilePage from './pages/auth/ProfilePage'
import DepartmentsPage from './pages/employees/DepartmentsPage'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="assets" element={<AssetList />} />
        <Route path="bank" element={<BankList />} />
        <Route path="salary" element={<SalaryList />} />
        <Route path="attendance" element={<AttendancePage />} />

        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<PrivateRoute adminOnly><UsersPage /></PrivateRoute>} />

        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
