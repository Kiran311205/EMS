import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesAPI, assetsAPI, bankAPI, salaryAPI, leavesAPI } from '../../api'
import { StatusBadge, Spinner, Modal, Table } from '../../components/ui'
import { Edit, ArrowLeft, Laptop, CreditCard, IndianRupee, Plane, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

// Django returns absolute URLs (http://localhost:8000/media/...) but Vite proxies /media
// so we extract just the path portion to let the proxy handle it
const getPhotoUrl = (photo) => {
  if (!photo) return null
  try {
    const url = new URL(photo)
    return url.pathname  // returns "/media/employees/photo.jpg"
  } catch {
    // already a relative path
    return photo
  }
}

const TABS = ['Profile', 'Assets', 'Bank Details', 'Salary', 'Leaves']

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isHR } = useAuth()
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
  if (!emp) return <div className="text-center py-20 text-gray-500">Employee not found</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Employee Profile</h1>
      </div>

      {/* Profile card */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl flex-shrink-0 overflow-hidden">
          {emp.photo
            ? <img src={getPhotoUrl(emp.photo)} alt={emp.full_name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            : null}
          <span style={{ display: emp.photo ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{emp.full_name[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{emp.full_name}</h2>
            <StatusBadge status={emp.status} />
          </div>
          <p className="text-gray-500">{emp.designation_title || 'No Designation'} — {emp.department_name || 'No Department'}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            <span>🪪 {emp.employee_id}</span>
            <span>📧 {emp.email}</span>
            <span>📱 {emp.phone}</span>
            <span>📅 Joined {emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—'}</span>
          </div>
        </div>
        <button onClick={() => navigate(`/employees/${id}/edit`)} className="btn-secondary flex items-center gap-2 flex-shrink-0">
          <Edit size={15} /> Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            if (tab === 'Bank Details' && !isHR) return null
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'Profile' && <ProfileTab emp={emp} />}
      {activeTab === 'Assets' && <AssetsTab assets={assets} employeeId={id} />}
      {activeTab === 'Bank Details' && isHR && <BankTab bankData={bankData} employeeId={id} />}
      {activeTab === 'Salary' && <SalaryTab salaryData={salaryData} />}
      {activeTab === 'Leaves' && <LeavesTab leavesData={leavesData} />}
    </div>
  )
}

function ProfileTab({ emp }) {
  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: emp.full_name },
        { label: 'Email', value: emp.email },
        { label: 'Phone', value: emp.phone },
        { label: 'Alternate Phone', value: emp.alternate_phone || '—' },
        { label: 'Gender', value: emp.gender || '—' },
        { label: 'Date of Birth', value: emp.date_of_birth ? format(new Date(emp.date_of_birth), 'dd MMM yyyy') : '—' },
        { label: 'Blood Group', value: emp.blood_group || '—' },
      ],
    },
    {
      title: 'Employment Details',
      fields: [
        { label: 'Employee ID', value: emp.employee_id },
        { label: 'Department', value: emp.department_name || '—' },
        { label: 'Designation', value: emp.designation_title || '—' },
        { label: 'Employment Type', value: emp.employment_type?.replace('_', ' ') || '—' },
        { label: 'Status', value: <StatusBadge status={emp.status} /> },
        { label: 'Date Joined', value: emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—' },
        { label: 'Basic Salary', value: `₹${Number(emp.basic_salary || 0).toLocaleString('en-IN')}` },
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
      fields: [
        { label: 'Aadhar Number', value: emp.aadhar_number ? `XXXX-XXXX-${emp.aadhar_number.slice(-4)}` : '—' },
        { label: 'PAN Number', value: emp.pan_number || '—' },
        { label: 'PF Number', value: emp.pf_number || '—' },
        { label: 'UAN Number', value: emp.uan_number || '—' },
        { label: 'ESI Number', value: emp.esi_number || '—' },
      ],
    },
    {
      title: 'Emergency Contact',
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
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{sec.title}</h3>
          <dl className="space-y-3">
            {sec.fields.map((f) => (
              <div key={f.label} className="flex justify-between text-sm">
                <dt className="text-gray-500 font-medium">{f.label}</dt>
                <dd className="text-gray-900 text-right max-w-[60%]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function AssetsTab({ assets, employeeId }) {
  const typeIcons = { laptop: '💻', desktop: '🖥️', id_card: '🪪', key_card: '🔑', kit: '📦', sim_card: '📱', other: '📎' }
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4">Assigned Assets</h3>
      {!assets || assets.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No assets assigned</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assets.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200">
              <span className="text-2xl">{typeIcons[a.asset_type] || '📎'}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{a.asset_type?.replace('_', ' ').toUpperCase()}</p>
                {a.serial_number && <p className="text-xs text-gray-400">S/N: {a.serial_number}</p>}
                {a.model_name && <p className="text-xs text-gray-400">{a.model_name}</p>}
                {a.issued_date && <p className="text-xs text-gray-400">Issued: {format(new Date(a.issued_date), 'dd MMM yyyy')}</p>}
              </div>
              <StatusBadge status={a.status} />
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
    <div className="card text-center py-10 text-gray-400">
      <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
      <p>No bank details added</p>
    </div>
  )
  return (
    <div className="card max-w-lg">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard size={18} className="text-primary-600" /> Bank Account Details
      </h3>
      <dl className="space-y-3">
        {[
          { label: 'Account Holder', value: bank.account_holder_name },
          { label: 'Bank Name', value: bank.bank_name },
          { label: 'Branch', value: bank.branch_name || '—' },
          { label: 'Account Number', value: `****${bank.account_number?.slice(-4)}` },
          { label: 'IFSC Code', value: bank.ifsc_code },
          { label: 'Account Type', value: bank.account_type },
          { label: 'MICR Code', value: bank.micr_code || '—' },
        ].map((f) => (
          <div key={f.label} className="flex justify-between text-sm">
            <dt className="text-gray-500 font-medium">{f.label}</dt>
            <dd className="text-gray-900 font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function SalaryTab({ salaryData }) {
  const records = Array.isArray(salaryData) ? salaryData : salaryData?.results || []
  const months = ['','January','February','March','April','May','June','July','August','September','October','November','December']
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4">Salary History</h3>
      <Table headers={['Month', 'Year', 'Basic', 'Net Salary', 'Status', 'Paid Date']}>
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm">{months[r.month]}</td>
            <td className="px-4 py-3 text-sm">{r.year}</td>
            <td className="px-4 py-3 text-sm">₹{Number(r.basic_salary).toLocaleString('en-IN')}</td>
            <td className="px-4 py-3 text-sm font-semibold">₹{Number(r.net_salary).toLocaleString('en-IN')}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {r.paid_date ? format(new Date(r.paid_date), 'dd MMM yyyy') : '—'}
            </td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr><td colSpan={6} className="text-center py-8 text-gray-400">No salary records</td></tr>
        )}
      </Table>
    </div>
  )
}

function LeavesTab({ leavesData }) {
  const records = Array.isArray(leavesData) ? leavesData : leavesData?.results || []
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4">Leave History</h3>
      <Table headers={['Type', 'From', 'To', 'Days', 'Reason', 'Status']}>
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm capitalize">{r.leave_type_display || r.leave_type}</td>
            <td className="px-4 py-3 text-sm">{format(new Date(r.from_date), 'dd MMM yyyy')}</td>
            <td className="px-4 py-3 text-sm">{format(new Date(r.to_date), 'dd MMM yyyy')}</td>
            <td className="px-4 py-3 text-sm">{r.days}</td>
            <td className="px-4 py-3 text-sm max-w-xs truncate">{r.reason}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr><td colSpan={6} className="text-center py-8 text-gray-400">No leave records</td></tr>
        )}
      </Table>
    </div>
  )
}
