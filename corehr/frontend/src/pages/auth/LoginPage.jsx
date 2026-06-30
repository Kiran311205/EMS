import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, Lock, User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
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
              HR, reimagined
              <span className="block text-[#0b6e4f]">for daily execution.</span>
            </h1>
            <p className="max-w-xl text-lg text-[#475569] leading-relaxed">
              Manage people, assets, leaves, attendance, and payroll in one focused workspace built for fast, confident decisions.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-xl">
              {['Employee lifecycle', 'Asset custody', 'Salary control', 'Actionable reports'].map((item) => (
                <div key={item} className="rounded-xl border border-[#0b6e4f]/15 bg-white/85 px-3 py-2.5 text-sm font-medium text-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#0b6e4f]" />
                    <span>{item}</span>
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

            <div className="rounded-3xl border border-[#0f172a]/10 bg-white/92 p-7 sm:p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b6e4f]">Secure Access</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0f172a]" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
                  Sign In
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">Enter your credentials to continue to the dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-2">Username</label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="input-field pl-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#334155] mb-2">Password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-10 pr-10 !py-2.5 !rounded-xl !border-[#cbd5e1] focus:!ring-[#0b6e4f]/30"
                      placeholder="Enter your password"
                      autoComplete="current-password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0b6e4f] hover:bg-[#08563e] text-white font-semibold py-3 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Continue to Dashboard
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[#64748b]">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    id="goto-signup-link"
                    className="text-[#0b6e4f] hover:text-[#08563e] font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
