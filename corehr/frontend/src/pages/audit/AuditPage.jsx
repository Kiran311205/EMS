import { useQuery } from '@tanstack/react-query'
import { auditAPI } from '../../api'
import { PageHeader, Table, EmptyState } from '../../components/ui'
import { format } from 'date-fns'

export default function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditAPI.list().then(r => r.data.results || r.data),
  })

  const logs = data || []
  const actionColors = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    EXPORT: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Audit Logs" subtitle="All system actions tracked for security and compliance" />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
        All create, update, and delete operations are automatically logged with user info, timestamp, and IP address.
      </div>

      <div className="card p-0">
        <Table headers={['User', 'Role', 'Action', 'Endpoint', 'Method', 'IP Address', 'Timestamp']} loading={isLoading}>
          {logs.length === 0 && !isLoading ? (
            <tr><td colSpan={7}><EmptyState title="No audit logs yet" /></td></tr>
          ) : logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{log.user_name || 'System'}</p>
                <p className="text-xs text-gray-400">{log.user_role || '—'}</p>
              </td>
              <td className="px-4 py-3 text-xs capitalize text-gray-600">{log.user_role || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs truncate">{log.endpoint}</td>
              <td className="px-4 py-3 text-xs font-semibold text-gray-700">{log.method}</td>
              <td className="px-4 py-3 text-xs font-mono text-gray-600">{log.ip_address || '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {log.timestamp ? format(new Date(log.timestamp), 'dd MMM yyyy HH:mm') : '—'}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  )
}
