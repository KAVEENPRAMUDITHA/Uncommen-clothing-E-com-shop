import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen text-neutral-400">Loading...</div>;
    if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
    return <>{children}</>;
}
