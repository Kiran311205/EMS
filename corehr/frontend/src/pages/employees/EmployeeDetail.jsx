import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeesAPI, assetsAPI, bankAPI, salaryAPI, leavesAPI } from '../../api'
import { Spinner, Table } from '../../components/ui'
import { Pencil, ArrowLeft, CreditCard, Lock, User, Laptop, Plane } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const getPhotoUrl = (photo) => {
  if (!photo) return null
  try { return new URL(photo).pathname } catch { return photo }
}

const STATUS_STYLES = {
  active: { bg: 'var(--success-tint)', fg: 'var(--success)' },
  probation: { bg: 'var(--info-tint)', fg: 'var(--info)' },
  on_leave: { bg: 'var(--warning-tint)', fg: 'var(--warning)' },
  resigned: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
  terminated: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
}

function Pill({ status }) {
  const s = STATUS_STYLES[status] || { bg: 'var(--paper)', fg: 'var(--slate)' }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.fg }}>
      {status?.replace('_', ' ')}
    </span>
  )
}

const TABS = [
  { name: 'Profile', icon: User },
  { name: 'Assets', icon: Laptop },
  { name: 'Bank Details', icon: CreditCard },
  { name: 'Salary', icon: CreditCard },
  { name: 'Leaves', icon: Plane },
]

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isHR } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')

  const { data: emp, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesAPI.get(id).then(r => r.data),
  })

  const { data: assets } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsAPI.list({ employee: id }).then(r => r.data.results || r.data),
    enabled: activeTab === 'Assets',
  })

  const { data: bankData } = useQuery({
    queryKey: ['bank', id],
    queryFn: () => bankAPI.list({ employee: id }).then(r => r.data.results || r.data),
    enabled: activeTab === 'Bank Details' && isHR,
  })

  const { data: salaryData } = useQuery({
    queryKey: ['salary-emp', id],
    queryFn: () => salaryAPI.list({ employee: id }).then(r => r.data.results || r.data),
    enabled: activeTab === 'Salary',
  })

  const { data: leavesData } = useQuery({
    queryKey: ['leaves-emp', id],
    queryFn: () => leavesAPI.list({ employee: id }).then(r => r.data.results || r.data),
    enabled: activeTab === 'Leaves',
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!emp) return <div className="text-center py-20 text-[var(--slate)]">Employee not found</div>

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-[var(--paper)] text-[var(--slate)]">
          <ArrowLeft size={18} />
        </button>
        <p className="font-mono text-[11px] tracking-widest text-[var(--gold-dark)] uppercase">Personnel file</p>
      </div>

      {/* Profile card */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="badge-avatar w-20 h-20 bg-[var(--gold-tint)] flex items-center justify-center text-[var(--gold-dark)] font-display font-semibold text-3xl flex-shrink-0 overflow-hidden">
          {emp.photo
            ? <img src={getPhotoUrl(emp.photo)} alt={emp.full_name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
            : null}
          <span style={{ display: emp.photo ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{emp.full_name[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="font-display text-2xl text-[var(--ink)]">{emp.full_name}</h2>
            <Pill status={emp.status} />
          </div>
          <p className="text-[var(--slate)]">{emp.designation_title || 'No designation'} — {emp.department_name || 'No department'}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-[var(--slate)]">
            <span className="font-mono text-xs bg-[var(--paper)] border border-[var(--line)] rounded px-1.5 py-0.5">{emp.employee_id}</span>
            <span>{emp.email}</span>
            <span>{emp.phone}</span>
            <span>Joined {emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—'}</span>
          </div>
        </div>
        <button onClick={() => navigate(`/employees/${id}/edit`)} className="btn-secondary flex items-center gap-2 flex-shrink-0">
          <Pencil size={15} /> Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--line)]">
        {TABS.map((tab) => {
          if (tab.name === 'Bank Details' && !isHR) return null
          const active = activeTab === tab.name
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors"
              style={{ borderColor: active ? 'var(--gold)' : 'transparent', color: active ? 'var(--gold-dark)' : 'var(--slate)' }}
            >
              <tab.icon size={14} /> {tab.name}
            </button>
          )
        })}
      </div>

      {activeTab === 'Profile' && <ProfileTab emp={emp} />}
      {activeTab === 'Assets' && <AssetsTab assets={assets} />}
      {activeTab === 'Bank Details' && isHR && <BankTab bankData={bankData} />}
      {activeTab === 'Salary' && <SalaryTab salaryData={salaryData} />}
      {activeTab === 'Leaves' && <LeavesTab leavesData={leavesData} />}
    </div>
  )
}

// wraps a value in the secure-field treatment: mono type, dashed border,
// small lock glyph — signals "this is a masked/sensitive value" at a glance
function Secure({ children }) {
  return (
    <span className="secure-field inline-flex items-center gap-1.5">
      <Lock size={11} /> {children}
    </span>
  )
}

function ProfileTab({ emp }) {
  const sections = [
    {
      title: 'Personal information',
      fields: [
        { label: 'Full name', value: emp.full_name },
        { label: 'Email', value: emp.email },
        { label: 'Phone', value: emp.phone },
        { label: 'Alternate phone', value: emp.alternate_phone || '—' },
        { label: 'Gender', value: emp.gender || '—' },
        { label: 'Date of birth', value: emp.date_of_birth ? format(new Date(emp.date_of_birth), 'dd MMM yyyy') : '—' },
        { label: 'Blood group', value: emp.blood_group || '—' },
      ],
    },
    {
      title: 'Employment details',
      fields: [
        { label: 'Employee ID', value: <span className="font-mono text-xs">{emp.employee_id}</span> },
        { label: 'Department', value: emp.department_name || '—' },
        { label: 'Designation', value: emp.designation_title || '—' },
        { label: 'Employment type', value: emp.employment_type?.replace('_', ' ') || '—' },
        { label: 'Status', value: <Pill status={emp.status} /> },
        { label: 'Date joined', value: emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—' },
        { label: 'Basic salary', value: `₹${Number(emp.basic_salary || 0).toLocaleString('en-IN')}` },
      ],
    },
    {
      title: 'Address',
      fields: [
        { label: 'Address', value: emp.address || '—' },
        { label: 'City', value: emp.city || '—' },
        { label: 'State', value: emp.state || '—' },
        { label: 'Pincode', value: emp.pincode || '—' },
      ],
    },
    {
      title: 'Documents',
      secure: true,
      fields: [
        { label: 'Aadhar number', value: emp.aadhar_number ? <Secure>XXXX-XXXX-{emp.aadhar_number.slice(-4)}</Secure> : '—' },
        { label: 'PAN number', value: emp.pan_number ? <Secure>{emp.pan_number}</Secure> : '—' },
        { label: 'PF number', value: emp.pf_number || '—' },
        { label: 'UAN number', value: emp.uan_number || '—' },
        { label: 'ESI number', value: emp.esi_number || '—' },
      ],
    },
    {
      title: 'Emergency contact',
      fields: [
        { label: 'Name', value: emp.emergency_contact_name || '—' },
        { label: 'Phone', value: emp.emergency_contact_phone || '—' },
        { label: 'Relation', value: emp.emergency_contact_relation || '—' },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {sections.map((sec) => (
        <div key={sec.title} className="card">
          <h3 className="font-display text-base text-[var(--ink)] mb-4 pb-2.5 border-b border-[var(--line)] flex items-center gap-2">
            {sec.title}
            {sec.secure && <Lock size={12} className="text-[var(--slate-soft)]" />}
          </h3>
          <dl className="space-y-3">
            {sec.fields.map((f) => (
              <div key={f.label} className="flex justify-between items-center text-sm gap-4">
                <dt className="text-[var(--slate)] font-medium flex-shrink-0">{f.label}</dt>
                <dd className="text-[var(--ink)] text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function AssetsTab({ assets }) {
  const typeIcons = { laptop: '💻', desktop: '🖥️', id_card: '🪪', key_card: '🔑', kit: '📦', sim_card: '📱', other: '📎' }
  return (
    <div className="card">
      <h3 className="font-display text-base text-[var(--ink)] mb-4">Assigned assets</h3>
      {!assets || assets.length === 0 ? (
        <p className="text-[var(--slate-soft)] text-sm py-8 text-center">No assets assigned</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assets.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] hover:border-[var(--gold)] transition-colors">
              <span className="text-2xl">{typeIcons[a.asset_type] || '📎'}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-[var(--ink)]">{a.asset_type?.replace('_', ' ').toUpperCase()}</p>
                {a.serial_number && <p className="font-mono text-xs text-[var(--slate-soft)]">S/N: {a.serial_number}</p>}
                {a.model_name && <p className="text-xs text-[var(--slate-soft)]">{a.model_name}</p>}
                {a.issued_date && <p className="text-xs text-[var(--slate-soft)]">Issued {format(new Date(a.issued_date), 'dd MMM yyyy')}</p>}
              </div>
              <Pill status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BankTab({ bankData }) {
  const bank = Array.isArray(bankData) ? bankData[0] : bankData?.results?.[0]
  if (!bank) return (
    <div className="card text-center py-10 text-[var(--slate-soft)]">
      <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
      <p>No bank details added</p>
    </div>
  )
  return (
    <div className="card max-w-lg">
      <h3 className="font-display text-base text-[var(--ink)] mb-4 flex items-center gap-2">
        <CreditCard size={17} className="text-[var(--gold-dark)]" /> Bank account details
        <Lock size={12} className="text-[var(--slate-soft)]" />
      </h3>
      <dl className="space-y-3">
        {[
          { label: 'Account holder', value: bank.account_holder_name },
          { label: 'Bank name', value: bank.bank_name },
          { label: 'Branch', value: bank.branch_name || '—' },
          { label: 'Account number', value: <Secure>****{bank.account_number?.slice(-4)}</Secure> },
          { label: 'IFSC code', value: <span className="font-mono text-xs">{bank.ifsc_code}</span> },
          { label: 'Account type', value: bank.account_type },
          { label: 'MICR code', value: bank.micr_code || '—' },
        ].map((f) => (
          <div key={f.label} className="flex justify-between items-center text-sm">
            <dt className="text-[var(--slate)] font-medium">{f.label}</dt>
            <dd className="text-[var(--ink)] font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function SalaryTab({ salaryData }) {
  const records = Array.isArray(salaryData) ? salaryData : salaryData?.results || []
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return (
    <div className="card !p-0 overflow-hidden">
      <h3 className="font-display text-base text-[var(--ink)] px-5 pt-5 pb-3">Salary history</h3>
      <Table headers={['Month', 'Year', 'Basic', 'Net salary', 'Status', 'Paid date']}>
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-[var(--paper)]">
            <td className="px-4 py-3 text-sm">{months[r.month]}</td>
            <td className="px-4 py-3 text-sm">{r.year}</td>
            <td className="px-4 py-3 text-sm">₹{Number(r.basic_salary).toLocaleString('en-IN')}</td>
            <td className="px-4 py-3 text-sm font-semibold text-[var(--ink)]">₹{Number(r.net_salary).toLocaleString('en-IN')}</td>
            <td className="px-4 py-3"><Pill status={r.status} /></td>
            <td className="px-4 py-3 text-sm text-[var(--slate)]">
              {r.paid_date ? format(new Date(r.paid_date), 'dd MMM yyyy') : '—'}
            </td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr><td colSpan={6} className="text-center py-8 text-[var(--slate-soft)]">No salary records</td></tr>
        )}
      </Table>
    </div>
  )
}

function LeavesTab({ leavesData }) {
  const records = Array.isArray(leavesData) ? leavesData : leavesData?.results || []
  return (
    <div className="card !p-0 overflow-hidden">
      <h3 className="font-display text-base text-[var(--ink)] px-5 pt-5 pb-3">Leave history</h3>
      <Table headers={['Type', 'From', 'To', 'Days', 'Reason', 'Status']}>
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-[var(--paper)]">
            <td className="px-4 py-3 text-sm capitalize">{r.leave_type_display || r.leave_type}</td>
            <td className="px-4 py-3 text-sm">{format(new Date(r.from_date), 'dd MMM yyyy')}</td>
            <td className="px-4 py-3 text-sm">{format(new Date(r.to_date), 'dd MMM yyyy')}</td>
            <td className="px-4 py-3 text-sm">{r.days}</td>
            <td className="px-4 py-3 text-sm max-w-xs truncate">{r.reason}</td>
            <td className="px-4 py-3"><Pill status={r.status} /></td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr><td colSpan={6} className="text-center py-8 text-[var(--slate-soft)]">No leave records</td></tr>
        )}
      </Table>
    </div>
  )
}