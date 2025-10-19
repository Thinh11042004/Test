import { useQuery } from 'react-query';
import api from '../services/api';

const AdminUsers = () => {
  const { data, isLoading, error } = useQuery(['admin-users'], async () => {
    const res = await api.get('/admin/users');
    return res.data;
  });

  if (isLoading) return <div className="card">Loading users...</div>;
  if (error) return <div className="card error-text">Failed to load users</div>;

  return (
    <div className="card">
      <h2>Users & roles</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="empty">No users yet</div>}
    </div>
  );
};

export default AdminUsers;