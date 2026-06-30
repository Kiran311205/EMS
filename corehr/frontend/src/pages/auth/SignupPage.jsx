import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, Lock, User, Mail, Phone, UserPlus, ArrowLeft, CheckCircle, CheckCircle2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    role: 'hr',
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
    const required = ['full_name', 'username', 'email', 'role', 'password', 'confirm_password']
    for (const key of required) {
      if (!form[key].trim()) return toast.error('Please fill in all required fields')
    }
    if (!form.email.toLowerCase().endsWith('@sskatt.com')) {
      return toast.error('Please use your company email (@sskatt.com)')
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
    <div className="min-h-screen relative overflow-hidden bg-[#f6f8f4]">
      <div className="absolute -top-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-[#0b6e4f]/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#ff9f1c]/10 blur-3xl" />

      <div className="relative min-h-screen grid lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#0b6e4f]/20 bg-white/80 px-4 py-3 backdrop-blur-sm w-fit">
            <div className="h-10 w-10 rounded-xl bg-[#0b6e4f] flex items-center justify-center shadow-lg shadow-[#0b6e4f]/20">
              <ShieldCheck size={21} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">SSKATT</p>
              <p className="text-xs text-[#64748b]">Employee Operations Console</p>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.04] tracking-tight text-[#0f172a]" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
              Build your
              <span className="block text-[#0b6e4f]">HR workspace.</span>
            </h1>
            <p className="max-w-xl text-lg text-[#475569] leading-relaxed">
              Register your team account to manage people operations with structure, speed, and full visibility.
            </p>

            <div className="space-y-3 max-w-xl">
              {['Use your company email', 'Choose role: HR or Admin', 'Wait for admin activation'].map((step) => (
                <div key={step} className="rounded-xl border border-[#0b6e4f]/15 bg-white/85 px-3 py-2.5 text-sm font-medium text-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#0b6e4f]" />
                    <span>{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-sm text-[#64748b]">
            <Sparkles size={14} className="text-[#ff9f1c]" />
            <span>Designed for speed, clarity, and compliance</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 inline-flex items-center gap-2 rounded-xl border border-[#0b6e4f]/20 bg-white px-3 py-2">
              <div className="h-8 w-8 rounded-lg bg-[#0b6e4f] flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-semibold text-[#0f172a]">SSKATT</span>
            </div>

            {success ? (
              <div className="rounded-3xl border border-[#0f172a]/10 bg-white/92 p-8 text-center shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={64} className="text-[#0b6e4f]" />
                </div>
                <h2 className="text-2xl font-black text-[#0f172a]" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
                  Account Created!
                </h2>
                <p className="text-[#64748b] mt-2">
                  Your request is submitted for admin approval. You can sign in once activation is complete.
                </p>
                <p className="text-sm text-[#94a3b8] mt-3">Redirecting to login in a moment...</p>
                <Link
                  to="/login"
                  className="inline-block mt-4 text-[#0b6e4f] hover:text-[#08563e] font-semibold text-sm"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#0f172a]/10 bg-white/92 p-7 sm:p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                <div className="mb-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b6e4f]">Registration</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0f172a]" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
                    Create Account
                  </h2>
                  <p className="mt-2 text-sm text-[#64748b]">Fill details to request access to CoreHR.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-full-name"
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="input-field pl-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="Enter full name"
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserPlus size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-username"
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="input-field pl-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="Choose a username"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Company Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field pl-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="you@sskatt.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Registering As <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="signup-role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="input-field !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                    >
                      <option value="hr">HR Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-field pl-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-password"
                        type={showPwd ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="input-field pl-10 pr-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                      >
                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPwd ? 'text' : 'password'}
                        name="confirm_password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        className="input-field pl-10 pr-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                      >
                        {showConfirmPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="signup-submit-btn"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0b6e4f] hover:bg-[#08563e] text-white font-semibold py-3 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Creating account...
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
                  <p className="text-sm text-[#64748b]">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-[#0b6e4f] hover:text-[#08563e] font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowLeft size={14} />
                      Back to Sign In
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
