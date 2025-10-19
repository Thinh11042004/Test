import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../services/api';

const statusOptions = ['SUBMITTED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

const JobApplications = () => {
  const { job } = useOutletContext();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(['applications', job.id], async () => {
    const res = await api.get(`/applications/by-job/${job.id}`);
    return res.data;
  });

  const mutation = useMutation(
    ({ id, updates }) => api.patch(`/applications/${id}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['applications', job.id]);
        queryClient.invalidateQueries(['job', job.id]);
      }
    }
  );

  const applications = useMemo(() => data || [], [data]);

  if (isLoading) return <div>Loading applications...</div>;
  if (error) return <div className="error-text">Failed to load applications</div>;

  const handleChange = (id, field, value) => {
    mutation.mutate({ id, updates: { [field]: value } });
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Notes</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={`${application.id}-${application.updatedAt}`}>
              <td>
                <div className="table-title">{application.candidate?.user?.fullName || 'Unknown'}</div>
                <div className="table-sub">{application.resume?.fileName || 'No resume'}</div>
              </td>
              <td>
                <select
                  value={application.status}
                  onChange={(e) => handleChange(application.id, 'status', e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  defaultValue={application.stage || ''}
                  onBlur={(e) => handleChange(application.id, 'stage', e.target.value)}
                  placeholder="Stage"
                />
              </td>
              <td>
                <textarea
                  defaultValue={application.notes || ''}
                  onBlur={(e) => handleChange(application.id, 'notes', e.target.value)}
                  rows={2}
                />
              </td>
              <td>{new Date(application.updatedAt || application.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {applications.length === 0 && <div className="empty">No applications yet</div>}
    </div>
  );
};

export default JobApplications;