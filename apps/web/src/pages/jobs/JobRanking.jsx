import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { downloadCsv } from '../../utils/csv';

const JobRanking = () => {
  const { job } = useOutletContext();
  const { data, isLoading, error, refetch, isFetching } = useQuery(['ranking', job.id], async () => {
    const res = await api.get(`/applications/ranking/${job.id}`);
    return res.data;
  });

  const items = useMemo(() => data?.items || [], [data]);

  const handleExport = () => {
    const rows = [
      ['Candidate', 'Application ID', 'CV ID', 'Score', 'Matched Skills', 'Missing Skills']
    ];
    items.forEach((item) => {
      rows.push([
        item.candidateName || item.candidateId,
        item.applicationId,
        item.cvId || '—',
        item.score,
        item.matchedSkills.join(' | '),
        item.missingSkills.join(' | ')
      ]);
    });
    downloadCsv({ filename: `${job.title}-ranking.csv`, rows });
  };

  if (isLoading) return <div>Calculating ranking...</div>;
  if (error) return <div className="error-text">Unable to load ranking</div>;

  return (
    <div className="stack">
      <div className="actions-row">
        <button className="btn-primary" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Recalculating...' : 'Recalculate'}
        </button>
        <button className="btn-outline" onClick={handleExport} disabled={!items.length}>
          Export CSV
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Score</th>
            <th>Matched skills</th>
            <th>Missing skills</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.applicationId}>
              <td>
                <div className="table-title">{item.candidateName || item.candidateId}</div>
                <div className="table-sub">CV: {item.cvId || 'n/a'}</div>
              </td>
              <td><span className="score-chip">{item.score}</span></td>
              <td>
                <div className="tag-row">
                  {item.matchedSkills.map((skill) => (
                    <span className="tag positive" key={skill}>{skill}</span>
                  ))}
                  {!item.matchedSkills.length && <span className="tag muted">None</span>}
                </div>
              </td>
              <td>
                <div className="tag-row">
                  {item.missingSkills.map((skill) => (
                    <span className="tag warning" key={skill}>{skill}</span>
                  ))}
                  {!item.missingSkills.length && <span className="tag muted">None</span>}
                </div>
              </td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <div className="empty">No applications to rank</div>}
    </div>
  );
};

export default JobRanking;