import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';

const JobDetail = () => {
  const { jobId } = useParams();
  const { data, isLoading, error } = useQuery(['job', jobId], async () => {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  });

  if (isLoading) {
    return <div className="card">Loading job...</div>;
  }

  if (error) {
    return <div className="card error-text">Unable to load job</div>;
  }

  return (
    <div className="stack">
      <div className="card header-card">
        <div>
          <h2>{data.title}</h2>
          <p>Owned by {data.createdBy?.fullName || 'Unknown'} · {data.skills.join(', ')}</p>
        </div>
      </div>
      <div className="card tab-card">
        <nav className="tab-nav">
          <NavLink end to="." className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Details
          </NavLink>
          <NavLink to="applications" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Applications ({data.applications.length})
          </NavLink>
          <NavLink to="ranking" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Ranking
          </NavLink>
        </nav>
        <div className="tab-content">
          <Outlet context={{ job: data }} />
        </div>
      </div>
    </div>
  );
};

export default JobDetail;