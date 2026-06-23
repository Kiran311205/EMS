import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deptAPI, desigAPI } from '../../api'
import { PageHeader, Table, Modal, InputField, FormField, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

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

  return (
    <div className="space-y-6">
      <PageHeader title="Departments & Designations" subtitle="Manage org structure" />

      {/* Departments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Building2 size={18} className="text-primary-600" /> Departments
          </h2>
          <button onClick={() => { setEditDept(null); setDeptForm({ name: '', description: '' }); setDeptModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Department
          </button>
        </div>
        <Table headers={['Name', 'Description', 'Active Employees', 'Actions']} loading={loadingDepts}>
          {(depts || []).length === 0 && !loadingDepts ? (
            <tr><td colSpan={4}><EmptyState title="No departments yet" /></td></tr>
          ) : (depts || []).map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-sm text-gray-900">{d.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{d.description || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{d.employee_count ?? '—'}</td>
              <td className="px-4 py-3 flex gap-2">
                <button onClick={() => openEditDept(d)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button onClick={() => setDeleteDeptId(d.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Designations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Designations</h2>
          <button onClick={() => { setEditDesig(null); setDesigForm({ title: '', department: '' }); setDesigModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Designation
          </button>
        </div>
        <Table headers={['Title', 'Department', 'Actions']} loading={loadingDesigs}>
          {(desigs || []).length === 0 && !loadingDesigs ? (
            <tr><td colSpan={3}><EmptyState title="No designations yet" /></td></tr>
          ) : (desigs || []).map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-sm text-gray-900">{d.title}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{d.department_name || '—'}</td>
              <td className="px-4 py-3 flex gap-2">
                <button onClick={() => openEditDesig(d)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button onClick={() => setDeleteDesigId(d.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Department Modal */}
      <Modal open={deptModal} onClose={() => setDeptModal(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <InputField label="Department Name" required value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
          <FormField label="Description">
            <textarea className="input-field" rows={3} value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDeptModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={() => deptMutation.mutate(deptForm)} disabled={deptMutation.isPending} className="btn-primary">
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
            <button onClick={() => desigMutation.mutate(desigForm)} disabled={desigMutation.isPending} className="btn-primary">
              {desigMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteDeptId} onClose={() => setDeleteDeptId(null)} onConfirm={() => deleteDeptMutation.mutate(deleteDeptId)} message="Delete this department? Employees linked to it will lose their department." />
      <ConfirmDialog open={!!deleteDesigId} onClose={() => setDeleteDesigId(null)} onConfirm={() => deleteDesigMutation.mutate(deleteDesigId)} message="Delete this designation?" />
    </div>
  )
}
