import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  Mail,
  MapPin,
  Briefcase,
  Calendar as CalendarIcon,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import { useEmployees } from '../hooks/useApi'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,      ease: 'easeOut'
    }
  }
}

function People() {
  const { employees, loading } = useEmployees()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const departments = ['all', 'Engineering', 'Sales', 'Marketing', 'HR', 'Operations']

  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment
    return matchesSearch && matchesDept
  }) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Quản lý Nhân viên
          </h1>
          <p className="text-slate-600">
            Tổng {filteredEmployees.length} nhân viên trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Thêm nhân viên
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Toàn thời gian</p>
              <p className="text-2xl font-bold text-dark-900">
                {employees?.filter(e => e.employmentType === 'Full-time').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Bán thời gian</p>
              <p className="text-2xl font-bold text-dark-900">
                {employees?.filter(e => e.employmentType === 'Part-time').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Tuyển mới (tháng)</p>
              <p className="text-2xl font-bold text-dark-900">12</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Remote</p>
              <p className="text-2xl font-bold text-dark-900">
                {employees?.filter(e => e.location?.toLowerCase().includes('remote')).length || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Employee Grid/List */}
      {viewMode === 'grid' ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <motion.div
              key={employee.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="card p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-lg">
                    {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 mb-0.5">{employee.name}</h3>
                    <p className="text-sm text-slate-600">{employee.title}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Card Body */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{employee.department || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{employee.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email || 'N/A'}</span>
                </div>
              </div>

              {/* Skills */}
              {employee.skills && employee.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="badge-primary text-xs">
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="badge text-xs">+{employee.skills.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button className="flex-1 btn-secondary btn-sm">
                  <Eye className="w-4 h-4" />
                  Xem
                </button>
                <button className="flex-1 btn-primary btn-sm">
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* List View */
        <motion.div variants={itemVariants} className="card overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Vị trí</th>
                  <th>Phòng ban</th>
                  <th>Địa điểm</th>
                  <th>Email</th>
                  <th>Kỹ năng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
                          {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <div>
                          <p className="font-medium text-dark-900">{employee.name}</p>
                          <p className="text-xs text-slate-500">{employee.employmentType}</p>
                        </div>
                      </div>
                    </td>
                    <td>{employee.title || 'N/A'}</td>
                    <td>
                      <span className="badge-primary">{employee.department || 'N/A'}</span>
                    </td>
                    <td>{employee.location || 'N/A'}</td>
                    <td>{employee.email || 'N/A'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {employee.skills?.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="badge text-xs">
                            {skill}
                          </span>
                        ))}
                        {employee.skills?.length > 2 && (
                          <span className="badge text-xs">+{employee.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <motion.div variants={itemVariants} className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            Không tìm thấy nhân viên
          </h3>
          <p className="text-slate-600 mb-6">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Thêm nhân viên mới
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default People
