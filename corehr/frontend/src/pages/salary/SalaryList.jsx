import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salaryAPI, employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, Modal, EmptyState, ConfirmDialog, InputField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, IndianRupee, CheckCircle, XCircle, FileText, Printer, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
const emptyForm = { employee: '', month: '', year: new Date().getFullYear(), basic_salary: '', hra: 0, allowances: 0, deductions: 0, pf_deduction: 0, tax_deduction: 0, net_salary: '', status: 'unpaid', paid_date: '', payment_mode: '', transaction_id: '', remarks: '' }

// ── Payslip Modal ─────────────────────────────────────────────────────────────
function PayslipModal({ record, onClose }) {
  if (!record) return null

  const gross = Number(record.basic_salary) + Number(record.hra || 0) + Number(record.allowances || 0)
  const totalDeductions = Number(record.pf_deduction || 0) + Number(record.tax_deduction || 0) + Number(record.deductions || 0)
  const net = Number(record.net_salary)

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-area').innerHTML
    const win = window.open('', '', 'width=900,height=700')
    win.document.write(`
      <html><head><title>Payslip - ${record.employee_name}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; }
        body { background:#fff; color:#1e293b; }
        .header { background:linear-gradient(135deg,#0f0c29,#1a1560); color:white; padding:28px 36px; }
        .header h1 { font-size:1.5rem; font-weight:800; }
        .header p { opacity:0.6; font-size:0.82rem; margin-top:4px; }
        .badge { display:inline-block; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:20px; padding:3px 12px; font-size:0.72rem; font-weight:700; margin-top:10px; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; padding:24px 36px; background:#f8f9ff; border-bottom:1px solid #e8ecff; }
        .info-box { background:white; border-radius:10px; padding:14px; border:1px solid #e8ecff; }
        .info-box .label { color:#94a3b8; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .info-box .value { color:#0f172a; font-weight:700; font-size:0.92rem; margin-top:4px; }
        .section { padding:0 36px; margin:20px 0; }
        .section-title { font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#6366f1; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
        .section-title::after { content:''; flex:1; height:1px; background:#e8ecff; }
        table { width:100%; border-collapse:collapse; }
        th { background:#f0f2ff; color:#64748b; font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:8px 14px; text-align:left; }
        td { padding:9px 14px; font-size:0.85rem; border-bottom:1px solid #f8f9ff; }
        td:last-child { text-align:right; font-weight:600; color:#1e293b; }
        .total-row td { font-weight:800; background:#f8f9ff; font-size:0.9rem; }
        .net-box { margin:20px 36px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:14px; padding:22px 28px; color:white; display:flex; justify-content:space-between; align-items:center; }
        .net-box .label { opacity:0.7; font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
        .net-box .amount { font-size:2rem; font-weight:900; letter-spacing:-1px; }
        .net-box .sub { display:flex; gap:20px; margin-top:8px; font-size:0.75rem; opacity:0.75; }
        .footer { margin:20px 36px 28px; text-align:center; color:#94a3b8; font-size:0.7rem; border-top:1px solid #f1f5f9; padding-top:16px; }
      </style>
      </head><body>${printContent}</body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,41,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose} />

      {/* Modal */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '780px', maxHeight: '92vh', background: 'white', borderRadius: '20px', boxShadow: '0 40px 100px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#0f0c29', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#a5b4fc" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Payslip</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{record.employee_name} · {MONTHS[record.month]} {record.year}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Payslip body (scrollable + printable) */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div id="payslip-print-area">

            {/* Company Header */}
            <div style={{ background: 'linear-gradient(135deg,#0f0c29,#1a1560)', padding: '28px 36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '40%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)' }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>SSKATT</h1>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: '4px' }}>Management System · HR Department</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 12px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: record.status === 'paid' ? '#22c55e' : record.status === 'on_hold' ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {record.status === 'paid' ? 'Paid' : record.status === 'on_hold' ? 'On Hold' : 'Unpaid'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Pay Period</p>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>{MONTHS[record.month]} {record.year}</p>
                  {record.paid_date && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '4px' }}>
                      Paid on {format(new Date(record.paid_date), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', padding: '20px 28px', background: '#f8f9ff', borderBottom: '1px solid #e8ecff' }}>
              {[
                { label: 'Employee Name', value: record.employee_name },
                { label: 'Employee ID', value: record.employee_code || '—' },
                { label: 'Department', value: record.department || '—' },
                { label: 'Payment Mode', value: record.payment_mode || '—' },
                { label: 'Transaction ID', value: record.transaction_id || '—' },
                { label: 'Generated On', value: format(new Date(), 'dd MMM yyyy') },
              ].map(info => (
                <div key={info.label} style={{ background: 'white', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e8ecff' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{info.label}</p>
                  <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>{info.value}</p>
                </div>
              ))}
            </div>

            {/* Earnings & Deductions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 28px' }}>

              {/* Earnings */}
              <div>
                <p style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Earnings
                  <span style={{ flex: 1, height: '1px', background: '#d1fae5', display: 'inline-block' }} />
                </p>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1fae5' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0fdf4' }}>
                        <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Component</th>
                        <th style={{ padding: '9px 14px', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Basic Salary', value: record.basic_salary },
                        { label: 'HRA', value: record.hra || 0 },
                        { label: 'Allowances', value: record.allowances || 0 },
                      ].map(row => (
                        <tr key={row.label} style={{ borderBottom: '1px solid #f0fdf4' }}>
                          <td style={{ padding: '9px 14px', fontSize: '0.82rem', color: '#374151' }}>{row.label}</td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{fmt(row.value)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#f0fdf4' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', color: '#15803d' }}>Gross Earnings</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', color: '#15803d' }}>{fmt(gross)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Deductions
                  <span style={{ flex: 1, height: '1px', background: '#fecaca', display: 'inline-block' }} />
                </p>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #fecaca' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#fef2f2' }}>
                        <th style={{ padding: '9px 14px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Component</th>
                        <th style={{ padding: '9px 14px', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'PF Deduction', value: record.pf_deduction || 0 },
                        { label: 'Tax (TDS)', value: record.tax_deduction || 0 },
                        { label: 'Other Deductions', value: record.deductions || 0 },
                      ].map(row => (
                        <tr key={row.label} style={{ borderBottom: '1px solid #fef2f2' }}>
                          <td style={{ padding: '9px 14px', fontSize: '0.82rem', color: '#374151' }}>{row.label}</td>
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{fmt(row.value)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#fef2f2' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', color: '#b91c1c' }}>Total Deductions</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', color: '#b91c1c' }}>{fmt(totalDeductions)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div style={{ margin: '0 28px 20px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '16px', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 32px rgba(99,102,241,0.3)' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Net Pay (Take Home)</p>
                <p style={{ color: 'white', fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px', marginTop: '4px' }}>{fmt(net)}</p>
                <div style={{ display: 'flex', gap: '18px', marginTop: '8px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Gross: {fmt(gross)}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Deductions: {fmt(totalDeductions)}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
                  <IndianRupee size={28} color="white" />
                </div>
              </div>
            </div>

            {/* Remarks */}
            {record.remarks && (
              <div style={{ margin: '0 28px 20px', padding: '14px 18px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #e8ecff' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Remarks</p>
                <p style={{ color: '#374151', fontSize: '0.82rem' }}>{record.remarks}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ margin: '0 28px 24px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                This is a computer-generated payslip and does not require a signature. · SSKATT Management System
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main SalaryList ────────────────────────────────────────────────────────────
export default function SalaryList() {
  const { isAdmin } = useAuth()
  const qc = useQueryClient()
  const today = new Date()
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(today.getFullYear())
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selected, setSelected] = useState([])
  const [payslipRecord, setPayslipRecord] = useState(null)

  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['salary', filterMonth, filterYear],
    queryFn: () => salaryAPI.list({ month: filterMonth, year: filterYear }).then(r => r.data.results || r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['salary-stats', filterMonth, filterYear],
    queryFn: () => salaryAPI.stats({ month: filterMonth, year: filterYear }).then(r => r.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => editItem ? salaryAPI.update(editItem.id, data) : salaryAPI.create(data),
    onSuccess: () => {
      toast.success(editItem ? 'Salary record updated' : 'Salary record added')
      qc.invalidateQueries(['salary'])
      qc.invalidateQueries(['salary-stats'])
      closeModal()
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.non_field_errors) toast.error('Salary record already exists for this employee/month')
      else toast.error('Failed to save salary record')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => salaryAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['salary']); setDeleteId(null) },
    onError: () => toast.error('Failed to delete'),
  })

  const bulkMutation = useMutation({
    mutationFn: (data) => salaryAPI.bulkUpdateStatus(data),
    onSuccess: (res) => {
      toast.success(`${res.data.updated} records updated`)
      qc.invalidateQueries(['salary'])
      qc.invalidateQueries(['salary-stats'])
      setSelected([])
    },
    onError: () => toast.error('Bulk update failed'),
  })

  const openAdd = () => { setEditItem(null); setForm({ ...emptyForm, month: filterMonth, year: filterYear }); setModal(true) }
  const openEdit = (s) => { setEditItem(s); setForm({ ...s, paid_date: s.paid_date || '' }); setModal(true) }
  const closeModal = () => { setModal(false); setEditItem(null); setForm(emptyForm) }

  const calcNet = (f) => {
    const gross = Number(f.basic_salary) + Number(f.hra) + Number(f.allowances)
    const deduct = Number(f.deductions) + Number(f.pf_deduction) + Number(f.tax_deduction)
    return (gross - deduct).toFixed(2)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      updated.net_salary = calcNet(updated)
      return updated
    })
  }

  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))
  const records = salaryData || []
  const allSelected = selected.length === records.length && records.length > 0
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Salary & Payslips"
        subtitle="Monthly salary records, payment tracking and payslip generation"
        action={isAdmin && <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Record</button>}
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Paid', value: stats.paid, color: 'bg-green-50 text-green-700' },
            { label: 'Unpaid', value: stats.unpaid, color: 'bg-red-50 text-red-700' },
            { label: 'On Hold', value: stats.on_hold, color: 'bg-yellow-50 text-yellow-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select className="input-field w-40" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select className="input-field w-32" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Bulk actions (admin) */}
        {isAdmin && selected.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <span className="text-sm text-gray-500 self-center">{selected.length} selected</span>
            <button onClick={() => bulkMutation.mutate({ ids: selected, status: 'paid', paid_date: format(today, 'yyyy-MM-dd') })}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <CheckCircle size={14} /> Mark Paid
            </button>
            <button onClick={() => bulkMutation.mutate({ ids: selected, status: 'unpaid' })}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              <XCircle size={14} /> Mark Unpaid
            </button>
            <button onClick={() => bulkMutation.mutate({ ids: selected, status: 'on_hold' })}
              className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">
              On Hold
            </button>
          </div>
        )}
      </div>

      <div className="card p-0">
        <Table
          headers={isAdmin
            ? ['', 'Employee', 'Dept', 'Month/Year', 'Basic', 'Net Salary', 'Status', 'Paid Date', 'Actions']
            : ['Employee', 'Dept', 'Month/Year', 'Basic', 'Net Salary', 'Status', 'Paid Date', 'Payslip']}
          loading={isLoading}
        >
          {records.length === 0 && !isLoading ? (
            <tr><td colSpan={9}><EmptyState title="No salary records" subtitle="Add salary records for this month" /></td></tr>
          ) : records.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              {isAdmin && (
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(r.id)}
                    onChange={e => setSelected(s => e.target.checked ? [...s, r.id] : s.filter(x => x !== r.id))}
                    className="rounded border-gray-300" />
                </td>
              )}
              <td className="px-4 py-3">
                <p className="font-medium text-sm text-gray-900">{r.employee_name}</p>
                <p className="text-xs text-gray-400">{r.employee_code}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{r.department || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{MONTHS[r.month]} {r.year}</td>
              <td className="px-4 py-3 text-sm">₹{Number(r.basic_salary).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{Number(r.net_salary).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-600">{r.paid_date ? format(new Date(r.paid_date), 'dd MMM yyyy') : '—'}</td>
              <td className="px-4 py-3 flex gap-1">
                {/* Payslip button — always visible */}
                <button
                  onClick={() => setPayslipRecord(r)}
                  title="View Payslip"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 3px 8px rgba(99,102,241,0.3)' }}
                >
                  <FileText size={13} /> Payslip
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
        {isAdmin && records.length > 0 && (
          <div className="px-4 py-2 border-t flex items-center gap-2">
            <input type="checkbox" checked={allSelected} onChange={e => setSelected(e.target.checked ? records.map(r => r.id) : [])} className="rounded" />
            <span className="text-sm text-gray-500">Select all on this page</span>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editItem ? 'Edit Salary Record' : 'Add Salary Record'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Employee" required>
              <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
                <option value="">-- Select Employee --</option>
                {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Month" required>
              <select className="input-field" name="month" value={form.month} onChange={handleFormChange}>
                <option value="">-- Month --</option>
                {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </FormField>
            <InputField label="Year" required name="year" type="number" value={form.year} onChange={handleFormChange} />
            <InputField label="Basic Salary (₹)" required name="basic_salary" type="number" value={form.basic_salary} onChange={handleFormChange} />
            <InputField label="HRA (₹)" name="hra" type="number" value={form.hra} onChange={handleFormChange} />
            <InputField label="Allowances (₹)" name="allowances" type="number" value={form.allowances} onChange={handleFormChange} />
            <InputField label="PF Deduction (₹)" name="pf_deduction" type="number" value={form.pf_deduction} onChange={handleFormChange} />
            <InputField label="Tax Deduction (₹)" name="tax_deduction" type="number" value={form.tax_deduction} onChange={handleFormChange} />
            <InputField label="Other Deductions (₹)" name="deductions" type="number" value={form.deductions} onChange={handleFormChange} />
            <div className="bg-blue-50 rounded-xl p-3 flex flex-col justify-center">
              <p className="text-xs text-blue-600 font-medium">Net Salary</p>
              <p className="text-xl font-bold text-blue-800">₹{Number(form.net_salary || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <FormField label="Payment Status">
              <select className="input-field" name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="on_hold">On Hold</option>
                <option value="partial">Partial</option>
              </select>
            </FormField>
            <InputField label="Paid Date" type="date" value={form.paid_date} onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))} />
            <InputField label="Payment Mode" value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))} placeholder="Bank Transfer, Cheque..." />
            <InputField label="Transaction ID" value={form.transaction_id} onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))} />
          </div>
          <FormField label="Remarks">
            <textarea className="input-field" rows={2} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} message="Delete this salary record?" />

      {/* Payslip Modal */}
      {payslipRecord && <PayslipModal record={payslipRecord} onClose={() => setPayslipRecord(null)} />}
    </div>
  )
}
