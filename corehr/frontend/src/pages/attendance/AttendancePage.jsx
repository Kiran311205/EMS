// AttendancePage.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceAPI, employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, Modal, EmptyState, FormField, InputField } from '../../components/ui'
import { Plus, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const emptyForm = { employee: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'present', check_in: '', check_out: '', remarks: '' }

export default function AttendancePage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance', filterDate],
    queryFn: () => attendanceAPI.list({ date: filterDate }).then(r => r.data.results || r.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => editItem ? attendanceAPI.update(editItem.id, data) : attendanceAPI.create(data),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries(['attendance']); setModal(false); setForm(emptyForm) },
    onError: (err) => {
      if (err?.response?.data?.non_field_errors) toast.error('Record already exists for this employee/date')
      else toast.error('Failed to save')
    },
  })

  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))
  const list = records || []
  const statusCounts = list.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" subtitle="Daily attendance tracking"
        action={<button onClick={() => { setEditItem(null); setForm(emptyForm); setModal(true) }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Mark Attendance</button>} />

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <InputField label="" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <div className="flex gap-3 text-sm ml-auto">
          {Object.entries(statusCounts).map(([s, c]) => (
            <span key={s} className="font-medium text-gray-600">{s.replace('_', ' ')}: <strong>{c}</strong></span>
          ))}
        </div>
      </div>

      <div className="card p-0">
        <Table headers={['Employee', 'Date', 'Status', 'Check In', 'Check Out', 'Remarks', 'Actions']} loading={isLoading}>
          {list.length === 0 && !isLoading ? (
            <tr><td colSpan={7}><EmptyState title="No attendance records for this date" /></td></tr>
          ) : list.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.employee_name}</td>
              <td className="px-4 py-3 text-sm">{format(new Date(r.date), 'dd MMM yyyy')}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-600">{r.check_in || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{r.check_out || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.remarks || '—'}</td>
              <td className="px-4 py-3">
                <button onClick={() => { setEditItem(r); setForm({ ...r }); setModal(true) }} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Attendance' : 'Mark Attendance'}>
        <div className="space-y-4">
          <FormField label="Employee" required>
            <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
              <option value="">-- Select Employee --</option>
              {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Date" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <FormField label="Status">
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
                <option value="work_from_home">WFH</option>
                <option value="holiday">Holiday</option>
              </select>
            </FormField>
            <InputField label="Check In" type="time" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
            <InputField label="Check Out" type="time" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <InputField label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
