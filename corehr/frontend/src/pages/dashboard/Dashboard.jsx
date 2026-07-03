import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Users, UserCheck, Clock, TrendingUp, IndianRupee,
  AlertCircle, Laptop, CreditCard, Package, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { reportsAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

/**
 * Redesigned HR / Admin dashboard.
 *
 * Drop-in replacement for the original Dashboard component — same data shape
 * (dashData.employees / .assets / .salary, isAdmin from useAuth) so you can
 * wire your real useQuery calls back in where the MOCK block is.
 *
 * Design tokens
 * ink      #14151F   primary text
 * paper    #F7F6F1   page background (warm, not stark white)
 * card     #FFFFFF   card surface
 * border   #E8E6DE   hairline
 * indigo   #3346FF   People (employees)
 * green    #0F9960   Payroll — healthy
 * amber    #DB8A26   Payroll — waiting
 * coral    #E1523D   Payroll — blocked
 * violet   #8B5CF6   Assets
 * muted    #6E6E78   secondary text
 *
 * Display face: Space Grotesk (headings) — Body: Inter — Data: IBM Plex Mono
 * Signature: every metric is color-coded by domain (people / payroll / assets)
 * via a left accent bar, and every number is set in tabular mono digits so
 * figures actually line up when you scan down a column — this is a panel
 * people read at a glance every morning, not a marketing page.
 */

const T = {
  ink: '#14151F',
  paper: '#F7F6F1',
  card: '#FFFFFF',
  border: '#E8E6DE',
  muted: '#6E6E78',
  indigo: '#3346FF',
  indigoSoft: '#EEF0FF',
  green: '#0F9960',
  greenSoft: '#E8F7EF',
  amber: '#DB8A26',
  amberSoft: '#FCF2E3',
  coral: '#E1523D',
  coralSoft: '#FBEAE7',
  violet: '#7C5CFC',
  violetSoft: '#F1EDFF',
}

const FONTS = {
  display: "'Space Grotesk', 'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}

function KpiCard({ label, value, icon: Icon, accent, accentSoft, delta, deltaDir, sub }) {
  return (
    <div style={{
      background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${accent}`, padding: '18px 20px', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: T.muted, fontWeight: 500,
        }}>{label}</span>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={15} color={accent} strokeWidth={2.2} />
        </div>
      </div>
      <div style={{
        fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums', fontSize: 30,
        fontWeight: 600, color: T.ink, marginTop: 10, lineHeight: 1,
      }}>{value}</div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, minHeight: 16 }}>
        {delta != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2, fontFamily: FONTS.mono,
            fontSize: 12, fontWeight: 600, color: deltaDir === 'up' ? T.green : T.coral,
          }}>
            {deltaDir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
        {sub && <span style={{ fontFamily: FONTS.body, fontSize: 12.5, color: T.muted }}>{sub}</span>}
      </div>
    </div>
  )
}

function SectionLabel({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: accent }} />
      <h2 style={{
        fontFamily: FONTS.display, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: T.ink, margin: 0,
      }}>{children}</h2>
    </div>
  )
}

function ProgressRow({ icon: Icon, label, received, pending, accent, accentSoft }) {
  const total = received + pending
  const pct = total ? Math.round((received / total) * 100) : 0
  return (
    <div style={{ padding: '14px 0', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={accent} strokeWidth={2.2} />
          </div>
          <span style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: T.ink }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontVariantNumeric: 'tabular-nums', color: T.ink, fontWeight: 600 }}>
            {received}<span style={{ color: T.muted, fontWeight: 400 }}>/{total}</span>
          </span>
          {pending > 0 && (
            <span style={{
              fontFamily: FONTS.mono, fontSize: 11, color: T.amber, background: T.amberSoft,
              padding: '2px 7px', borderRadius: 20, fontWeight: 600,
            }}>{pending} pending</span>
          )}
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 20, background: T.paper, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 20, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const today = new Date()

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsAPI.dashboard().then(r => r.data),
  })

  const emp = dashData?.employees || {}
  const assets = dashData?.assets || {}
  const salary = dashData?.salary || {}

  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const monthStr = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const empDonut = useMemo(() => ([
    { name: 'Active', value: emp.active, color: T.indigo },
    { name: 'On Leave', value: emp.on_leave, color: T.amber },
    { name: 'Resigned', value: emp.resigned, color: T.border },
  ]), [emp])

  const salaryTotal = (salary.paid || 0) + (salary.unpaid || 0) + (salary.on_hold || 0)
  const paidPct = salaryTotal ? Math.round(((salary.paid || 0) / salaryTotal) * 100) : 0

  return (
    <div style={{
      background: T.paper, minHeight: '100vh', padding: '32px 28px 60px',
      fontFamily: FONTS.body, color: T.ink,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.35 } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 30 }}>
        <div>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: T.muted, fontWeight: 500,
          }}>Dashboard</span>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 32, fontWeight: 700, margin: '4px 0 6px', letterSpacing: '-0.01em',
          }}>Good afternoon</h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 14.5, color: T.muted, margin: 0 }}>{dateStr}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 30, padding: '8px 14px 8px 12px',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: T.green, animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 600, color: T.ink }}>
            {isAdmin ? 'Admin view' : 'HR manager view'}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 30 }}>
        <KpiCard label="Total Employees" value={emp.total} icon={Users} accent={T.indigo} accentSoft={T.indigoSoft} sub="headcount" />
        <KpiCard label="Active" value={emp.active} icon={UserCheck} accent={T.green} accentSoft={T.greenSoft}
          delta={`${emp.total ? Math.round(((emp.active || 0) / emp.total) * 100) : 0}%`} deltaDir="up" sub="of headcount" />
        <KpiCard label="On Leave" value={emp.on_leave} icon={Clock} accent={T.amber} accentSoft={T.amberSoft} sub="today" />
        <KpiCard label="Joined" value={emp.this_month_joined} icon={TrendingUp} accent={T.violet} accentSoft={T.violetSoft} sub={monthStr} />
      </div>

      {/* Employee status + Payroll */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 30 }}>
        {/* Employee status donut */}
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.indigo}`, padding: 22 }}>
          <SectionLabel accent={T.indigo}>Employee status</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={empDonut} cx="50%" cy="50%" innerRadius={54} outerRadius={76} paddingAngle={2} dataKey="value" stroke="none">
                    {empDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 600, lineHeight: 1 }}>{emp.total}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 10.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {empDonut.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ fontFamily: FONTS.body, fontSize: 13.5, color: T.ink }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payroll — admin only */}
        {isAdmin && (
          <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.green}`, padding: 22 }}>
            <SectionLabel accent={T.green}>Payroll — {monthStr}</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 600 }}>{paidPct}%</span>
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: T.muted }}>disbursed this cycle</span>
            </div>
            <div style={{ height: 8, borderRadius: 20, background: T.paper, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
              <div style={{ width: `${salaryTotal ? ((salary.paid || 0) / salaryTotal) * 100 : 0}%`, background: T.green }} />
              <div style={{ width: `${salaryTotal ? ((salary.on_hold || 0) / salaryTotal) * 100 : 0}%`, background: T.amber }} />
              <div style={{ width: `${salaryTotal ? ((salary.unpaid || 0) / salaryTotal) * 100 : 0}%`, background: T.coral }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Paid', value: salary.paid, color: T.green, soft: T.greenSoft, icon: IndianRupee },
                { label: 'On hold', value: salary.on_hold, color: T.amber, soft: T.amberSoft, icon: Clock },
                { label: 'Unpaid', value: salary.unpaid, color: T.coral, soft: T.coralSoft, icon: AlertCircle },
              ].map((s, i) => (
                <div key={i} style={{ background: T.paper, borderRadius: 12, padding: '12px 12px' }}>
                  <s.icon size={14} color={s.color} strokeWidth={2.2} />
                  <div style={{ fontFamily: FONTS.mono, fontSize: 19, fontWeight: 600, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 12, color: T.muted, marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assets */}
      <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.violet}`, padding: '22px 22px 6px' }}>
        <SectionLabel accent={T.violet}>Asset issuance</SectionLabel>
        <ProgressRow icon={Laptop} label="Laptops" received={assets.laptops_received} pending={assets.laptops_pending} accent={T.violet} accentSoft={T.violetSoft} />
        <ProgressRow icon={CreditCard} label="ID cards" received={assets.id_cards_received} pending={assets.id_cards_pending} accent={T.violet} accentSoft={T.violetSoft} />
        <div style={{ borderBottom: 'none' }}>
          <ProgressRow icon={Package} label="Onboarding kits" received={assets.kits_received} pending={assets.kits_pending} accent={T.violet} accentSoft={T.violetSoft} />
        </div>
      </div>
    </div>
  )
}