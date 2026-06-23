// Stat card for dashboard
export function StatCard({ title, value, icon: Icon, color = 'blue', sub }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// Page header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  )
}

// Loading spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizes[size]}`} />
  )
}

// Empty state
export function EmptyState({ title = 'No data found', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📋</span>
      </div>
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Status badge
export function StatusBadge({ status }) {
  const map = {
    active: 'badge-active',
    paid: 'badge-active',
    approved: 'badge-active',
    received: 'badge-active',
    present: 'badge-active',
    resigned: 'badge-danger',
    terminated: 'badge-danger',
    unpaid: 'badge-danger',
    rejected: 'badge-danger',
    not_received: 'badge-danger',
    absent: 'badge-danger',
    pending: 'badge-pending',
    on_hold: 'badge-pending',
    on_leave: 'badge-pending',
    half_day: 'badge-pending',
    probation: 'badge-pending',
    partial: 'badge-pending',
  }
  const labels = {
    active: 'Active', paid: 'Paid', approved: 'Approved', received: 'Received',
    resigned: 'Resigned', terminated: 'Terminated', unpaid: 'Unpaid', rejected: 'Rejected',
    not_received: 'Not Received', pending: 'Pending', on_hold: 'On Hold',
    on_leave: 'On Leave', probation: 'Probation', partial: 'Partial',
    present: 'Present', absent: 'Absent', half_day: 'Half Day',
  }
  return (
    <span className={map[status] || 'badge-inactive'}>
      {labels[status] || status}
    </span>
  )
}

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  )
}

// Table wrapper
export function Table({ headers, children, loading }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={headers.length} className="text-center py-12">
              <div className="flex justify-center"><Spinner /></div>
            </td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

// Form field
export function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

// Select input
export function SelectField({ label, required, error, options, ...props }) {
  return (
    <FormField label={label} required={required} error={error}>
      <select className="input-field" {...props}>
        <option value="">-- Select --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FormField>
  )
}

// Text input
export function InputField({ label, required, error, ...props }) {
  return (
    <FormField label={label} required={required} error={error}>
      <input className="input-field" {...props} />
    </FormField>
  )
}

// Confirm delete dialog
export function ConfirmDialog({ open, onClose, onConfirm, message = 'Are you sure you want to delete this?' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
          <p className="text-gray-500 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={onConfirm} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
