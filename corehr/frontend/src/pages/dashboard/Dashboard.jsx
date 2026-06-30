import { useQuery } from '@tanstack/react-query'
import { reportsAPI, employeesAPI, salaryAPI } from '../../api'
import { StatCard } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { Users, UserCheck, Laptop, CreditCard, IndianRupee, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const { data: dashData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsAPI.dashboard().then(r => r.data),
  })


  const { data: salaryStats } = useQuery({
    queryKey: ['salary-stats', month, year],
    queryFn: () => salaryAPI.stats({ month, year }).then(r => r.data),
  })

  const emp = dashData?.employees || {}
  const assets = dashData?.assets || {}
  const salary = dashData?.salary || {}

  const empChartData = [
    { name: 'Active', value: emp.active || 0 },
    { name: 'On Leave', value: emp.on_leave || 0 },
    { name: 'Resigned', value: emp.resigned || 0 },
  ]

  const salaryChartData = [
    { name: 'Paid', value: salary.paid || 0, fill: '#16a34a' },
    { name: 'Unpaid', value: salary.unpaid || 0, fill: '#dc2626' },
    { name: 'On Hold', value: salary.on_hold || 0, fill: '#d97706' },
  ]

  const assetChartData = [
    { name: 'Laptops', received: assets.laptops_received || 0, pending: assets.laptops_pending || 0 },
    { name: 'ID Cards', received: assets.id_cards_received || 0, pending: assets.id_cards_pending || 0 },
    { name: 'Kits', received: assets.kits_received || 0, pending: assets.kits_pending || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-base mt-1 font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Employee Stats */}
      <div>
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3">Employee Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={emp.total || 0} icon={Users} color="blue" />
          <StatCard title="Active" value={emp.active || 0} icon={UserCheck} color="green" />
          <StatCard title="On Leave" value={emp.on_leave || 0} icon={Clock} color="yellow" />
          <StatCard title="Joined This Month" value={emp.this_month_joined || 0} icon={TrendingUp} color="purple" sub={format(today, 'MMMM yyyy')} />
        </div>
      </div>

      {/* Salary Stats (Admin) */}
      {isAdmin && (
        <div>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3">
            Salary — {format(today, 'MMMM yyyy')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Paid" value={salary.paid || 0} icon={IndianRupee} color="green" />
            <StatCard title="Unpaid" value={salary.unpaid || 0} icon={AlertCircle} color="red" />
            <StatCard title="On Hold" value={salary.on_hold || 0} icon={Clock} color="yellow" />
          </div>
        </div>
      )}

      {/* Asset Stats */}
      <div>
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3">Asset Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Laptops Issued" value={assets.laptops_received || 0} icon={Laptop} color="blue" sub={`${assets.laptops_pending || 0} pending`} />
          <StatCard title="ID Cards Issued" value={assets.id_cards_received || 0} icon={CreditCard} color="green" sub={`${assets.id_cards_pending || 0} pending`} />
          <StatCard title="Kits Issued" value={assets.kits_received || 0} icon={UserCheck} color="teal" sub={`${assets.kits_pending || 0} pending`} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee status pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={empChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {empChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Salary bar */}
        {isAdmin && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {salaryChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Asset bar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={assetChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="received" name="Received" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
