import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsAPI, employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, Modal, EmptyState, ConfirmDialog, InputField, SelectField, FormField } from '../../components/ui'
import { Plus, Edit, Trash2, Laptop, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ASSET_TYPES = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'key_card', label: 'Key Card' },
  { value: 'sim_card', label: 'SIM Card' },
  { value: 'kit', label: 'Joining Kit' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'keyboard', label: 'Keyboard' },
  { value: 'headset', label: 'Headset' },
  { value: 'other', label: 'Other' },
]
const STATUS_OPTIONS = [
  { value: 'received', label: 'Received' },
  { value: 'not_received', label: 'Not Received' },
  { value: 'pending', label: 'Pending' },
  { value: 'returned', label: 'Returned' },
  { value: 'damaged', label: 'Damaged' },
]

const emptyForm = { employee: '', asset_type: '', status: 'not_received', serial_number: '', model_name: '', issued_date: '', returned_date: '', notes: '' }

export default function AssetList() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filters, setFilters] = useState({ asset_type: '', status: '' })
  const [tab, setTab] = useState('all')

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetsAPI.list(filters).then(r => r.data.results || r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['asset-stats'],
    queryFn: () => assetsAPI.stats().then(r => r.data),
  })

  const { data: pendingAssets } = useQuery({
    queryKey: ['assets-pending'],
    queryFn: () => assetsAPI.notReceived().then(r => r.data),
    enabled: tab === 'pending',
  })

  const { data: employees } = useQuery({
    queryKey: ['emp-dropdown'],
    queryFn: () => employeesAPI.dropdown().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => editItem ? assetsAPI.update(editItem.id, data) : assetsAPI.create(data),
    onSuccess: () => {
      toast.success(editItem ? 'Asset updated' : 'Asset added')
      qc.invalidateQueries(['assets'])
      qc.invalidateQueries(['asset-stats'])
      closeModal()
    },
    onError: (err) => {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ')
        toast.error(msg)
      } else {
        toast.error('Failed to save asset')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => assetsAPI.delete(id),
    onSuccess: () => { toast.success('Asset deleted'); qc.invalidateQueries(['assets']); qc.invalidateQueries(['asset-stats']); setDeleteId(null) },
    onError: () => toast.error('Failed to delete'),
  })

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (a) => {
    setEditItem(a)
    setForm({
      employee: a.employee,      // this is just the FK id (integer)
      asset_type: a.asset_type,
      status: a.status,
      serial_number: a.serial_number || '',
      model_name: a.model_name || '',
      issued_date: a.issued_date || '',
      returned_date: a.returned_date || '',
      notes: a.notes || '',
    })
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditItem(null); setForm(emptyForm) }

  // Build a clean payload with only writable fields, and ensure employee is an integer id
  const buildPayload = (f) => ({
    employee: typeof f.employee === 'object' ? f.employee?.id : Number(f.employee),
    asset_type: f.asset_type,
    status: f.status,
    serial_number: f.serial_number || '',
    model_name: f.model_name || '',
    issued_date: f.issued_date || null,
    returned_date: f.returned_date || null,
    notes: f.notes || '',
  })

  const assets = tab === 'pending' ? (pendingAssets || []) : (assetsData || [])
  const empOptions = (employees || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))

  return (
    <div className="space-y-5">
      <PageHeader
        title="Asset Tracking"
        subtitle="Laptops, ID cards, kits and other equipment"
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Asset</button>}
      />

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Assets', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Received', value: stats.received, color: 'bg-green-50 text-green-700' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Not Received', value: stats.not_received, color: 'bg-red-50 text-red-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}



      {/* Tabs & filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          {['all', 'pending'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'all' ? 'All Assets' : '⚠️ Not Received / Pending'}
            </button>
          ))}
        </div>
        {tab === 'all' && (
          <div className="flex gap-3">
            <select className="input-field" value={filters.asset_type} onChange={e => setFilters(f => ({ ...f, asset_type: e.target.value }))}>
              <option value="">All Types</option>
              {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select className="input-field" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0">
        <Table headers={['Employee', 'Asset Type', 'Status', 'Serial No.', 'Model', 'Issued Date', 'Actions']} loading={isLoading}>
          {assets.length === 0 && !isLoading ? (
            <tr><td colSpan={7}><EmptyState title="No assets found" /></td></tr>
          ) : assets.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                <p className="font-medium text-gray-900">{a.employee_name}</p>
                <p className="text-xs text-gray-400">{a.employee_id_code}</p>
              </td>
              <td className="px-4 py-3 text-sm">{ASSET_TYPES.find(t => t.value === a.asset_type)?.label || a.asset_type}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-600">{a.serial_number || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{a.model_name || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{a.issued_date ? format(new Date(a.issued_date), 'dd MMM yyyy') : '—'}</td>
              <td className="px-4 py-3 flex gap-1">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Edit size={14} /></button>
                <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editItem ? 'Edit Asset' : 'Add Asset'}>
        <div className="space-y-4">
          <FormField label="Employee" required>
            <select className="input-field" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
              <option value="">-- Select Employee --</option>
              {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Asset Type" required>
              <select className="input-field" value={form.asset_type} onChange={e => setForm(f => ({ ...f, asset_type: e.target.value }))}>
                <option value="">-- Select --</option>
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Status" required>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
            <InputField label="Serial Number" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
            <InputField label="Model Name" value={form.model_name} onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))} />
            <InputField label="Issued Date" type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))} />
            <InputField label="Returned Date" type="date" value={form.returned_date} onChange={e => setForm(f => ({ ...f, returned_date: e.target.value }))} />
          </div>
          <FormField label="Notes">
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={() => mutation.mutate(buildPayload(form))} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : 'Save Asset'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} message="Delete this asset record?" />
    </div>
  )
}
