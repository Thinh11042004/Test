import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JobForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    jdRaw: '',
    skills: '',
    department: '',
    level: '',
    location: '',
    type: '',
    salaryMin: '',
    salaryMax: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        jdRaw: form.jdRaw,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        department: form.department || null,
        level: form.level || null,
        location: form.location || null,
        type: form.type || null,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null
      };
      const { data } = await api.post('/jobs', payload);
      navigate(`/jobs/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="card header-card">
        <div>
          <h2>Create new role</h2>
          <p>Capture JD, required skills and comp range for AI matching</p>
        </div>
      </div>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Job description (Markdown supported)
          <textarea name="jdRaw" value={form.jdRaw} onChange={handleChange} rows={6} required />
        </label>
        <label>
          Required skills (comma separated)
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="react, typescript, html" />
        </label>
        <div className="grid-2">
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} />
          </label>
          <label>
            Level
            <input name="level" value={form.level} onChange={handleChange} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} />
          </label>
          <label>
            Type
            <input name="type" value={form.type} onChange={handleChange} placeholder="Full-time / Contract" />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Salary min (USD)
            <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} />
          </label>
          <label>
            Salary max (USD)
            <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} />
          </label>
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create job'}
        </button>
      </form>
    </div>
  );
};

export default JobForm;