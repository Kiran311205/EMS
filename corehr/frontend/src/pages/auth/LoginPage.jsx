import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-primary-900 to-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">CoreHR</h2>
            <p className="text-slate-400 text-xs">Employee Management System</p>
          </div>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Streamline Your <br />
            <span className="text-primary-400">HR Operations</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage employees, track assets, process salaries, and generate reports — all in one place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: '👥', label: 'Employee Management' },
              { icon: '💻', label: 'Asset Tracking' },
              { icon: '💰', label: 'Salary Processing' },
              { icon: '📊', label: 'Reports & Analytics' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">© 2024 CoreHR. All rights reserved.</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">CoreHR</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                id="goto-signup-link"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
