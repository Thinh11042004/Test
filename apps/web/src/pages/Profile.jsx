import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ headline: '', skills: '', yearsExp: '', bio: '' });
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery(['candidate', user?.id], async () => {
    if (!user) return null;
    const res = await api.get(`/candidates/${user.id}`);
    return res.data;
  }, {
    enabled: !!user && user.role === 'CANDIDATE',
    onSuccess: (candidate) => {
      if (!candidate) return;
      setForm({
        headline: candidate.headline || '',
        skills: (candidate.skills || []).join(', '),
        yearsExp: candidate.yearsExp || '',
        bio: candidate.bio || ''
      });
    }
  });

  const updateMutation = useMutation((payload) => api.patch(`/candidates/${user.id}`, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate', user.id]);
      setMessage('Profile updated');
      setTimeout(() => setMessage(''), 2500);
    }
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      headline: form.headline,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      yearsExp: form.yearsExp ? Number(form.yearsExp) : null,
      bio: form.bio
    });
  };

  const uploadResume = async (file) => {
    const presignRes = await api.post('/resumes/presign', {
      fileName: file.name,
      mime: file.type
    });
    await fetch(presignRes.data.url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });
    await api.post('/resumes', {
      candidateId: data.id,
      objectName: presignRes.data.key,
      fileName: file.name,
      mimeType: file.type
    });
    queryClient.invalidateQueries(['candidate', user.id]);
    setMessage('Resume uploaded');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadResume(file);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      fileInputRef.current.value = '';
    }
  };

  if (user?.role !== 'CANDIDATE') {
    return <div className="card">Profile editing is only available for candidate accounts.</div>;
  }

  if (isLoading || !data) {
    return <div className="card">Loading profile...</div>;
  }

  return (
    <div className="stack">
      <div className="card header-card">
        <div>
          <h2>Candidate profile</h2>
          <p>Keep your skills, story and resumes up to date for instant matching</p>
        </div>
      </div>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Headline
          <input name="headline" value={form.headline} onChange={handleChange} />
        </label>
        <label>
          Skills (comma separated)
          <input name="skills" value={form.skills} onChange={handleChange} />
        </label>
        <label>
          Years of experience
          <input name="yearsExp" value={form.yearsExp} onChange={handleChange} type="number" min="0" />
        </label>
        <label>
          Bio
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
        </label>
        <button className="btn-primary" type="submit" disabled={updateMutation.isLoading}>
          {updateMutation.isLoading ? 'Saving...' : 'Save profile'}
        </button>
        {message && <div className="success-text">{message}</div>}
      </form>
      <div className="card">
        <div className="resume-header">
          <h3>Resumes</h3>
          <button className="btn-outline" onClick={() => fileInputRef.current.click()}>Upload PDF/DOCX</button>
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,.doc,.docx" onChange={handleFileChange} />
        </div>
        <ul className="resume-list">
          {data.resumes.map((resume) => (
            <li key={resume.id} className="resume-item">
              <div>
                <div className="table-title">{resume.fileName}</div>
                <div className="table-sub">Uploaded {new Date(resume.createdAt).toLocaleString()}</div>
              </div>
              {data.defaultResumeId === resume.id && <span className="tag positive">Default</span>}
            </li>
          ))}
          {data.resumes.length === 0 && <li className="empty">No resumes uploaded yet</li>}
        </ul>
      </div>
    </div>
  );
};

export default Profile;