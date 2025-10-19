import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const JobList = () => {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useQuery(['jobs'], async () => {
    const res = await api.get('/jobs');
    return res.data;
  });

  if (isLoading) {
    return <div className="card">Loading jobs...</div>;
  }

  if (error) {
    return <div className="card error-text">Failed to load jobs</div>;
  }

  return (
    <div className="stack">
      <div className="card header-card">
        <div>
          <h2>Open roles</h2>
          <p>Monitor hiring funnel and AI signals across requisitions</p>
        </div>
        {(user?.role === 'HR' || user?.role === 'ADMIN') && (
          <Link className="btn-primary" to="/jobs/new">
            New job
          </Link>
        )}
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Location</th>
              <th>Level</th>
              <th>Skills</th>
              <th>Applications</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className="table-title">{job.title}</div>
                  <div className="table-sub">{job.department}</div>
                </td>
                <td>{job.location || '—'}</td>
                <td>{job.level || '—'}</td>
                <td>
                  <div className="tag-row">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span className="tag" key={skill}>{skill}</span>
                    ))}
                    {job.skills.length > 5 && <span className="tag muted">+{job.skills.length - 5}</span>}
                  </div>
                </td>
                <td>{job.applicationsCount}</td>
                <td>
                  <Link className="btn-link" to={`/jobs/${job.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="empty">No jobs available yet</div>}
      </div>
    </div>
  );
};

export default JobList;