import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Plus,
  Search,
  Filter,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Sparkles,
  Target,
  FileText
} from 'lucide-react'
import { useJobs, useCandidates } from '../hooks/useApi'

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
      duration: 0.4,
      ease: 'easeOut'
    }
  }
}

const statusColors = {
  'Open': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-slate-100 text-slate-700',  'On Hold': 'bg-amber-100 text-amber-700',
  'Draft': 'bg-blue-100 text-blue-700',
}

function Recruiting() {
  const { jobs, loading: jobsLoading } = useJobs()
  const { candidates, loading: candidatesLoading } = useCandidates()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const loading = jobsLoading || candidatesLoading

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    return matchesSearch && matchesStatus
  }) || []

  const stats = {
    totalJobs: jobs?.length || 0,
    openJobs: jobs?.filter(j => j.status === 'Open')?.length || 0,
    totalCandidates: candidates?.length || 0,
    inInterview: candidates?.filter(c => c.status === 'Interviewing')?.length || 0,
  }

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
            Tuyển dụng
          </h1>
          <p className="text-slate-600">
            Quản lý {stats.totalJobs} vị trí tuyển dụng và {stats.totalCandidates} ứng viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline">
            <Sparkles className="w-4 h-4" />
            AI Matching
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Tạo vị trí mới
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="badge-success">+12%</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Tổng vị trí</p>
          <p className="text-3xl font-bold text-dark-900">{stats.totalJobs}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="badge-info">Active</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đang tuyển</p>
          <p className="text-3xl font-bold text-dark-900">{stats.openJobs}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="badge-success">+28%</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Ứng viên</p>
          <p className="text-3xl font-bold text-dark-900">{stats.totalCandidates}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
            <span className="badge-warning">Pending</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đang phỏng vấn</p>
          <p className="text-3xl font-bold text-dark-900">{stats.inInterview}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vị trí tuyển dụng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Open">Đang tuyển</option>
              <option value="On Hold">Tạm dừng</option>
              <option value="Closed">Đã đóng</option>
              <option value="Draft">Nháp</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div variants={containerVariants} className="space-y-4">
        {filteredJobs.map((job) => (
          <motion.div
            key={job.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="card p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Job Icon */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-8 h-8 text-white" />
              </div>

              {/* Job Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-dark-900 mb-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.locations?.join(', ') || job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salaryMin && job.salaryMax 
                          ? `$${job.salaryMin}k - $${job.salaryMax}k`
                          : job.salaryRange?.[0] 
                          ? `$${job.salaryRange[0]}k - $${job.salaryRange[1]}k`
                          : 'Negotiable'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.employmentType || job.level || 'Full-time'}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${statusColors[job.status] || 'badge-info'}`}>
                    {job.status}
                  </span>
                </div>

                {/* Skills */}
                {(job.requiredSkills || job.skills) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.requiredSkills || job.skills)?.slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="badge-primary text-xs">
                        {skill}
                      </span>
                    ))}
                    {(job.requiredSkills || job.skills)?.length > 5 && (
                      <span className="badge text-xs">
                        +{(job.requiredSkills || job.skills).length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      <span className="font-medium text-dark-900">{job.applicationCount || 0}</span> ứng viên
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      <span className="font-medium text-dark-900">{job.openings || 1}</span> vị trí
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      Đăng {job.postedAt ? new Date(job.postedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center gap-2">
                <button className="btn-primary btn-sm whitespace-nowrap">
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
                <button className="btn-outline btn-sm whitespace-nowrap">
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button className="btn-outline btn-sm whitespace-nowrap">
                  <Sparkles className="w-4 h-4" />
                  AI Match
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <motion.div variants={itemVariants} className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            Không tìm thấy vị trí tuyển dụng
          </h3>
          <p className="text-slate-600 mb-6">
            Thử điều chỉnh bộ lọc hoặc tạo vị trí tuyển dụng mới
          </p>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Tạo vị trí mới
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Recruiting
