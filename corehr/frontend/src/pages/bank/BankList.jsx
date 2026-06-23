import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bankAPI, employeesAPI } from '../../api'
import { PageHeader, Table, Modal, EmptyState, ConfirmDialog, InputField, SelectField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { employee: '', account_holder_name: '', account_number: '', bank_name: '', branch_name: '', ifsc_code: '', account_type: 'savings', micr_code: '' }

export default function BankList() {
  const { isHR } = useAuth()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showAccNum, setShowAccNum] = useState({})

  const { data: bankList, isLoading } = useQuery({
    queryKey: ['bank-list'],
    queryFn: () => bankAPI.list().then(r => r.data.results || r.data),
    enabled: isHR,
  })

  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
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

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (b) => { setEditItem(b); setForm({ ...b }); setModal(true) }
  const closeModal = () => { setModal(false); setEditItem(null); setForm(emptyForm) }

  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))
  const banks = bankList || []

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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <CreditCard size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-amber-700 text-sm font-medium">This section is restricted to HR personnel only. All access is logged.</p>
      </div>

      <div className="card p-0">
        <Table headers={['Employee', 'Bank', 'Account Type', 'Account Number', 'IFSC', 'Branch', 'Actions']} loading={isLoading}>
          {banks.length === 0 && !isLoading ? (
            <tr><td colSpan={7}><EmptyState title="No bank details added" subtitle="Add employee bank accounts for salary processing" /></td></tr>
          ) : banks.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-sm text-gray-900">{b.employee_name}</p>
                <p className="text-xs text-gray-400">{b.employee_code}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">{b.bank_name}</td>
              <td className="px-4 py-3 text-sm capitalize text-gray-600">{b.account_type}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-mono">
                  {showAccNum[b.id] ? b.account_number : `${'•'.repeat(b.account_number?.length - 4 || 4)}${b.account_number?.slice(-4)}`}
                  <button onClick={() => setShowAccNum(s => ({ ...s, [b.id]: !s[b.id] }))} className="text-gray-400 hover:text-gray-700">
                    {showAccNum[b.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-700">{b.ifsc_code}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{b.branch_name || '—'}</td>
              <td className="px-4 py-3 flex gap-1">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={closeModal} title={editItem ? 'Edit Bank Details' : 'Add Bank Details'}>
        <div className="space-y-4">
          <FormField label="Employee" required>
            <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
              <option value="">-- Select Employee --</option>
              {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Account Holder Name" required value={form.account_holder_name} onChange={e => setForm(f => ({ ...f, account_holder_name: e.target.value }))} />
            <InputField label="Bank Name" required value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
            <InputField label="Account Number" required value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} />
            <InputField label="IFSC Code" required value={form.ifsc_code} onChange={e => setForm(f => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))} maxLength={11} />
            <InputField label="Branch Name" value={form.branch_name} onChange={e => setForm(f => ({ ...f, branch_name: e.target.value }))} />
            <FormField label="Account Type">
              <select className="input-field" value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
              </select>
            </FormField>
            <InputField label="MICR Code" value={form.micr_code} onChange={e => setForm(f => ({ ...f, micr_code: e.target.value }))} maxLength={9} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} message="Delete this bank detail record?" />
    </div>
  )
}
