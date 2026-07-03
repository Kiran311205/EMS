import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesAPI, deptAPI, desigAPI } from '../../api'
import { InputField, SelectField, FormField, Spinner } from '../../components/ui'
import { ArrowLeft, Save, Camera, X, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const getPhotoUrl = (photo) => {
  if (!photo) return null
  try { return new URL(photo).pathname } catch { return photo }
}

// section -> the fields that must be non-empty for it to count as "complete"
const SECTIONS = [
  { name: 'Personal', required: ['employee_id', 'full_name', 'email', 'phone'] },
  { name: 'Employment', required: ['department', 'designation', 'date_joined'] },
  { name: 'Address', required: [] },
  { name: 'Documents', required: [] },
  { name: 'Emergency', required: [] },
  { name: 'Salary', required: [] },
]

export default function EmployeeForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState('Personal')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({}) // addon: inline field-level errors from API
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
        photo: null,
      }))
      setCurrentPhoto(getPhotoUrl(existing.photo))
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: (formData) => isEdit ? employeesAPI.update(id, formData) : employeesAPI.create(formData),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Employee updated!' : 'Employee added!')
      setFieldErrors({})
      qc.invalidateQueries(['employees'])
      qc.invalidateQueries(['employee-stats'])
      qc.invalidateQueries(['dashboard'])
      qc.invalidateQueries(['employee', id])
      navigate(`/employees/${res.data.id}`)
    },
    onError: (err) => {
      const errors = err?.response?.data
      if (errors && typeof errors === 'object') {
        setFieldErrors(errors) // addon: surface per-field, not just a joined toast
        const firstSectionWithError = SECTIONS.find(s => s.required.some(f => errors[f]))?.name
        if (firstSectionWithError) setActiveSection(firstSectionWithError)
        toast.error('Some fields need attention — check the highlighted section')
      } else {
        toast.error('Failed to save employee')
      }
    },
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    if (name === 'photo' && files && files[0]) {
      const file = files[0]
      setForm(prev => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
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

  // addon: per-section completion, drives the tracker rail
  const completion = useMemo(() => SECTIONS.map(s => ({
    name: s.name,
    hasError: s.required.some(f => fieldErrors[f]),
    done: s.required.length > 0 && s.required.every(f => String(form[f] ?? '').trim() !== ''),
    optional: s.required.length === 0,
  })), [form, fieldErrors])

  const errorMsg = (field) => fieldErrors[field] ? (Array.isArray(fieldErrors[field]) ? fieldErrors[field][0] : fieldErrors[field]) : null

  if (isEdit && loadingEmp) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const deptOptions = (depts || []).map(d => ({ value: d.id, label: d.name }))
  const desigOptions = (desigs || []).map(d => ({ value: d.id, label: d.title }))
  const empOptions = (empDropdown || []).map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_id})` }))

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      <div className="flex items-center gap-3 border-b border-[var(--line)] pb-5">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-[var(--paper)] text-[var(--slate)]">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="font-mono text-[11px] tracking-widest text-[var(--gold-dark)] uppercase mb-1">
            {isEdit ? 'Amending record' : 'New record'}
          </p>
          <h1 className="font-display text-2xl text-[var(--ink)]">{isEdit ? 'Edit employee' : 'Add new employee'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Filing-tab section rail with completion tracker */}
        <div className="card !p-2.5 lg:sticky lg:top-4 h-fit">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {completion.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setActiveSection(s.name)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap text-left transition-colors"
                style={{
                  background: activeSection === s.name ? 'var(--gold-tint)' : 'transparent',
                  color: activeSection === s.name ? 'var(--gold-dark)' : s.hasError ? 'var(--danger)' : 'var(--ink)',
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: s.hasError ? 'var(--danger-tint)' : s.done ? 'var(--success-tint)' : 'var(--paper)',
                    color: s.hasError ? 'var(--danger)' : s.done ? 'var(--success)' : 'var(--slate-soft)',
                  }}>
                  {s.hasError ? <AlertCircle size={12} /> : s.done ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </span>
                {s.name}
                {s.optional && <span className="text-[10px] text-[var(--slate-soft)] font-normal ml-auto">optional</span>}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <div className="card space-y-4">
            {activeSection === 'Personal' && (
              <>
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Personal information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <InputField label="Employee ID" name="employee_id" value={form.employee_id} onChange={handleChange} required placeholder="EMP001" />
                    {errorMsg('employee_id') && <p className="text-xs text-[var(--danger)] mt-1">{errorMsg('employee_id')}</p>}
                  </div>
                  <div>
                    <InputField label="Full name" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="John Doe" />
                    {errorMsg('full_name') && <p className="text-xs text-[var(--danger)] mt-1">{errorMsg('full_name')}</p>}
                  </div>
                  <div>
                    <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                    {errorMsg('email') && <p className="text-xs text-[var(--danger)] mt-1">{errorMsg('email')}</p>}
                  </div>
                  <div>
                    <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 9999999999" />
                    {errorMsg('phone') && <p className="text-xs text-[var(--danger)] mt-1">{errorMsg('phone')}</p>}
                  </div>
                  <InputField label="Alternate phone" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} />
                  <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange}
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
                  <InputField label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                  <SelectField label="Blood group" name="blood_group" value={form.blood_group} onChange={handleChange}
                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => ({ value: g, label: g }))} />

                  <FormField label="Profile photo" className="sm:col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="badge-avatar w-20 h-20 bg-[var(--paper)] border border-dashed border-[var(--line)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {photoPreview || currentPhoto ? (
                          <img src={photoPreview || currentPhoto} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={22} className="text-[var(--slate-soft)]" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-[var(--line)] rounded-lg text-sm text-[var(--ink)] hover:bg-[var(--paper)] w-fit">
                          <Camera size={15} />
                          {photoPreview ? 'Change photo' : currentPhoto ? 'Replace photo' : 'Choose photo'}
                          <input type="file" name="photo" accept="image/*" onChange={handleChange} className="hidden" />
                        </label>
                        {(photoPreview || currentPhoto) && (
                          <button type="button" onClick={clearPhoto} className="flex items-center gap-1 text-xs text-[var(--danger)] hover:opacity-80">
                            <X size={12} /> {photoPreview ? 'Remove selected' : 'Clear photo'}
                          </button>
                        )}
                        <p className="text-xs text-[var(--slate-soft)]">JPG, PNG or WebP · Max 5MB</p>
                      </div>
                    </div>
                  </FormField>
                </div>
              </>
            )}

            {activeSection === 'Employment' && (
              <>
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Employment details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={deptOptions} required />
                  <SelectField label="Designation" name="designation" value={form.designation} onChange={handleChange} options={desigOptions} required />
                  <SelectField label="Employment type" name="employment_type" value={form.employment_type} onChange={handleChange}
                    options={[{ value: 'full_time', label: 'Full time' }, { value: 'part_time', label: 'Part time' }, { value: 'contract', label: 'Contract' }, { value: 'intern', label: 'Intern' }]} />
                  <SelectField label="Status" name="status" value={form.status} onChange={handleChange}
                    options={[{ value: 'active', label: 'Active' }, { value: 'probation', label: 'Probation' }, { value: 'on_leave', label: 'On leave' }, { value: 'resigned', label: 'Resigned' }, { value: 'terminated', label: 'Terminated' }]} />
                  <InputField label="Date joined" name="date_joined" type="date" value={form.date_joined} onChange={handleChange} required />
                  <InputField label="Date resigned" name="date_resigned" type="date" value={form.date_resigned || ''} onChange={handleChange} />
                  <SelectField label="Reporting to" name="reporting_to" value={form.reporting_to} onChange={handleChange} options={empOptions} />
                </div>
              </>
            )}

            {activeSection === 'Address' && (
              <>
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Full address">
                      <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="input-field" placeholder="House no, street, area…" />
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
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Documents &amp; IDs</h3>
                <p className="text-xs text-[var(--slate)] -mt-2">These are stored securely and shown masked outside this form.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Aadhar number" name="aadhar_number" value={form.aadhar_number} onChange={handleChange} maxLength={12} placeholder="12-digit Aadhar" />
                  <InputField label="PAN number" name="pan_number" value={form.pan_number} onChange={handleChange} maxLength={10} placeholder="ABCDE1234F" />
                  <InputField label="PF number" name="pf_number" value={form.pf_number} onChange={handleChange} />
                  <InputField label="UAN number" name="uan_number" value={form.uan_number} onChange={handleChange} />
                  <InputField label="ESI number" name="esi_number" value={form.esi_number} onChange={handleChange} />
                </div>
              </>
            )}

            {activeSection === 'Emergency' && (
              <>
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Emergency contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Contact name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} />
                  <InputField label="Contact phone" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} />
                  <InputField label="Relation" name="emergency_contact_relation" value={form.emergency_contact_relation} onChange={handleChange} placeholder="Father, spouse, etc." />
                </div>
              </>
            )}

            {activeSection === 'Salary' && (
              <>
                <h3 className="font-display text-lg text-[var(--ink)] border-b border-[var(--line)] pb-3">Salary &amp; notes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Basic salary (₹)" name="basic_salary" type="number" value={form.basic_salary} onChange={handleChange} placeholder="0.00" />
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
              {SECTIONS.findIndex(s => s.name === activeSection) > 0 && (
                <button type="button" onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s => s.name === activeSection) - 1].name)} className="btn-secondary">← Previous</button>
              )}
              {SECTIONS.findIndex(s => s.name === activeSection) < SECTIONS.length - 1 && (
                <button type="button" onClick={() => setActiveSection(SECTIONS[SECTIONS.findIndex(s => s.name === activeSection) + 1].name)} className="btn-secondary">Next →</button>
              )}
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {mutation.isPending ? 'Saving…' : (isEdit ? 'Update employee' : 'Add employee')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}