import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesAPI } from '../../api'
import { Table, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Search, Eye, Pencil, Trash2, Download, LayoutGrid, List as ListIcon, Users, Briefcase, Clock3, LogOut, CalendarPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const getPhotoUrl = (photo) => {
  if (!photo) return null
  try { return new URL(photo).pathname } catch { return photo }
}

const STATUS_STYLES = {
  active: { bg: 'var(--success-tint)', fg: 'var(--success)' },
  probation: { bg: 'var(--info-tint)', fg: 'var(--info)' },
  on_leave: { bg: 'var(--warning-tint)', fg: 'var(--warning)' },
  resigned: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
  terminated: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
}

function Pill({ status }) {
  const s = STATUS_STYLES[status] || { bg: 'var(--paper)', fg: 'var(--slate)' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.fg }}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function BadgeAvatar({ photo, name, size = 40 }) {
  const url = getPhotoUrl(photo)
  return (
    <div className="badge-avatar flex-shrink-0 bg-[var(--gold-tint)] flex items-center justify-center overflow-hidden text-[var(--gold-dark)] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
      ) : null}
      <span style={{ display: url ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{name?.[0]}</span>
    </div>
  )
}

export default function EmployeeList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const qc = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list') // 'list' | 'grid' — addon

  // debounce search input so we don't refire the query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, statusFilter, page],
    queryFn: () => employeesAPI.list({ search, status: statusFilter || undefined, page }).then(r => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => employeesAPI.stats().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeesAPI.delete(id),
    onSuccess: () => {
      toast.success('Employee deleted')
      qc.invalidateQueries(['employees'])
      qc.invalidateQueries(['employee-stats'])
      qc.invalidateQueries(['dashboard'])
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  const employees = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 20)

  const statTiles = useMemo(() => stats ? [
    { label: 'Active', value: stats.active, icon: Users, fg: 'var(--success)', bg: 'var(--success-tint)' },
    { label: 'On leave', value: stats.on_leave, icon: Clock3, fg: 'var(--warning)', bg: 'var(--warning-tint)' },
    { label: 'Probation', value: stats.probation, icon: Briefcase, fg: 'var(--info)', bg: 'var(--info-tint)' },
    { label: 'Resigned', value: stats.resigned, icon: LogOut, fg: 'var(--danger)', bg: 'var(--danger-tint)' },
    { label: 'Joined this month', value: stats.this_month_joined, icon: CalendarPlus, fg: 'var(--gold-dark)', bg: 'var(--gold-tint)' },
  ] : [], [stats])

  // CSV export addon — exports the current page of results
  const exportCsv = () => {
    if (!employees.length) { toast.error('No employees to export'); return }
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Status', 'Type', 'Joined']
    const rows = employees.map(e => [
      e.employee_id, e.full_name, e.department_name || '', e.designation_title || '',
      e.status, e.employment_type, e.date_joined || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `employees-page-${page}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported CSV')
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-[var(--line)] pb-5">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-[var(--gold-dark)] uppercase mb-1">Personnel roster</p>
          <h1 className="font-display text-3xl text-[var(--ink)]">Employees</h1>
          <p className="text-sm text-[var(--slate)] mt-1">{data?.count || 0} people on record</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
            <Download size={15} /> Export
          </button>
          <button onClick={() => navigate('/employees/new')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add employee
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statTiles.map((s) => (
            <div key={s.label} className="card !p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.fg }}>
                <s.icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl leading-none text-[var(--ink)]">{s.value ?? 0}</p>
                <p className="text-xs text-[var(--slate)] truncate mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card !p-3.5 flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-soft)]" />
          <input
            type="text"
            placeholder="Search by name, ID, email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field sm:w-40"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
          <option value="on_leave">On leave</option>
          <option value="probation">Probation</option>
          <option value="terminated">Terminated</option>
        </select>

        {/* view toggle addon */}
        <div className="flex rounded-lg border border-[var(--line)] overflow-hidden flex-shrink-0">
          <button onClick={() => setView('list')} className="px-3 flex items-center justify-center"
            style={{ background: view === 'list' ? 'var(--gold-tint)' : 'transparent', color: view === 'list' ? 'var(--gold-dark)' : 'var(--slate)' }}>
            <ListIcon size={16} />
          </button>
          <button onClick={() => setView('grid')} className="px-3 flex items-center justify-center border-l border-[var(--line)]"
            style={{ background: view === 'grid' ? 'var(--gold-tint)' : 'transparent', color: view === 'grid' ? 'var(--gold-dark)' : 'var(--slate)' }}>
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {employees.length === 0 && !isLoading && (
        <div className="card">
          <EmptyState title="No employees found" subtitle="Add your first employee to get started"
            action={<button onClick={() => navigate('/employees/new')} className="btn-primary">Add employee</button>} />
        </div>
      )}

      {/* Grid view — addon */}
      {view === 'grid' && employees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="card !p-4 hover:border-[var(--gold)] transition-colors cursor-pointer"
              onClick={() => navigate(`/employees/${emp.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <BadgeAvatar photo={emp.photo} name={emp.full_name} size={48} />
                <Pill status={emp.status} />
              </div>
              <p className="font-medium text-[var(--ink)]">{emp.full_name}</p>
              <p className="font-mono text-xs text-[var(--slate)] mb-2">{emp.employee_id}</p>
              <p className="text-sm text-[var(--slate)]">{emp.designation_title || 'No designation'}</p>
              <p className="text-sm text-[var(--slate)]">{emp.department_name || 'No department'}</p>
              <div className="stub-divider my-3" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--slate-soft)]">
                  Joined {emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—'}
                </span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-1.5 rounded-md hover:bg-[var(--gold-tint)] text-[var(--gold-dark)]"><Pencil size={13} /></button>
                  {isAdmin && <button onClick={() => setDeleteId(emp.id)} className="p-1.5 rounded-md hover:bg-[var(--danger-tint)] text-[var(--danger)]"><Trash2 size={13} /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="card !p-0 overflow-hidden">
          <Table
            headers={['Employee', 'Department', 'Designation', 'Status', 'Type', 'Joined', 'Actions']}
            loading={isLoading}
          >
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-[var(--paper)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BadgeAvatar photo={emp.photo} name={emp.full_name} size={38} />
                    <div>
                      <p className="font-medium text-[var(--ink)] text-sm">{emp.full_name}</p>
                      <p className="font-mono text-[11px] text-[var(--slate-soft)]">{emp.employee_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--slate)]">{emp.department_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-[var(--slate)]">{emp.designation_title || '—'}</td>
                <td className="px-4 py-3"><Pill status={emp.status} /></td>
                <td className="px-4 py-3 text-sm text-[var(--slate)] capitalize">{emp.employment_type?.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-sm text-[var(--slate)]">
                  {emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-1.5 rounded-lg hover:bg-[var(--info-tint)] text-[var(--info)]" title="View"><Eye size={15} /></button>
                    <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-1.5 rounded-lg hover:bg-[var(--gold-tint)] text-[var(--gold-dark)]" title="Edit"><Pencil size={15} /></button>
                    {isAdmin && (
                      <button onClick={() => setDeleteId(emp.id)} className="p-1.5 rounded-lg hover:bg-[var(--danger-tint)] text-[var(--danger)]" title="Delete"><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--line)]">
              <p className="text-sm text-[var(--slate)]">
                Page {page} of {totalPages} <span className="font-mono text-xs">({data?.count} total)</span>
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Previous</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        message="This will permanently delete the employee and all related records."
      />
    </div>
  )
}