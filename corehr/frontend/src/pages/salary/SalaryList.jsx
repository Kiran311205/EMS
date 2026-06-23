import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salaryAPI, employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, Modal, EmptyState, ConfirmDialog, InputField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
const emptyForm = { employee: '', month: '', year: new Date().getFullYear(), basic_salary: '', hra: 0, allowances: 0, deductions: 0, pf_deduction: 0, tax_deduction: 0, net_salary: '', status: 'unpaid', paid_date: '', payment_mode: '', transaction_id: '', remarks: '' }

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

  // Auto-calculate net salary
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
        title="Salary Management"
        subtitle="Monthly salary records and payment tracking"
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
        <Table headers={isAdmin ? ['', 'Employee', 'Dept', 'Month/Year', 'Basic', 'Net Salary', 'Status', 'Paid Date', 'Actions'] : ['Employee', 'Dept', 'Month/Year', 'Basic', 'Net Salary', 'Status', 'Paid Date']} loading={isLoading}>
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
              {isAdmin && (
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                </td>
              )}
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
    </div>
  )
}
