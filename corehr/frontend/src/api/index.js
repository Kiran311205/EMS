import api from './axios'

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/users/logout/', { refresh }),
  me: () => api.get('/auth/users/me/'),
  updateMe: (data) => api.patch('/auth/users/me/', data),
  changePassword: (data) => api.post('/auth/users/change_password/', data),
  register: (data) => api.post('/auth/register/', data),
}

// Users (Admin only)
export const usersAPI = {
  list: (params) => api.get('/auth/users/', { params }),
  create: (data) => api.post('/auth/users/', data),
  update: (id, data) => api.patch(`/auth/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/users/${id}/`),
  stats: () => api.get('/auth/users/stats/'),
}

// Employees
export const employeesAPI = {
  list: (params) => api.get('/employees/', { params }),
  get: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/employees/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/employees/${id}/`),
  stats: () => api.get('/employees/stats/'),
  dropdown: () => api.get('/employees/dropdown/'),
}

// Departments & Designations
export const deptAPI = {
  list: () => api.get('/employees/departments/list/'),
  create: (data) => api.post('/employees/departments/list/', data),
  update: (id, data) => api.patch(`/employees/departments/list/${id}/`, data),
  delete: (id) => api.delete(`/employees/departments/list/${id}/`),
}

export const desigAPI = {
  list: (params) => api.get('/employees/designations/list/', { params }),
  create: (data) => api.post('/employees/designations/list/', data),
  update: (id, data) => api.patch(`/employees/designations/list/${id}/`, data),
  delete: (id) => api.delete(`/employees/designations/list/${id}/`),
}

// Assets
export const assetsAPI = {
  list: (params) => api.get('/assets/', { params }),
  create: (data) => api.post('/assets/', data),
  update: (id, data) => api.patch(`/assets/${id}/`, data),
  delete: (id) => api.delete(`/assets/${id}/`),
  stats: () => api.get('/assets/stats/'),
  notReceived: () => api.get('/assets/not_received/'),
}

// Bank
export const bankAPI = {
  list: (params) => api.get('/bank/', { params }),
  get: (id) => api.get(`/bank/${id}/`),
  create: (data) => api.post('/bank/', data),
  update: (id, data) => api.patch(`/bank/${id}/`, data),
  delete: (id) => api.delete(`/bank/${id}/`),
}

// Salary
export const salaryAPI = {
  list: (params) => api.get('/salary/', { params }),
  create: (data) => api.post('/salary/', data),
  update: (id, data) => api.patch(`/salary/${id}/`, data),
  delete: (id) => api.delete(`/salary/${id}/`),
  stats: (params) => api.get('/salary/stats/', { params }),
  bulkUpdateStatus: (data) => api.post('/salary/bulk_update_status/', data),
}

// Attendance
export const attendanceAPI = {
  list: (params) => api.get('/attendance/', { params }),
  create: (data) => api.post('/attendance/', data),
  update: (id, data) => api.patch(`/attendance/${id}/`, data),
  today: () => api.get('/attendance/today/'),
}

// Leaves
export const leavesAPI = {
  list: (params) => api.get('/leaves/', { params }),
  create: (data) => api.post('/leaves/', data),
  update: (id, data) => api.patch(`/leaves/${id}/`, data),
  approve: (id, note) => api.post(`/leaves/${id}/approve/`, { note }),
  reject: (id, note) => api.post(`/leaves/${id}/reject/`, { note }),
  stats: () => api.get('/leaves/stats/'),
}

// Reports / Exports
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard/'),
  exportEmployees: () => api.get('/reports/employees/', { responseType: 'blob' }),
  exportSalary: (params) => api.get('/reports/salary/', { params, responseType: 'blob' }),
  exportAssets: (params) => api.get('/reports/assets/', { params, responseType: 'blob' }),
}

// Audit logs
export const auditAPI = {
  list: (params) => api.get('/audit/', { params }),
}

// Utility: trigger file download from blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
