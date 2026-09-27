import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="py-24"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
