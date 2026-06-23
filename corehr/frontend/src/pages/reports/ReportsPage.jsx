import { useState } from 'react'
import { reportsAPI, downloadBlob } from '../../api'
import { PageHeader } from '../../components/ui'
import { Download, FileSpreadsheet, Users, Laptop, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']

export default function ReportsPage() {
  const today = new Date()
  const [salaryMonth, setSalaryMonth] = useState(today.getMonth() + 1)
  const [salaryYear, setSalaryYear] = useState(today.getFullYear())
  const [assetStatus, setAssetStatus] = useState('')
  const [loading, setLoading] = useState({})

  const download = async (key, apiFn, filename) => {
    setLoading(l => ({ ...l, [key]: true }))
    try {
      const res = await apiFn()
      downloadBlob(res.data, filename)
      toast.success(`${filename} downloaded`)
    } catch {
      toast.error('Download failed')
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  const reports = [
    {
      title: 'All Employees Report',
      description: 'Complete list of all employees with department, designation, status, salary, and personal details.',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-600',
      action: (
        <button
          onClick={() => download('employees', reportsAPI.exportEmployees, `employees_${today.toISOString().slice(0,10)}.xlsx`)}
          disabled={loading.employees}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} /> {loading.employees ? 'Downloading...' : 'Download Excel'}
        </button>
      ),
    },
    {
      title: 'Salary Report',
      description: 'Monthly salary records with payment status, deductions, and net amounts.',
      icon: DollarSign,
      color: 'bg-green-50 border-green-200 text-green-700',
      iconColor: 'text-green-600',
      extra: (
        <div className="flex gap-2 mb-3">
          <select className="input-field w-36" value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)}>
            {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="input-field w-28" value={salaryYear} onChange={e => setSalaryYear(e.target.value)}>
            {[today.getFullYear(), today.getFullYear()-1, today.getFullYear()-2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      ),
      action: (
        <button
          onClick={() => download('salary', () => reportsAPI.exportSalary({ month: salaryMonth, year: salaryYear }), `salary_${MONTHS[salaryMonth]}_${salaryYear}.xlsx`)}
          disabled={loading.salary}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} /> {loading.salary ? 'Downloading...' : 'Download Excel'}
        </button>
      ),
    },
    {
      title: 'Asset Report',
      description: 'Inventory of all assets — laptops, ID cards, kits, and equipment with status.',
      icon: Laptop,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      iconColor: 'text-purple-600',
      extra: (
        <div className="mb-3">
          <select className="input-field w-48" value={assetStatus} onChange={e => setAssetStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="received">Received Only</option>
            <option value="not_received">Not Received Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      ),
      action: (
        <button
          onClick={() => download('assets', () => reportsAPI.exportAssets({ status: assetStatus || undefined }), `assets_${today.toISOString().slice(0,10)}.xlsx`)}
          disabled={loading.assets}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} /> {loading.assets ? 'Downloading...' : 'Download Excel'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Reports & Exports" subtitle="Download Excel reports for employees, salary, and assets" />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <FileSpreadsheet size={20} className="text-blue-600 flex-shrink-0" />
        <p className="text-blue-700 text-sm">All reports are exported in Excel (.xlsx) format for easy use in spreadsheet tools.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {reports.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.title} className={`card border ${r.color} bg-white`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border ${r.color}`}>
                  <Icon size={22} className={r.iconColor} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{r.description}</p>
                  {r.extra}
                  {r.action}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
