import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deptAPI, desigAPI } from '../../api'
import { PageHeader, Table, Modal, InputField, FormField, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Building2, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

// Rotating accent set for department cards — keeps each card distinguishable
// without turning color into a meaningful (and therefore confusing) status signal.
const RAIL_COLORS = ['#0EA894', '#7C6FF0', '#F5A524', '#16213E', '#E5484D']

export default function DepartmentsPage() {
  const qc = useQueryClient()
  const [deptModal, setDeptModal] = useState(false)
  const [desigModal, setDesigModal] = useState(false)
  const [editDept, setEditDept] = useState(null)
  const [editDesig, setEditDesig] = useState(null)
  const [deleteDeptId, setDeleteDeptId] = useState(null)
  const [deleteDesigId, setDeleteDesigId] = useState(null)
  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [desigForm, setDesigForm] = useState({ title: '', department: '' })

  const { data: depts, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => deptAPI.list().then(r => r.data.results || r.data),
  })

  const { data: desigs, isLoading: loadingDesigs } = useQuery({
    queryKey: ['designations'],
    queryFn: () => desigAPI.list().then(r => r.data.results || r.data),
  })

  const deptMutation = useMutation({
    mutationFn: (data) => editDept ? deptAPI.update(editDept.id, data) : deptAPI.create(data),
    onSuccess: () => {
      toast.success(editDept ? 'Department updated' : 'Department created')
      qc.invalidateQueries(['departments'])
      setDeptModal(false)
      setEditDept(null)
      setDeptForm({ name: '', description: '' })
    },
    onError: () => toast.error('Failed to save department'),
  })

  const deleteDeptMutation = useMutation({
    mutationFn: (id) => deptAPI.delete(id),
    onSuccess: () => { toast.success('Department deleted'); qc.invalidateQueries(['departments']); setDeleteDeptId(null) },
    onError: () => toast.error('Cannot delete — employees may be linked to this department'),
  })

  const desigMutation = useMutation({
    mutationFn: (data) => editDesig ? desigAPI.update(editDesig.id, data) : desigAPI.create(data),
    onSuccess: () => {
      toast.success(editDesig ? 'Designation updated' : 'Designation created')
      qc.invalidateQueries(['designations'])
      setDesigModal(false)
      setEditDesig(null)
      setDesigForm({ title: '', department: '' })
    },
    onError: () => toast.error('Failed to save designation'),
  })

  const deleteDesigMutation = useMutation({
    mutationFn: (id) => desigAPI.delete(id),
    onSuccess: () => { toast.success('Designation deleted'); qc.invalidateQueries(['designations']); setDeleteDesigId(null) },
    onError: () => toast.error('Cannot delete — employees may be linked to this designation'),
  })

  const openEditDept = (d) => { setEditDept(d); setDeptForm({ name: d.name, description: d.description }); setDeptModal(true) }
  const openEditDesig = (d) => { setEditDesig(d); setDesigForm({ title: d.title, department: d.department }); setDesigModal(true) }

  const deptOptions = (depts || []).map(d => ({ value: d.id, label: d.name }))
  const deleteDeptTarget = (depts || []).find(d => d.id === deleteDeptId)

  return (
    <div className="space-y-8" style={{ fontFamily: 'var(--font-body)' }}>
      <PageHeader title="Departments & Designations" subtitle="Manage your org structure" />

      {/* Departments — card grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <Building2 size={18} style={{ color: 'var(--accent)' }} /> Departments
            <span className="mono-chip text-gray-400">({(depts || []).length})</span>
          </h2>
          <button
            onClick={() => { setEditDept(null); setDeptForm({ name: '', description: '' }); setDeptModal(true) }}
            className="btn-ledger-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Add Department
          </button>
        </div>

        {loadingDepts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="ledger-card h-28 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : (depts || []).length === 0 ? (
          <div className="ledger-card p-8">
            <EmptyState title="No departments yet" subtitle="Add your first department to start organizing your team" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(depts || []).map((d, i) => (
              <div
                key={d.id}
                className="ledger-card accent-rail p-4 pl-6 group transition-shadow hover:shadow-md"
                style={{ '--tile-color': RAIL_COLORS[i % RAIL_COLORS.length] }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>{d.name}</h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>{d.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEditDept(d)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--amber)' }} title="Edit">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => setDeleteDeptId(d.id)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--rose)' }} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 flex items-center gap-1.5 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
                  <Layers size={12} />
                  <span className="mono-chip">{d.employee_count ?? 0}</span> active employees
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Designations — table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold" style={{ color: 'var(--ink)' }}>Designations</h2>
          <button
            onClick={() => { setEditDesig(null); setDesigForm({ title: '', department: '' }); setDesigModal(true) }}
            className="btn-ledger-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Add Designation
          </button>
        </div>
        <div className="ledger-card overflow-hidden">
          <Table headers={['Title', 'Department', 'Actions']} loading={loadingDesigs}>
            {(desigs || []).length === 0 && !loadingDesigs ? (
              <tr><td colSpan={3}><EmptyState title="No designations yet" /></td></tr>
            ) : (desigs || []).map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--ink)' }}>{d.title}</td>
                <td className="px-4 py-3 text-sm">
                  {d.department_name
                    ? <span className="mono-chip px-2 py-0.5 rounded-md" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{d.department_name}</span>
                    : <span style={{ color: 'var(--muted)' }}>—</span>}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEditDesig(d)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--amber)' }}><Edit size={14} /></button>
                  <button onClick={() => setDeleteDesigId(d.id)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: 'var(--rose)' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </section>

      {/* Department Modal */}
      <Modal open={deptModal} onClose={() => setDeptModal(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <InputField label="Department Name" required value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
          <FormField label="Description">
            <textarea className="input-field" rows={3} value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDeptModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => deptMutation.mutate(deptForm)} disabled={deptMutation.isPending} className="btn-ledger-primary">
              {deptMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Designation Modal */}
      <Modal open={desigModal} onClose={() => setDesigModal(false)} title={editDesig ? 'Edit Designation' : 'Add Designation'}>
        <div className="space-y-4">
          <InputField label="Designation Title" required value={desigForm.title} onChange={e => setDesigForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Developer" />
          <FormField label="Department">
            <select className="input-field" value={desigForm.department} onChange={e => setDesigForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">-- Select Department --</option>
              {deptOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDesigModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => desigMutation.mutate(desigForm)} disabled={desigMutation.isPending} className="btn-ledger-primary">
              {desigMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteDeptId}
        onClose={() => setDeleteDeptId(null)}
        onConfirm={() => deleteDeptMutation.mutate(deleteDeptId)}
        message={deleteDeptTarget?.employee_count
          ? `Delete "${deleteDeptTarget.name}"? ${deleteDeptTarget.employee_count} employee(s) will lose their department.`
          : `Delete this department?`}
      />
      <ConfirmDialog open={!!deleteDesigId} onClose={() => setDeleteDesigId(null)} onConfirm={() => deleteDesigMutation.mutate(deleteDesigId)} message="Delete this designation?" />
    </div>
  )
}