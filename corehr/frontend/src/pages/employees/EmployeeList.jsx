import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesAPI } from '../../api'
import { PageHeader, Table, StatusBadge, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Search, Eye, Edit, Trash2, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const getPhotoUrl = (photo) => {
  if (!photo) return null
  try { return new URL(photo).pathname } catch { return photo }
}

export default function EmployeeList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [page, setPage] = useState(1)

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
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  const employees = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 20)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        subtitle={`${data?.count || 0} total employees`}
        action={
          <button onClick={() => navigate('/employees/new')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: 'Active', value: stats.active, color: 'text-green-600 bg-green-50' },
            { label: 'On Leave', value: stats.on_leave, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Probation', value: stats.probation, color: 'text-blue-600 bg-blue-50' },
            { label: 'Resigned', value: stats.resigned, color: 'text-red-600 bg-red-50' },
            { label: 'This Month', value: stats.this_month_joined, color: 'text-purple-600 bg-purple-50' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field sm:w-40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
          <option value="on_leave">On Leave</option>
          <option value="probation">Probation</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0">
        <Table
          headers={['Employee', 'Department', 'Designation', 'Status', 'Type', 'Joined', 'Actions']}
          loading={isLoading}
        >
          {employees.length === 0 && !isLoading ? (
            <tr><td colSpan={7}>
              <EmptyState title="No employees found" subtitle="Add your first employee to get started"
                action={<button onClick={() => navigate('/employees/new')} className="btn-primary">Add Employee</button>} />
            </td></tr>
          ) : employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0 overflow-hidden">
                    {emp.photo
                      ? <img src={getPhotoUrl(emp.photo)} alt={emp.full_name} className="w-9 h-9 rounded-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                      : null}
                    <span style={{ display: emp.photo ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">{emp.full_name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.employee_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{emp.department_name || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{emp.designation_title || '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-600 capitalize">{emp.employment_type?.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {emp.date_joined ? format(new Date(emp.date_joined), 'dd MMM yyyy') : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/employees/${emp.id}`)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => navigate(`/employees/${emp.id}/edit`)}
                    className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors" title="Edit">
                    <Edit size={15} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => setDeleteId(emp.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({data?.count} total)
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-3 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        message="This will permanently delete the employee and all related records."
      />
    </div>
  )
}
