import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Applications = () => {
  const user = useAuthStore((state) => state.user);
  const [selectedJob, setSelectedJob] = useState('');

  const jobsQuery = useQuery(['jobs'], async () => {
    const res = await api.get('/jobs');
    return res.data;
  }, {
    enabled: user?.role !== 'CANDIDATE'
  });

  const applicationsQuery = useQuery(
    ['applications-overview', user?.role, selectedJob],
    async () => {
      if (!user) return [];
      if (user.role === 'CANDIDATE') {
        const res = await api.get('/applications/mine');
        return res.data;
      }
      if (!selectedJob) return [];
      const res = await api.get(`/applications/by-job/${selectedJob}`);
      return res.data;
    },
    {
      enabled: !!user && (user.role === 'CANDIDATE' || !!selectedJob)
    }
  );

  const applications = applicationsQuery.data || [];

  return (
    <div className="stack">
      <div className="card header-card">
        <div>
          <h2>Applications</h2>
          <p>Track progress across the funnel for every candidate</p>
        </div>
        {user?.role !== 'CANDIDATE' && (
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="">Select job</option>
            {(jobsQuery.data || []).map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        )}
      </div>
      <div className="card">
        {applicationsQuery.isLoading ? (
          <div>Loading applications...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Candidate</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.job?.title || jobsQuery.data?.find((j) => j.id === application.jobId)?.title || '—'}</td>
                  <td>{application.candidate?.user?.fullName || application.candidate?.user?.email || user?.fullName}</td>
                  <td>{application.status}</td>
                  <td>{application.stage || '—'}</td>
                  <td>{application.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {applications.length === 0 && !applicationsQuery.isLoading && (
          <div className="empty">No applications found</div>
        )}
      </div>
    </div>
  );
};

export default Applications;