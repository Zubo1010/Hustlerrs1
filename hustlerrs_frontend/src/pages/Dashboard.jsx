import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const userRole = user?.role; // e.g., 'Hustler', 'Job Giver', 'Admin'

    return (
        <div>
            {userRole === 'Job Giver' && (
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Job Giver Dashboard</h1>
                    {/* Job Giver specific components */}
                </div>
            )}
            {userRole === 'Hustler' && (
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Hustler Dashboard</h1>
                    {/* Hustler specific components */}
                </div>
            )}
        </div>
    );
}
  