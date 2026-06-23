import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leavesAPI, employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, Modal, EmptyState, FormField, InputField } from '../../components/ui'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const emptyForm = { employee: '', leave_type: 'sick', from_date: '', to_date: '', days: 1, reason: '' }

export default function LeavesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', statusFilter],
    queryFn: () => leavesAPI.list({ status: statusFilter || undefined }).then(r => r.data.results || r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['leaves-stats'],
    queryFn: () => leavesAPI.stats().then(r => r.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data) => leavesAPI.create(data),
    onSuccess: () => { toast.success('Leave request added'); qc.invalidateQueries(['leaves']); qc.invalidateQueries(['leaves-stats']); setModal(false); setForm(emptyForm) },
    onError: () => toast.error('Failed to add'),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }) => action === 'approve' ? leavesAPI.approve(id, note) : leavesAPI.reject(id, note),
    onSuccess: () => { toast.success('Leave request updated'); qc.invalidateQueries(['leaves']); qc.invalidateQueries(['leaves-stats']); setReviewModal(null); setReviewNote('') },
    onError: () => toast.error('Failed to update'),
  })

  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))
  const list = leaves || []

  return (
    <div className="space-y-5">
      <PageHeader title="Leave Requests" subtitle="Manage employee leave applications"
        action={<button onClick={() => { setModal(true); setForm(emptyForm) }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Leave</button>} />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 flex gap-3">
        <select className="input-field w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card p-0">
        <Table headers={['Employee', 'Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions']} loading={isLoading}>
          {list.length === 0 && !isLoading ? (
            <tr><td colSpan={8}><EmptyState title="No leave requests" /></td></tr>
          ) : list.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.employee_name}<p className="text-xs text-gray-400">{r.department}</p></td>
              <td className="px-4 py-3 text-sm capitalize">{r.leave_type_display || r.leave_type}</td>
              <td className="px-4 py-3 text-sm">{format(new Date(r.from_date), 'dd MMM yyyy')}</td>
              <td className="px-4 py-3 text-sm">{format(new Date(r.to_date), 'dd MMM yyyy')}</td>
              <td className="px-4 py-3 text-sm text-center font-semibold">{r.days}</td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.reason}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                {r.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => setReviewModal({ id: r.id, action: 'approve' })} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve"><CheckCircle size={15} /></button>
                    <button onClick={() => setReviewModal({ id: r.id, action: 'reject' })} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Reject"><XCircle size={15} /></button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Leave Request">
        <div className="space-y-4">
          <FormField label="Employee" required>
            <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
              <option value="">-- Select Employee --</option>
              {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Leave Type">
              <select className="input-field" value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))}>
                {['sick','casual','earned','maternity','paternity','unpaid','other'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
                ))}
              </select>
            </FormField>
            <InputField label="Days" type="number" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} min={1} />
            <InputField label="From Date" type="date" required value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} />
            <InputField label="To Date" type="date" required value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} />
          </div>
          <FormField label="Reason" required>
            <textarea className="input-field" rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary">{createMutation.isPending ? 'Saving...' : 'Submit'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title={reviewModal?.action === 'approve' ? 'Approve Leave' : 'Reject Leave'} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Add a note (optional):</p>
          <textarea className="input-field" rows={3} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Reason or notes..." />
          <div className="flex justify-end gap-3">
            <button onClick={() => setReviewModal(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => reviewMutation.mutate({ id: reviewModal.id, action: reviewModal.action, note: reviewNote })}
              disabled={reviewMutation.isPending}
              className={reviewModal?.action === 'approve' ? 'btn-primary' : 'btn-danger'}
            >
              {reviewMutation.isPending ? 'Saving...' : (reviewModal?.action === 'approve' ? 'Approve' : 'Reject')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
