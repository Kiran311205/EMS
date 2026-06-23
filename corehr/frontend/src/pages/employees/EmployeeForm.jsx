import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesAPI, deptAPI, desigAPI } from '../../api'
import { PageHeader, InputField, SelectField, FormField, Spinner } from '../../components/ui'
import { ArrowLeft, Save, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'

const getPhotoUrl = (photo) => {
  if (!photo) return null
  try { return new URL(photo).pathname } catch { return photo }
}

const SECTIONS = ['Personal', 'Employment', 'Address', 'Documents', 'Emergency', 'Salary']

export default function EmployeeForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState('Personal')
  const [photoPreview, setPhotoPreview] = useState(null) // local blob preview for newly chosen file
  const [currentPhoto, setCurrentPhoto] = useState(null) // existing photo URL from server
  const [form, setForm] = useState({
    employee_id: '', full_name: '', email: '', phone: '', alternate_phone: '',
    gender: '', date_of_birth: '', blood_group: '', photo: null,
    department: '', designation: '', employment_type: 'full_time', status: 'active',
    date_joined: '', date_resigned: '', reporting_to: '',
    address: '', city: '', state: '', pincode: '',
    aadhar_number: '', pan_number: '', pf_number: '', uan_number: '', esi_number: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    basic_salary: '', notes: '',
  })

  const { data: existing, isLoading: loadingEmp } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesAPI.get(id).then(r => r.data),
    enabled: isEdit,
  })

  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: () => deptAPI.list().then(r => r.data.results || r.data) })
  const { data: desigs } = useQuery({ queryKey: ['designations'], queryFn: () => desigAPI.list().then(r => r.data.results || r.data) })
  const { data: empDropdown } = useQuery({ queryKey: ['emp-dropdown'], queryFn: () => employeesAPI.dropdown().then(r => r.data) })

  useEffect(() => {
    if (existing) {
      setForm(prev => ({
        ...prev,
        ...existing,
        department: existing.department || '',
        designation: existing.designation || '',
        reporting_to: existing.reporting_to || '',
        photo: null, // reset so we only send a new file if user picks one
      }))
      setCurrentPhoto(getPhotoUrl(existing.photo)) // store existing photo for preview
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: (formData) => isEdit ? employeesAPI.update(id, formData) : employeesAPI.create(formData),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Employee updated!' : 'Employee added!')
      qc.invalidateQueries(['employees'])
      qc.invalidateQueries(['employee', id])
      navigate(`/employees/${res.data.id}`)
    },
    onError: (err) => {
      const errors = err?.response?.data
      if (errors && typeof errors === 'object') {
        const msg = Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(', ')
        toast.error(msg)
      } else {
        toast.error('Failed to save employee')
      }
    },
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo' && files && files[0]) {
      const file = files[0]
      setForm(prev => ({ ...prev, photo: file }))
      // Create an instant local preview using object URL
      const objectUrl = URL.createObjectURL(file)
      setPhotoPreview(objectUrl)
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const clearPhoto = () => {
    setForm(prev => ({ ...prev, photo: null }))
    setPhotoPreview(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        if (k === 'photo' && v instanceof File) fd.append(k, v)
        else if (k !== 'photo') fd.append(k, v)
      }
    })
    mutation.mutate(fd)
  }

  if (isEdit && loadingEmp) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const deptOptions = (depts || []).map(d => ({ value: d.id, label: d.name }))
  const desigOptions = (desigs || []).map(d => ({ value: d.id, label: d.title }))
  const empOptions = (empDropdown || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <PageHeader title={isEdit ? 'Edit Employee' : 'Add New Employee'} />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1
              ${activeSection === s ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card space-y-4">
          {activeSection === 'Personal' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Employee ID" name="employee_id" value={form.employee_id} onChange={handleChange} required placeholder="EMP001" />
                <InputField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="John Doe" />
                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 9999999999" />
                <InputField label="Alternate Phone" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} />
                <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange}
                  options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} />
                <InputField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                <SelectField label="Blood Group" name="blood_group" value={form.blood_group} onChange={handleChange}
                  options={['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g=>({value:g,label:g}))} />

                {/* Photo upload with preview */}
                <FormField label="Profile Photo" className="sm:col-span-2">
                  <div className="flex items-center gap-4">
                    {/* Current/preview avatar */}
                    <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {photoPreview || currentPhoto ? (
                        <img
                          src={photoPreview || currentPhoto}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-fit">
                        <Camera size={15} />
                        {photoPreview ? 'Change Photo' : currentPhoto ? 'Replace Photo' : 'Choose Photo'}
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                      {(photoPreview || currentPhoto) && (
                        <button
                          type="button"
                          onClick={clearPhoto}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                          <X size={12} /> {photoPreview ? 'Remove selected' : 'Clear photo'}
                        </button>
                      )}
                      <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</p>
                    </div>
                  </div>
                </FormField>
              </div>
            </>
          )}

          {activeSection === 'Employment' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Employment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={deptOptions} required />
                <SelectField label="Designation" name="designation" value={form.designation} onChange={handleChange} options={desigOptions} required />
                <SelectField label="Employment Type" name="employment_type" value={form.employment_type} onChange={handleChange}
                  options={[{value:'full_time',label:'Full Time'},{value:'part_time',label:'Part Time'},{value:'contract',label:'Contract'},{value:'intern',label:'Intern'}]} />
                <SelectField label="Status" name="status" value={form.status} onChange={handleChange}
                  options={[{value:'active',label:'Active'},{value:'probation',label:'Probation'},{value:'on_leave',label:'On Leave'},{value:'resigned',label:'Resigned'},{value:'terminated',label:'Terminated'}]} />
                <InputField label="Date Joined" name="date_joined" type="date" value={form.date_joined} onChange={handleChange} required />
                <InputField label="Date Resigned" name="date_resigned" type="date" value={form.date_resigned || ''} onChange={handleChange} />
                <SelectField label="Reporting To" name="reporting_to" value={form.reporting_to} onChange={handleChange} options={empOptions} />
              </div>
            </>
          )}

          {activeSection === 'Address' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Full Address">
                    <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="input-field" placeholder="House no, Street, Area..." />
                  </FormField>
                </div>
                <InputField label="City" name="city" value={form.city} onChange={handleChange} />
                <InputField label="State" name="state" value={form.state} onChange={handleChange} />
                <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
              </div>
            </>
          )}

          {activeSection === 'Documents' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Documents & IDs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Aadhar Number" name="aadhar_number" value={form.aadhar_number} onChange={handleChange} maxLength={12} placeholder="12-digit Aadhar" />
                <InputField label="PAN Number" name="pan_number" value={form.pan_number} onChange={handleChange} maxLength={10} placeholder="ABCDE1234F" />
                <InputField label="PF Number" name="pf_number" value={form.pf_number} onChange={handleChange} />
                <InputField label="UAN Number" name="uan_number" value={form.uan_number} onChange={handleChange} />
                <InputField label="ESI Number" name="esi_number" value={form.esi_number} onChange={handleChange} />
              </div>
            </>
          )}

          {activeSection === 'Emergency' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Contact Name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} />
                <InputField label="Contact Phone" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} />
                <InputField label="Relation" name="emergency_contact_relation" value={form.emergency_contact_relation} onChange={handleChange} placeholder="Father, Spouse, etc." />
              </div>
            </>
          )}

          {activeSection === 'Salary' && (
            <>
              <h3 className="font-semibold text-gray-800 border-b pb-2">Salary & Notes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Basic Salary (₹)" name="basic_salary" type="number" value={form.basic_salary} onChange={handleChange} placeholder="0.00" />
                <div className="sm:col-span-2">
                  <FormField label="Notes">
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-field" />
                  </FormField>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            {SECTIONS.indexOf(activeSection) > 0 && (
              <button type="button" onClick={() => setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection) - 1])} className="btn-secondary">← Previous</button>
            )}
            {SECTIONS.indexOf(activeSection) < SECTIONS.length - 1 && (
              <button type="button" onClick={() => setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection) + 1])} className="btn-secondary">Next →</button>
            )}
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
            <Save size={16} />
            {mutation.isPending ? 'Saving...' : (isEdit ? 'Update Employee' : 'Add Employee')}
          </button>
        </div>
      </form>
    </div>
  )
}
