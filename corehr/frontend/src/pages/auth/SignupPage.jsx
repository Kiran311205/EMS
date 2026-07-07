import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, Lock, User, Mail, Phone, UserPlus, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'

// Shared tokens with LoginPage — keep these two files in sync.
const autofillFix = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
    -webkit-text-fill-color: #0f172a;
    caret-color: #0f172a;
    transition: background-color 9999s ease-in-out 0s;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(12px, -14px) scale(1.03); }
  }
  @keyframes floatSlower {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-16px, 10px) scale(1.05); }
  }
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.85); }
    70% { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .float-slow { animation: floatSlow 9s ease-in-out infinite; }
  .float-slower { animation: floatSlower 12s ease-in-out infinite; }
  .pop-in { animation: popIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
`

const steps = [
  { label: 'Use your company email', meta: '@sskatt.com required' },
  { label: 'Choose your role', meta: 'HR manager or admin' },
  { label: 'Wait for activation', meta: 'An admin confirms access' },
]

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
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Required'
    if (!form.username.trim()) next.username = 'Required'
    if (!form.email.trim()) next.email = 'Required'
    else if (!form.email.toLowerCase().endsWith('@sskatt.com')) next.email = 'Use your @sskatt.com email'
    if (!form.password) next.password = 'Required'
    else if (form.password.length < 8) next.password = 'At least 8 characters'
    if (!form.confirm_password) next.confirm_password = 'Required'
    else if (form.password !== form.confirm_password) next.confirm_password = 'Passwords don\u2019t match'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

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
    <div
      className="min-h-screen bg-[#faf9f5] text-[#0f172a] antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}
    >
      <style>{autofillFix}</style>
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left — brand & onboarding steps */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0a2a20] p-12 text-white lg:flex xl:p-16">
          {/* Ambient gradient wash */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 15% 8%, rgba(16,163,110,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 92%, rgba(16,163,110,0.22) 0%, transparent 50%)',
            }}
          />
          {/* Fine grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Floating decorative shapes */}
          <div className="float-slow pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#16815b]/25 to-transparent blur-3xl" />
          <div className="float-slower pointer-events-none absolute -left-24 bottom-16 h-80 w-80 rounded-full bg-gradient-to-tr from-[#0e5a3f]/40 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute right-16 bottom-40 h-24 w-24 rounded-2xl border border-white/[0.07] bg-white/[0.02] [transform:rotate(12deg)]" />

          <Link to="/login" className="relative inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] shadow-inner ring-1 ring-white/15 backdrop-blur-sm">
              <ShieldCheck size={19} strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">SSKATT</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Employee Operations Console</p>
            </div>
          </Link>

          <div className="relative max-w-lg space-y-7">
            <h1 className="text-[2.85rem] font-extrabold leading-[1.06] tracking-tight xl:text-[3.4rem]">
              Build your
              <br />
              <span className="bg-gradient-to-r from-[#5fe0b3] to-[#9be8cf] bg-clip-text text-transparent">
                HR workspace.
              </span>
            </h1>
            <p className="text-[15.5px] leading-relaxed text-white/60">
              Register a team account to manage people operations with
              structure, speed, and full visibility from day one.
            </p>
          </div>

          {/* Signature element: onboarding steps — what happens after you submit */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              How registration works
            </p>
            <div className="relative space-y-4">
              <div className="absolute left-[11px] top-1 bottom-1 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
              {steps.map((s, i) => (
                <div key={s.label} className="relative flex items-center gap-3.5">
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0e4735] text-[11px] font-semibold text-[#7fe3b8] ring-1 ring-white/15">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-white/90">{s.label}</p>
                    <p className="truncate text-[12px] text-white/40">{s.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-[12.5px] text-white/35">
            Access is granted by your workspace admin — no self-service approval.
          </p>
        </section>

        {/* Right — form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[480px]">
            <div className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e8f63] to-[#0b6e4f] shadow-md shadow-[#0b6e4f]/20">
                <ShieldCheck size={17} className="text-white" />
              </div>
              <span className="font-bold tracking-tight text-[#0f172a]">SSKATT Platform</span>
            </div>

            {success ? (
              <div className="pop-in rounded-3xl border border-[#e7e4d9] bg-white/80 p-8 text-center shadow-[0_20px_60px_-15px_rgba(11,110,79,0.18)] backdrop-blur-sm sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0b6e4f]/15 to-[#0b6e4f]/5 ring-1 ring-[#0b6e4f]/10">
                  <CheckCircle2 size={30} className="text-[#0b6e4f]" strokeWidth={2} />
                </div>
                <h2 className="text-[1.85rem] font-extrabold tracking-tight">Account created</h2>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5b6472]">
                  Your request is submitted for admin approval. You can sign in
                  once activation is complete.
                </p>
                <p className="mt-3.5 text-[12.5px] text-[#94a3b8]">Redirecting to sign in&hellip;</p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold text-[#0b6e4f] transition-colors duration-200 hover:bg-[#0b6e4f]/[0.06] hover:text-[#08563e]"
                >
                  <ArrowLeft size={14} />
                  Go to sign in
                </Link>
              </div>
            ) : (
              <div className="fade-in-up rounded-3xl border border-[#eae7dc] bg-white/70 p-7 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-9">
                <div className="mb-7">
                  <div className="mb-5 h-1 w-12 rounded-full bg-gradient-to-r from-[#0b6e4f] to-[#16a374]" />
                  <h2 className="text-[2.1rem] font-extrabold tracking-tight text-[#0f172a]">Create account</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#5b6472]">
                    Fill in your details to request access to SSKATT.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      id="signup-full-name"
                      label="Full name"
                      required
                      icon={User}
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="your full name"
                      autoComplete="name"
                      error={errors.full_name}
                    />
                    <Field
                      id="signup-username"
                      label="Username"
                      required
                      icon={UserPlus}
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="your username"
                      autoComplete="username"
                      error={errors.username}
                    />
                  </div>

                  <Field
                    id="signup-email"
                    label="Company email"
                    required
                    icon={Mail}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@sskatt.com"
                    autoComplete="email"
                    error={errors.email}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="signup-role" className="mb-1.5 block text-[13.5px] font-semibold text-[#334155]">
                        Registering as <span className="text-[#c2410c]">*</span>
                      </label>
                      <div className="group relative">
                        <select
                          id="signup-role"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className="h-12 w-full appearance-none rounded-xl border border-[#dcdad1] bg-white pl-3.5 pr-9 text-[15px] font-normal text-[#0f172a] outline-none transition-all duration-200 hover:border-[#b9c4bc] focus:border-[#0b6e4f] focus:ring-4 focus:ring-[#0b6e4f]/10"
                        >
                          <option value="hr">HR Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] transition-transform duration-200 group-focus-within:rotate-180" />
                      </div>
                    </div>
                    <Field
                      id="signup-phone"
                      label="Phone"
                      icon={Phone}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="your phone number"
                      autoComplete="tel"
                      hint="Optional"
                    />
                  </div>

                  <Field
                    id="signup-password"
                    label="Password"
                    required
                    icon={Lock}
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    error={errors.password}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="rounded-md p-1 text-[#94a3b8] transition-colors duration-200 hover:bg-[#0b6e4f]/[0.06] hover:text-[#0f172a]"
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                      >
                        {showPwd ? <EyeOff size={10} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  <Field
                    id="signup-confirm-password"
                    label="Confirm password"
                    required
                    icon={Lock}
                    type={showConfirmPwd ? 'text' : 'password'}
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    error={errors.confirm_password}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="rounded-md p-1 text-[#94a3b8] transition-colors duration-200 hover:bg-[#0b6e4f]/[0.06] hover:text-[#0f172a]"
                        aria-label={showConfirmPwd ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPwd ? <EyeOff size={8} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    id="signup-submit-btn"
                    disabled={loading}
                    className="group mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#0e8f63] to-[#0b6e4f] text-[15px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-6px_rgba(11,110,79,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_12px_24px_-6px_rgba(11,110,79,0.55)] active:translate-y-0 active:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_4px_10px_-4px_rgba(11,110,79,0.4)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating account
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="transition-transform duration-200 group-hover:scale-110" />
                        Create account
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-[14px] text-[#5b6472]">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#0b6e4f] transition-colors duration-200 hover:text-[#08563e]">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({ id, label, required, icon: Icon, error, hint, trailing, ...inputProps }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="block text-[13.5px] font-semibold text-[#334155]">
          {label} {required && <span className="text-[#c2410c]">*</span>}
        </label>
        {hint && <span className="text-[12px] text-[#94a3b8]">{hint}</span>}
      </div>
      <div className="relative">
        <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] transition-colors duration-200" />
        <input
          id={id}
          {...inputProps}
          className={`h-12 w-full rounded-xl border bg-white pl-10 ${trailing ? 'pr-11' : 'pr-3.5'} text-[15px] text-[#0f172a] placeholder:text-[#a8b0bb] outline-none transition-all duration-200 focus:ring-4 ${
            error
              ? 'border-[#e08a6c] focus:border-[#e08a6c] focus:ring-[#e08a6c]/12'
              : 'border-[#dcdad1] hover:border-[#b9c4bc] focus:border-[#0b6e4f] focus:ring-[#0b6e4f]/10'
          }`}
        />
        {trailing && <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center">{trailing}</div>}
      </div>
      {error && (
        <p className="fade-in-up mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-[#c2410c]">
          {error}
        </p>
      )}
    </div>
  )
}