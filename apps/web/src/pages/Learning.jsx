import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Users,
  Play,
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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

const courses = [
  {
    id: 1,
    title: 'Leadership & Management Essentials',
    category: 'Leadership',
    duration: '8 tuần',
    participants: 24,
    progress: 65,
    instructor: 'Nguyễn Văn A',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: 2,
    title: 'Advanced React & TypeScript',
    category: 'Technical',
    duration: '6 tuần',
    participants: 32,
    progress: 45,
    instructor: 'Trần Thị B',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  },
  {
    id: 3,
    title: 'Communication Skills Workshop',
    category: 'Soft Skills',
    duration: '4 tuần',
    participants: 18,
    progress: 80,
    instructor: 'Lê Văn C',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
  },
  {
    id: 4,
    title: 'Data Science & Machine Learning',
    category: 'Technical',
    duration: '12 tuần',
    participants: 15,
    progress: 30,
    instructor: 'Phạm Thị D',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  },
]

const learningPaths = [
  {
    id: 1,
    title: 'Frontend Developer Path',
    courses: 8,
    duration: '6 tháng',
    enrolled: 45,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Management & Leadership',
    courses: 6,
    duration: '4 tháng',
    enrolled: 28,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Data Analytics Specialist',
    courses: 10,
    duration: '8 tháng',
    enrolled: 32,
    color: 'from-emerald-500 to-teal-500',  },
]

function Learning() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Technical', 'Leadership', 'Soft Skills', 'Business']

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(course => course.category === selectedCategory)

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
            Học tập & Phát triển
          </h1>
          <p className="text-slate-600">
            Nâng cao kỹ năng và phát triển nghề nghiệp của đội ngũ
          </p>
        </div>
        <button className="btn-primary">
          <Sparkles className="w-4 h-4" />
          Gợi ý khóa học AI
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Khóa học đang chạy</p>
          <p className="text-3xl font-bold text-dark-900">24</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Nhân viên tham gia</p>
          <p className="text-3xl font-bold text-dark-900">187</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 mb-1">Chứng chỉ đạt được</p>
          <p className="text-3xl font-bold text-dark-900">142</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <span className="badge-success text-xs">98%</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Tỷ lệ hoàn thành</p>
          <p className="text-3xl font-bold text-dark-900">85%</p>
        </div>
      </motion.div>

      {/* Learning Paths */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-dark-900">Lộ trình học tập</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <motion.div
              key={path.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="card p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}>
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 mb-2">
                {path.title}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{path.courses} khóa học</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{path.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{path.enrolled} người đang học</span>
                </div>
              </div>
              <button className="btn-primary w-full btn-sm">
                Bắt đầu học
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {category === 'all' ? 'Tất cả' : category}
          </button>
        ))}
      </motion.div>

      {/* Courses Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="card overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary-500 to-accent-500 overflow-hidden">
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110">
                  <Play className="w-7 h-7 text-primary-600 ml-1" />
                </button>
              </div>
              <span className={`absolute top-4 left-4 badge ${
                course.level === 'Beginner' ? 'badge-success' :
                course.level === 'Intermediate' ? 'badge-warning' : 'badge-error'
              }`}>
                {course.level}
              </span>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="badge-primary text-xs mb-2 inline-block">
                    {course.category}
                  </span>
                  <h3 className="text-lg font-semibold text-dark-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Giảng viên: {course.instructor}
                  </p>
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.participants} học viên</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Tiến độ</span>
                  <span className="font-medium text-dark-900">{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 btn-primary btn-sm">
                  {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu'}
                </button>
                <button className="btn-outline btn-sm">
                  Chi tiết
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <motion.div variants={itemVariants} className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            Không tìm thấy khóa học
          </h3>
          <p className="text-slate-600">
            Thử chọn danh mục khác hoặc liên hệ bộ phận L&D
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Learning
