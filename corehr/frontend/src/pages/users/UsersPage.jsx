import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../../api'
import { PageHeader, Table, Modal, EmptyState, ConfirmDialog, InputField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const emptyForm = { username: '', email: '', first_name: '', last_name: '', role: 'hr', phone: '', password: '', is_active: true }

export default function UsersPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.list().then(r => r.data.results || r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersAPI.stats().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editItem) {
        // Never send an empty password string to the backend
        const payload = { ...data }
        if (!payload.password || !payload.password.trim()) delete payload.password
        return usersAPI.update(editItem.id, payload)
      }
      return usersAPI.create(data)
    },
    onSuccess: () => {
      toast.success(editItem ? 'User updated' : 'User created')
      qc.invalidateQueries(['users'])
      qc.invalidateQueries(['user-stats'])
      closeModal()
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data?.username) toast.error('Username already exists')
      else if (data?.email) toast.error('Email already exists')
      else toast.error('Failed to save user')
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id) => usersAPI.update(id, { is_active: true }),
    onSuccess: () => {
      toast.success('User activated successfully!')
      qc.invalidateQueries(['users'])
      qc.invalidateQueries(['user-stats'])
    },
    onError: () => toast.error('Failed to activate user'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['users']); setDeleteId(null) },
    onError: () => toast.error('Failed to delete user'),
  })

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (u) => { setEditItem(u); setForm({ ...u, password: '' }); setModal(true) }
  const closeModal = () => { setModal(false); setEditItem(null); setForm(emptyForm) }

  const users = usersData || []

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle="Manage admin and HR accounts"
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add User</button>}
      />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'bg-blue-50 text-blue-700' },
            { label: 'Admins', value: stats.total_admins, color: 'bg-purple-50 text-purple-700' },
            { label: 'HR Managers', value: stats.total_hr, color: 'bg-teal-50 text-teal-700' },
            { label: 'Active', value: stats.active_users, color: 'bg-green-50 text-green-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-0">
        <Table headers={['User', 'Role', 'Email', 'Phone', 'Status', 'Created', 'Actions']} loading={isLoading}>
          {users.length === 0 && !isLoading ? (
            <tr><td colSpan={7}><EmptyState title="No users found" /></td></tr>
          ) : users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: u.role === 'admin' ? '#7c3aed' : '#0d9488' }}>
                    {u.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.full_name || u.username}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                  <Shield size={10} /> {u.role === 'admin' ? 'Admin' : 'HR Manager'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{u.phone || '—'}</td>
              <td className="px-4 py-3">
                <span className={`badge-${u.is_active ? 'active' : 'danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {u.created_at ? format(new Date(u.created_at), 'dd MMM yyyy') : '—'}
              </td>
              <td className="px-4 py-3 flex gap-1 items-center">
                {!u.is_active && (
                  <button
                    onClick={() => activateMutation.mutate(u.id)}
                    disabled={activateMutation.isPending}
                    title="Activate this user"
                    className="p-1.5 rounded hover:bg-green-50 text-green-600 flex items-center gap-1 text-xs font-medium border border-green-200 px-2"
                  >
                    <UserCheck size={14} />
                    Activate
                  </button>
                )}
                <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={closeModal} title={editItem ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            <InputField label="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            <InputField label="Username" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            <InputField label="Email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <InputField label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <FormField label="Role">
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="hr">HR Manager</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            <InputField label={editItem ? 'New Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editItem} />
            <FormField label="Status">
              <select className="input-field" value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} message="Delete this user account permanently?" />
    </div>
  )
}
