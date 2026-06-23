import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PageHeader, InputField, FormField } from '../../components/ui'
import { User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [profileForm, setProfileForm] = useState({ first_name: user?.full_name?.split(' ')[0] || '', last_name: user?.full_name?.split(' ').slice(1).join(' ') || '', email: user?.email || '', phone: '' })
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' })

  const profileMutation = useMutation({
    mutationFn: (data) => authAPI.updateMe(data),
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries(['me']) },
    onError: () => toast.error('Failed to update profile'),
  })

  const pwdMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => { toast.success('Password changed'); setPwdForm({ old_password: '', new_password: '' }) },
    onError: (err) => {
      if (err?.response?.data?.error) toast.error(err.response.data.error)
      else toast.error('Failed to change password')
    },
  })

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account settings" />

      {/* Profile info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-800">Personal Information</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.full_name}</p>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
              {user?.role === 'admin' ? '⚡ Admin' : '👤 HR Manager'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="First Name" value={profileForm.first_name} onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))} />
          <InputField label="Last Name" value={profileForm.last_name} onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))} />
          <InputField label="Email" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
          <InputField label="Phone" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9999999999" />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => profileMutation.mutate(profileForm)} disabled={profileMutation.isPending} className="btn-primary flex items-center gap-2">
            <Save size={15} /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-800">Change Password</h2>
        </div>
        <div className="space-y-4">
          <InputField label="Current Password" type="password" value={pwdForm.old_password} onChange={e => setPwdForm(f => ({ ...f, old_password: e.target.value }))} />
          <InputField label="New Password" type="password" value={pwdForm.new_password} onChange={e => setPwdForm(f => ({ ...f, new_password: e.target.value }))} />
          <div className="flex justify-end">
            <button onClick={() => pwdMutation.mutate(pwdForm)} disabled={pwdMutation.isPending} className="btn-primary flex items-center gap-2">
              <Lock size={15} /> {pwdMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
