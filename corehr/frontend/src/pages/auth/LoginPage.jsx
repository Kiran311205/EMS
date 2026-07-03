import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Brand tokens (kept from existing identity, tightened):
// --ink:    #0f172a   primary text
// --sub:    #5b6472   secondary text
// --line:   #e3e1d9   hairline borders
// --paper:  #f6f4ee   page background (warm, not generic slate)
// --brand:  #0b6e4f   primary green (CTA only — not reused for labels/eyebrows)
// --amber:  #d97f17   single accent, used once
//
// Type: 'Plus Jakarta Sans' for everything (display + body + UI) at varied
// weights, so headline and form never visually disagree.

const activity = [
  { label: 'Leave request approved', meta: 'Priya M. · Engineering', time: '2m' },
  { label: 'Asset reassigned', meta: 'Laptop · DEL-0231', time: '14m' },
  { label: 'Payroll run completed', meta: '248 employees · June', time: '1h' },
]

const autofillFix = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
    -webkit-text-fill-color: #0f172a;
    caret-color: #0f172a;
    transition: background-color 9999s ease-in-out 0s;
  }
`

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')
    if (!form.username || !form.password) {
      setFieldError('Enter your username and password to continue.')
      return
    }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      setFieldError(err?.response?.data?.detail || 'That username or password didn\u2019t match our records.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#f6f4ee] text-[#0f172a]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}
    >
      <style>{autofillFix}</style>
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left — brand & live context panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0c2a22] p-12 text-white lg:flex xl:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <div className="relative inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <ShieldCheck size={19} strokeWidth={2.25} />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">SSKATT</h2>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Employee Operations Console</p>
            </div>
          </div>

          <div className="relative max-w-lg space-y-7">
            <h1 className="text-[2.75rem] font-extrabold leading-[1.08] tracking-tight xl:text-[3.25rem]">
              Every employee record,
              <br />
              one source of truth.
            </h1>
            <p className="text-[15px] leading-relaxed text-white/65">
              People, assets, leave, attendance and payroll — run from a single
              console built for the decisions you make before 9am.
            </p>

            <ul className="space-y-2 pt-1">
              {['Employee lifecycle', 'Asset custody', 'Salary control', 'Actionable reports'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                  <CheckCircle2 size={15} className="shrink-0 text-[#3fae84]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Signature element: live activity ledger — real product context, not decoration */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              Happening now
            </p>
            <div className="space-y-3">
              {activity.map((a) => (
                <div key={a.label} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white/90">{a.label}</p>
                    <p className="truncate text-[12px] text-white/45">{a.meta}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-white/35">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right — auth */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[400px] border-t border-[#0b6e4f]/15 pt-8 lg:border-t-0 lg:pt-0">
            <div className="mb-6 h-px w-12 bg-[#0b6e4f]/30 hidden lg:block" />
            <div className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b6e4f]">
                <ShieldCheck size={17} className="text-white" />
              </div>
              <h2 className="font-bold text-xl text-gray-900">SSKATT</h2>
            </div>

            <div className="mb-8">
              <h2 className="text-[1.75rem] font-extrabold tracking-tight">Sign in</h2>
              <p className="mt-1.5 text-[14px] text-[#5b6472]">
                Welcome back — enter your details to open the console.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="username" className="mb-1.5 block text-[13px] font-semibold text-[#334155]">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full rounded-xl border border-[#dcdad1] bg-white py-2.5 pl-10 pr-3.5 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-colors focus:border-[#0b6e4f] focus:ring-2 focus:ring-[#0b6e4f]/15"
                    placeholder="e.g. priya.menon"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-[13px] font-semibold text-[#334155]">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[12.5px] font-medium text-[#5b6472] hover:text-[#0b6e4f]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-xl border border-[#dcdad1] bg-white py-2.5 pl-10 pr-10 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-colors focus:border-[#0b6e4f] focus:ring-2 focus:ring-[#0b6e4f]/15"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {fieldError && (
                <p className="rounded-lg bg-[#fdf0ed] px-3 py-2 text-[13px] font-medium text-[#b3401f]">
                  {fieldError}
                </p>
              )}

              <label className="flex select-none items-center gap-2 pt-1 text-[13px] text-[#475569]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#cbd5e1] text-[#0b6e4f] accent-[#0b6e4f] focus:ring-[#0b6e4f]/30"
                />
                Keep me signed in on this device
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6e4f] py-3 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#08563e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in
                  </>
                ) : (
                  <>
                    Continue to dashboard
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-[13.5px] text-[#5b6472]">
              Don&rsquo;t have an account?{' '}
              <Link id="goto-signup-link" to="/signup" className="font-semibold text-[#0b6e4f] hover:text-[#08563e]">
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}