import React, { useMemo, useState } from 'react';
import {
  useEmployees,
  useCandidates,
  useJobs,
  useAnalytics,
  useWorkforceInsight,
} from '../hooks/useApi';

const defaultEmployeeForm = {
  name: '',
  title: '',
  department: '',
  location: '',
  employmentType: 'Full-time',
  skills: '',
};

const defaultCandidateForm = {
  name: '',
  headline: '',
  desiredRole: '',
  location: '',
  status: 'Sourcing',
  experienceYears: 1,
  skills: '',
};

const defaultJobForm = {
  title: '',
  department: '',
  level: 'Senior',
  locations: '',
  salaryMin: '',
  salaryMax: '',
  openings: 1,
  status: 'Open',
};

const Dashboard = () => {
  const {
    employees,
    loading: employeesLoading,
    saving: employeesSaving,
    createEmployee,
    deleteEmployee,
  } = useEmployees();
  const {
    candidates,
    loading: candidatesLoading,
    saving: candidatesSaving,
    createCandidate,
    deleteCandidate,
  } = useCandidates();
  const {
    jobs,
    loading: jobsLoading,
    saving: jobsSaving,
    createJob,
    deleteJob,
  } = useJobs();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { insight, loading: insightLoading } = useWorkforceInsight();

  const [employeeForm, setEmployeeForm] = useState(defaultEmployeeForm);
  const [candidateForm, setCandidateForm] = useState(defaultCandidateForm);
  const [jobForm, setJobForm] = useState(defaultJobForm);

  const combinedLoading = employeesLoading || candidatesLoading || jobsLoading || analyticsLoading || insightLoading;

  const openJobs = useMemo(() => jobs.filter((job) => job.status === 'Open'), [jobs]);
  const candidateByStage = useMemo(() => {
    const pipeline = analytics?.candidatePipeline ?? {};
    return Object.entries(pipeline);
  }, [analytics]);

  const topLearningPrograms = analytics?.learningEngagement ?? [];
  const topSkills = analytics?.topSkillsInDemand ?? [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value, options = {}) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'percent',
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
    }).format(value);
  };

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault();
    if (!employeeForm.name || !employeeForm.title || !employeeForm.department) {
      return;
    }

    try {
      await createEmployee({
        ...employeeForm,
        skills: employeeForm.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setEmployeeForm(defaultEmployeeForm);
    } catch (error) {
      console.error('Failed to create employee', error);
    }
  };

  const handleCandidateSubmit = async (event) => {
    event.preventDefault();
    if (!candidateForm.name || !candidateForm.headline) {
      return;
    }

    try {
      await createCandidate({
        ...candidateForm,
        skills: candidateForm.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setCandidateForm(defaultCandidateForm);
    } catch (error) {
      console.error('Failed to create candidate', error);
    }
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    if (!jobForm.title || !jobForm.department) {
      return;
    }

    try {
      await createJob({
        title: jobForm.title,
        department: jobForm.department,
        level: jobForm.level,
        status: jobForm.status,
        locations: jobForm.locations
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        salaryRange: [Number(jobForm.salaryMin || 0), Number(jobForm.salaryMax || 0)],
        openings: Number(jobForm.openings || 1),
        requiredSkills: [],
        niceToHaveSkills: [],
        description: 'Vị trí được tạo từ bảng điều khiển NovaPeople.',
      });

      setJobForm(defaultJobForm);
    } catch (error) {
      console.error('Failed to create job', error);
    }
  };

  if (combinedLoading) {
    return <div className="loading">Đang tải dữ liệu từ trung tâm nhân sự...</div>;
  }

  const actionInProgress = employeesSaving || candidatesSaving || jobsSaving;

  return (
    <main className="dashboard-grid">
      <section className="summary-cards">
        <div className="summary-card">
          <h3>Tổng nhân sự</h3>
          <div className="summary-value">{analytics?.headcount ?? employees.length}</div>
          <div className="summary-trend">
            <span className="positive">+12% YoY</span>
            <span className="muted">{analytics?.activeContractors || 0} hợp đồng</span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Vị trí đang tuyển</h3>
          <div className="summary-value">{analytics?.openRoles ?? openJobs.length}</div>
          <div className="summary-trend">
            <span className="positive">AI ưu tiên 4 vị trí</span>
            <span className="muted">Thời gian tuyển {analytics?.averageTimeToFill || 0} ngày</span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Chỉ số ổn định</h3>
          <div className="summary-value">
            {formatPercent(insight?.workforceStabilityIndex || 0, { maximumFractionDigits: 0 })}
          </div>
          <div className="summary-trend">
            <span className="positive">Tăng 6 điểm</span>
            <span className="muted">
              Rủi ro nghỉ việc {formatPercent(analytics?.retentionRisk || 0, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Đa dạng đội ngũ</h3>
          <div className="summary-value">
            {formatPercent(analytics?.diversityRatio || 0, { maximumFractionDigits: 0 })}
          </div>
          <div className="summary-trend">
            <span className="neutral">Goal Q2: 50%</span>
            <span className="muted">AI đề xuất 2 chương trình DEI</span>
          </div>
        </div>
      </section>

      <section className="section two-column">
        <div className="section-panel">
          <div className="section-header">
            <h2>Talent Directory</h2>
            <span>{employees.length} nhân sự</span>
          </div>
          <div className="list-card">
            {employees.slice(0, 6).map((employee) => (
              <article className="list-row" key={employee.id}>
                <div>
                  <span className="highlight">{employee.name}</span>
                  <p className="muted">
                    {employee.title} · {employee.department}
                  </p>
                  <p className="tagline">{employee.location}</p>
                </div>
                <div className="row-actions">
                  <span className="metric-pill">{employee.performanceScore}/100</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => deleteEmployee(employee.id)}
                    aria-label={`Xoá ${employee.name}`}
                    disabled={actionInProgress}
                  >
                    ✕
                  </button>
                </div>
              </article>
            ))}
            {employees.length === 0 && <p className="muted">Chưa có dữ liệu nhân sự.</p>}
          </div>
        </div>

        <div className="form-card">
          <h3>Thêm nhân sự nhanh</h3>
          <p className="muted">Ghi nhận nhân sự mới tương tự các workflow trên Deel, HiBob.</p>
          <form className="form-grid" onSubmit={handleEmployeeSubmit}>
            <label>
              <span>Họ và tên</span>
              <input
                type="text"
                value={employeeForm.name}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ví dụ: Lan Nguyen"
                required
              />
            </label>
            <label>
              <span>Chức danh</span>
              <input
                type="text"
                value={employeeForm.title}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Engineering Manager"
                required
              />
            </label>
            <label>
              <span>Phòng ban</span>
              <input
                type="text"
                value={employeeForm.department}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="Engineering"
                required
              />
            </label>
            <label>
              <span>Địa điểm</span>
              <input
                type="text"
                value={employeeForm.location}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Remote · APAC"
              />
            </label>
            <label>
              <span>Loại hợp đồng</span>
              <select
                value={employeeForm.employmentType}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, employmentType: event.target.value }))}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </label>
            <label>
              <span>Kỹ năng chính</span>
              <input
                type="text"
                value={employeeForm.skills}
                onChange={(event) => setEmployeeForm((prev) => ({ ...prev, skills: event.target.value }))}
                placeholder="React, Coaching, OKRs"
              />
            </label>
            <button type="submit" className="button primary" disabled={actionInProgress}>
              Lưu nhân sự
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Pipeline tuyển dụng</h2>
          <span>Realtime AI scoring</span>
        </div>
        <div className="grid-two">
          <div className="table-like">
            <div className="table-row header">
              <span>Trạng thái</span>
              <span>Số lượng</span>
              <span>Tỷ trọng</span>
              <span>Tín hiệu AI</span>
            </div>
            {candidateByStage.map(([stage, count]) => {
              const total = candidates.length || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div className="table-row" key={stage}>
                  <span className="highlight">{stage}</span>
                  <span>{count}</span>
                  <span>{percentage}%</span>
                  <span className="muted">{percentage > 25 ? 'Cần ưu tiên phỏng vấn' : 'Ổn định'}</span>
                </div>
              );
            })}
          </div>
          <div className="table-like">
            <div className="table-row header">
              <span>Ứng viên</span>
              <span>Điểm AI</span>
              <span>Trạng thái</span>
              <span>Kỹ năng trùng khớp</span>
            </div>
            {candidates.slice(0, 5).map((candidate) => {
              const jobMatch = openJobs
                .flatMap((job) => job.matches ?? [])
                .find((match) => match.candidateId === candidate.id);
              return (
                <div className="table-row" key={candidate.id}>
                  <span>
                    <span className="highlight">{candidate.name}</span>
                    <br />
                    <span className="muted">{candidate.headline}</span>
                  </span>
                  <span>{jobMatch ? `${jobMatch.matchScore}/100` : `${candidate.interviewScore}/100`}</span>
                  <span>{candidate.status}</span>
                  <span className="muted">
                    {(jobMatch?.matchedSkills ?? candidate.skills.slice(0, 3)).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section two-column">
        <div className="section-panel">
          <div className="section-header">
            <h2>Ứng viên nổi bật</h2>
            <span>{candidates.length} hồ sơ</span>
          </div>
          <div className="list-card">
            {candidates.slice(0, 5).map((candidate) => (
              <article className="list-row" key={candidate.id}>
                <div>
                  <span className="highlight">{candidate.name}</span>
                  <p className="muted">{candidate.desiredRole}</p>
                  <p className="tagline">{candidate.location}</p>
                </div>
                <div className="row-actions">
                  <span className="metric-pill">{candidate.interviewScore}/100</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => deleteCandidate(candidate.id)}
                    aria-label={`Xoá ${candidate.name}`}
                    disabled={actionInProgress}
                  >
                    ✕
                  </button>
                </div>
              </article>
            ))}
            {candidates.length === 0 && <p className="muted">Chưa có hồ sơ được đồng bộ.</p>}
          </div>
        </div>

        <div className="form-card">
          <h3>Tạo ứng viên</h3>
          <p className="muted">Tái hiện flow tạo profile trên Lever, Greenhouse.</p>
          <form className="form-grid" onSubmit={handleCandidateSubmit}>
            <label>
              <span>Họ và tên</span>
              <input
                type="text"
                value={candidateForm.name}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Quynh Vo"
                required
              />
            </label>
            <label>
              <span>Headline</span>
              <input
                type="text"
                value={candidateForm.headline}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, headline: event.target.value }))}
                placeholder="Staff Product Designer"
                required
              />
            </label>
            <label>
              <span>Vị trí mong muốn</span>
              <input
                type="text"
                value={candidateForm.desiredRole}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, desiredRole: event.target.value }))}
                placeholder="Lead Product Designer"
              />
            </label>
            <label>
              <span>Địa điểm</span>
              <input
                type="text"
                value={candidateForm.location}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Ho Chi Minh City"
              />
            </label>
            <label>
              <span>Kinh nghiệm (năm)</span>
              <input
                type="number"
                min="0"
                value={candidateForm.experienceYears}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, experienceYears: Number(event.target.value) }))}
              />
            </label>
            <label>
              <span>Trạng thái pipeline</span>
              <select
                value={candidateForm.status}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="Sourcing">Sourcing</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
              </select>
            </label>
            <label className="grid-full">
              <span>Kỹ năng nổi bật</span>
              <input
                type="text"
                value={candidateForm.skills}
                onChange={(event) => setCandidateForm((prev) => ({ ...prev, skills: event.target.value }))}
                placeholder="UX Research, Design Systems"
              />
            </label>
            <button type="submit" className="button primary" disabled={actionInProgress}>
              Lưu ứng viên
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Vị trí mở &amp; matching AI</h2>
          <span>{openJobs.length} vị trí đang mở</span>
        </div>
        <div className="section-content">
          {openJobs.map((job) => (
            <div className="table-like" key={job.id}>
              <div className="table-row header">
                <span>
                  <span className="highlight">{job.title}</span>
                  <br />
                  <span className="muted">{job.department} · {job.level}</span>
                </span>
                <span>{job.locations?.join(' / ')}</span>
                <span>
                  {formatCurrency(job.salaryRange?.[0] || 0)} - {formatCurrency(job.salaryRange?.[1] || 0)}
                </span>
                <span>{job.openings} headcount</span>
              </div>
              {(job.matches ?? []).map((match) => (
                <div className="table-row" key={match.candidateId}>
                  <span className="muted">Gợi ý: {match.candidateId}</span>
                  <span>{match.matchScore}/100</span>
                  <span className="muted">Trùng khớp: {match.matchedSkills.join(', ')}</span>
                  <span className="muted">Thiếu: {match.missingSkills.join(', ') || '—'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section two-column">
        <div className="form-card">
          <h3>Tạo job requisition</h3>
          <p className="muted">Dựa trên trải nghiệm từ Workday, Ashby.</p>
          <form className="form-grid" onSubmit={handleJobSubmit}>
            <label>
              <span>Tiêu đề</span>
              <input
                type="text"
                value={jobForm.title}
                onChange={(event) => setJobForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Senior Software Engineer"
                required
              />
            </label>
            <label>
              <span>Phòng ban</span>
              <input
                type="text"
                value={jobForm.department}
                onChange={(event) => setJobForm((prev) => ({ ...prev, department: event.target.value }))}
                placeholder="Engineering"
                required
              />
            </label>
            <label>
              <span>Cấp bậc</span>
              <select
                value={jobForm.level}
                onChange={(event) => setJobForm((prev) => ({ ...prev, level: event.target.value }))}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </label>
            <label>
              <span>Trạng thái</span>
              <select
                value={jobForm.status}
                onChange={(event) => setJobForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="Open">Open</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label>
              <span>Khu vực tuyển</span>
              <input
                type="text"
                value={jobForm.locations}
                onChange={(event) => setJobForm((prev) => ({ ...prev, locations: event.target.value }))}
                placeholder="Ho Chi Minh City, Remote"
              />
            </label>
            <label>
              <span>Lương tối thiểu</span>
              <input
                type="number"
                min="0"
                value={jobForm.salaryMin}
                onChange={(event) => setJobForm((prev) => ({ ...prev, salaryMin: event.target.value }))}
              />
            </label>
            <label>
              <span>Lương tối đa</span>
              <input
                type="number"
                min="0"
                value={jobForm.salaryMax}
                onChange={(event) => setJobForm((prev) => ({ ...prev, salaryMax: event.target.value }))}
              />
            </label>
            <label>
              <span>Số lượng cần tuyển</span>
              <input
                type="number"
                min="1"
                value={jobForm.openings}
                onChange={(event) => setJobForm((prev) => ({ ...prev, openings: event.target.value }))}
              />
            </label>
            <button type="submit" className="button primary" disabled={actionInProgress}>
              Lưu job requisition
            </button>
          </form>
        </div>

        <div className="section-panel">
          <div className="section-header">
            <h2>Job pipeline</h2>
            <span>{jobs.length} requisition</span>
          </div>
          <div className="list-card">
            {jobs.slice(0, 5).map((job) => (
              <article className="list-row" key={job.id}>
                <div>
                  <span className="highlight">{job.title}</span>
                  <p className="muted">{job.department} · {job.level}</p>
                  <p className="tagline">{job.status}</p>
                </div>
                <div className="row-actions">
                  <span className="metric-pill">{job.openings} HC</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => deleteJob(job.id)}
                    aria-label={`Xoá ${job.title}`}
                    disabled={actionInProgress}
                  >
                    ✕
                  </button>
                </div>
              </article>
            ))}
            {jobs.length === 0 && <p className="muted">Chưa có requisition nào.</p>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>AI Insights tức thời</h2>
          <span>Generative Talent Intelligence</span>
        </div>
        <div className="ai-insights">
          <div className="ai-card">
            <h3>Talent Pulse</h3>
            <p className="muted">
              Đề xuất AI nhằm cải thiện sức khỏe tổ chức trong 30 ngày tới.
            </p>
            <ul>
              {insight?.hiringOpportunities?.map((item, index) => (
                <li key={index}>{item.recommendation}</li>
              ))}
            </ul>
          </div>
          <div className="ai-card">
            <h3>Automation Radar</h3>
            <p className="muted">Các quy trình nên kích hoạt AI Copilot.</p>
            <ul>
              {insight?.automationOpportunities?.map((item, index) => (
                <li key={index}>
                  <span className="highlight">{item.process}</span>: {item.aiAssist}
                </li>
              ))}
            </ul>
          </div>
          <div className="ai-card">
            <h3>Upskilling Map</h3>
            <p className="muted">Lộ trình học tập đề xuất dựa trên nhu cầu kỹ năng.</p>
            <ul>
              {insight?.learningSuggestions?.map((item, index) => (
                <li key={index}>
                  {item.skill} · {item.priority} priority cho {item.audience}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section two-column">
        <div className="section-panel">
          <div className="section-header">
            <h2>Chương trình học tập nổi bật</h2>
            <span>Chuẩn Gallup + CultureAmp</span>
          </div>
          <div className="list-card">
            {topLearningPrograms.map((program) => (
              <article className="list-row" key={program.program}>
                <div>
                  <span className="highlight">{program.program}</span>
                  <p className="muted">Tỷ lệ hoàn thành {formatPercent(program.completionRate, { maximumFractionDigits: 0 })}</p>
                </div>
                <span className="metric-pill">+{Math.round(program.uplift * 100)}% uplift</span>
              </article>
            ))}
          </div>
        </div>
        <div className="section-panel">
          <div className="section-header">
            <h2>Kỹ năng nóng theo thị trường</h2>
            <span>Tham chiếu từ LinkedIn Talent Insights</span>
          </div>
          <div className="list-card">
            {topSkills.map((skill) => (
              <article className="list-row" key={skill.skill}>
                <span className="highlight">{skill.skill}</span>
                <span className="muted">Xuất hiện {skill.count} lần</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
