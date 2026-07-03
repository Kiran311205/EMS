import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bankAPI, employeesAPI } from '../../api'
import { PageHeader, Table, Modal, EmptyState, ConfirmDialog, InputField, SelectField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff, Copy, Check, ShieldCheck, Search, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { employee: '', account_holder_name: '', account_number: '', bank_name: '', branch_name: '', ifsc_code: '', account_type: 'savings', micr_code: '' }

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/

// Masks an account number, always leaving the last 4 digits visible.
// Falls back gracefully when the value is missing instead of printing "undefined".
function maskAccountNumber(value) {
  if (!value) return '—'
  const str = String(value)
  if (str.length <= 4) return str
  return '•'.repeat(str.length - 4) + str.slice(-4)
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          toast.error('Could not copy to clipboard')
        }
      }}
      className="text-gray-400 hover:text-slate-700 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  )
}

export default function BankList() {
  const { isHR } = useAuth()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [showAccNum, setShowAccNum] = useState({})
  const [search, setSearch] = useState('')

  const { data: bankList, isLoading } = useQuery({
    queryKey: ['bank-list'],
    queryFn: () => bankAPI.list().then(r => r.data.results || r.data),
    enabled: isHR,
  })

  // Gated behind isHR — no reason to pull the full employee roster for a page a
  // non-HR user never sees content on.
  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
    enabled: isHR,
  })

  const mutation = useMutation({
    mutationFn: (data) => editItem ? bankAPI.update(editItem.id, data) : bankAPI.create(data),
    onSuccess: () => {
      toast.success(editItem ? 'Bank details updated' : 'Bank details added')
      qc.invalidateQueries(['bank-list'])
      closeModal()
    },
    onError: (err) => {
      const msg = err?.response?.data
      if (msg?.employee) toast.error('Bank details already exist for this employee')
      else toast.error('Failed to save bank details')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => bankAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['bank-list']); setDeleteId(null) },
    onError: () => toast.error('Failed to delete'),
  })

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setErrors({}); setModal(true) }
  const openEdit = (b) => { setEditItem(b); setForm({ ...b }); setErrors({}); setModal(true) }
  const closeModal = () => { setModal(false); setEditItem(null); setForm(emptyForm); setErrors({}) }

  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))
  const banks = bankList || []

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return banks
    return banks.filter(b =>
      b.employee_name?.toLowerCase().includes(q) ||
      b.employee_code?.toLowerCase().includes(q) ||
      b.bank_name?.toLowerCase().includes(q) ||
      b.ifsc_code?.toLowerCase().includes(q)
    )
  }, [banks, search])

  const stats = useMemo(() => {
    const banksRepresented = new Set(banks.map(b => b.bank_name).filter(Boolean)).size
    const salaryAccounts = banks.filter(b => b.account_type === 'salary').length
    return { total: banks.length, banksRepresented, salaryAccounts }
  }, [banks])

  const deleteTarget = banks.find(b => b.id === deleteId)

  const validate = () => {
    const next = {}
    if (!form.employee) next.employee = 'Select an employee'
    if (!form.account_holder_name?.trim()) next.account_holder_name = 'Required'
    if (!form.bank_name?.trim()) next.bank_name = 'Required'
    if (!form.account_number?.trim()) next.account_number = 'Required'
    else if (!/^\d{6,20}$/.test(form.account_number.trim())) next.account_number = 'Digits only, 6–20 characters'
    if (!form.ifsc_code?.trim()) next.ifsc_code = 'Required'
    else if (!IFSC_PATTERN.test(form.ifsc_code.trim())) next.ifsc_code = 'Format: 4 letters, 0, 6 alphanumeric (e.g. HDFC0001234)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      toast.error('Check the highlighted fields')
      return
    }
    mutation.mutate(form)
  }

  if (!isHR) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CreditCard size={48} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-600">Access Restricted</h2>
      <p className="text-gray-400 mt-2">Bank details are only accessible by HR personnel.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bank Details"
        subtitle="Employee bank account information — HR access only"
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Bank Details</button>}
      />

      {/* Clearance strip — replaces the generic amber alert with something that reads
          as an access-control marker rather than a warning toast. */}
      <div className="rounded-xl bg-slate-900 text-slate-100 px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Restricted record set.</span>
            <span className="text-slate-300"> Every view, edit, and export on this page is logged against your HR credential.</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-xs text-slate-300 font-mono flex-shrink-0">
          <span><span className="text-white font-semibold">{stats.total}</span> records</span>
          <span className="text-slate-600">|</span>
          <span><span className="text-white font-semibold">{stats.banksRepresented}</span> banks</span>
          <span className="text-slate-600">|</span>
          <span><span className="text-white font-semibold">{stats.salaryAccounts}</span> salary a/c</span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/60">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by employee, bank, or IFSC…"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-400"
            aria-label="Search bank records"
          />
        </div>

        <Table headers={['Employee', 'Bank', 'Account Type', 'Account Number', 'IFSC', 'Branch', 'Actions']} loading={isLoading}>
          {filteredBanks.length === 0 && !isLoading ? (
            <tr><td colSpan={7}>
              {banks.length === 0 ? (
                <EmptyState title="No bank details added" subtitle="Add employee bank accounts for salary processing" />
              ) : (
                <EmptyState title="No matching records" subtitle={`Nothing matches "${search}"`} />
              )}
            </td></tr>
          ) : filteredBanks.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-sm text-gray-900">{b.employee_name}</p>
                <p className="text-xs text-gray-400 font-mono">{b.employee_code}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Landmark size={13} className="text-gray-300" />
                  {b.bank_name}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize
                  ${b.account_type === 'salary' ? 'bg-slate-100 text-slate-700' :
                    b.account_type === 'current' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {b.account_type}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-mono tabular-nums">
                  {showAccNum[b.id] ? (b.account_number || '—') : maskAccountNumber(b.account_number)}
                  <button
                    type="button"
                    aria-label={showAccNum[b.id] ? 'Hide account number' : 'Reveal account number'}
                    title={showAccNum[b.id] ? 'Hide' : 'Reveal'}
                    onClick={() => setShowAccNum(s => ({ ...s, [b.id]: !s[b.id] }))}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {showAccNum[b.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <CopyButton value={b.account_number} label="account number" />
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-700">
                <div className="flex items-center gap-2">
                  {b.ifsc_code}
                  <CopyButton value={b.ifsc_code} label="IFSC code" />
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{b.branch_name || '—'}</td>
              <td className="px-4 py-3 flex gap-1">
                <button aria-label={`Edit ${b.employee_name}'s bank details`} title="Edit" onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button aria-label={`Delete ${b.employee_name}'s bank details`} title="Delete" onClick={() => setDeleteId(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={closeModal} title={editItem ? 'Edit Bank Details' : 'Add Bank Details'}>
        <div className="space-y-4">
          <FormField label="Employee" required error={errors.employee}>
            <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
              <option value="">-- Select Employee --</option>
              {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Account Holder Name" required value={form.account_holder_name} error={errors.account_holder_name} onChange={e => setForm(f => ({ ...f, account_holder_name: e.target.value }))} />
            <InputField label="Bank Name" required value={form.bank_name} error={errors.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
            <InputField
              label="Account Number"
              required
              value={form.account_number}
              error={errors.account_number}
              onChange={e => setForm(f => ({ ...f, account_number: e.target.value.replace(/\D/g, '') }))}
              inputMode="numeric"
              maxLength={20}
            />
            <InputField label="IFSC Code" required value={form.ifsc_code} error={errors.ifsc_code} onChange={e => setForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))} maxLength={11} className="font-mono" />
            <InputField label="Branch Name" value={form.branch_name} onChange={e => setForm(f => ({ ...f, branch_name: e.target.value }))} />
            <FormField label="Account Type">
              <select className="input-field" value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
              </select>
            </FormField>
            <InputField label="MICR Code" value={form.micr_code} onChange={e => setForm(f => ({ ...f, micr_code: e.target.value }))} maxLength={9} className="font-mono" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        message={deleteTarget
          ? `Delete bank details for ${deleteTarget.employee_name} (${deleteTarget.bank_name})? This cannot be undone.`
          : 'Delete this bank detail record?'}
      />
    </div>
  )
}