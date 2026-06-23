import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, Lock, User, Mail, Phone, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password']
    for (const key of required) {
      if (!form[key].trim()) return toast.error('Please fill in all required fields')
    }
    if (form.password !== form.confirm_password) {
      return toast.error('Passwords do not match')
    }
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      await authAPI.register(form)
      setSuccess(true)
      toast.success('Account created! Await admin approval.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        const firstError = Object.values(data)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        toast.error('Registration failed. Please try again.')
      }
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
            Join the <br />
            <span className="text-primary-400">CoreHR Platform</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Create your account to get started. Your account will be reviewed and activated by an administrator.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '✅', label: 'Fill in your details below' },
              { icon: '⏳', label: 'Wait for admin activation' },
              { icon: '🚀', label: 'Log in and start managing HR' },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3">
                <span className="text-lg">{step.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">© 2024 CoreHR. All rights reserved.</p>
      </div>

      {/* Right panel — signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">CoreHR</h2>
          </div>

          {success ? (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
              <p className="text-gray-500 mb-6">
                Your account has been submitted for admin review. You'll be able to log in once it's activated.
              </p>
              <p className="text-sm text-gray-400">Redirecting to login in a moment…</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Go to Login →
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 mt-2">Fill in your details to register</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="signup-first-name"
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="First name"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="signup-last-name"
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserPlus size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="signup-username"
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Choose a username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="signup-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="signup-password"
                      type={showPwd ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPwd ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating account…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus size={18} />
                      Create Account
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
