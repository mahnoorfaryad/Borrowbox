import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-24"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
