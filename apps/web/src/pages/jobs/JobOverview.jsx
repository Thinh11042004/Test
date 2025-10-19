import { useOutletContext } from 'react-router-dom';

const JobOverview = () => {
  const { job } = useOutletContext();

  return (
    <div className="job-overview">
      <section>
        <h3>Role summary</h3>
        <pre className="jd-block">{job.jdRaw}</pre>
      </section>
      <section>
        <h3>Attributes</h3>
        <div className="grid-2">
          <div>
            <span className="label">Department</span>
            <p>{job.department || '—'}</p>
          </div>
          <div>
            <span className="label">Level</span>
            <p>{job.level || '—'}</p>
          </div>
          <div>
            <span className="label">Location</span>
            <p>{job.location || '—'}</p>
          </div>
          <div>
            <span className="label">Type</span>
            <p>{job.type || '—'}</p>
          </div>
          <div>
            <span className="label">Salary range</span>
            <p>
              {job.salaryMin && job.salaryMax
                ? `$${job.salaryMin} - $${job.salaryMax}`
                : '—'}
            </p>
          </div>
        </div>
      </section>
      <section>
        <h3>Required skills</h3>
        <div className="tag-row">
          {job.skills.map((skill) => (
            <span className="tag" key={skill}>{skill}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JobOverview;