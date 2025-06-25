import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HustlerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/hustler-applications');
                setApplications(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch applications');
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/hustler-applications/${id}/approve`);
            setApplications(applications.filter(app => app._id !== id));
        } catch (err) {
            console.error(err);
            setError('Failed to approve application');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/hustler-applications/${id}/reject`);
            setApplications(applications.filter(app => app._id !== id));
        } catch (err) {
            console.error(err);
            setError('Failed to reject application');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-4">Hustler Applications</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Age</th>
                            <th className="py-2 px-4 border-b">Address</th>
                            <th className="py-2 px-4 border-b">NID/Birth Certificate</th>
                            <th className="py-2 px-4 border-b">Student ID</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app._id}>
                                <td className="py-2 px-4 border-b">{app.name}</td>
                                <td className="py-2 px-4 border-b">{app.age}</td>
                                <td className="py-2 px-4 border-b">{app.address}</td>
                                <td className="py-2 px-4 border-b">
                                    <a href={`http://localhost:5000${app.nidOrBirthCertificate}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <a href={`http://localhost:5000${app.studentId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button onClick={() => handleApprove(app._id)} className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600">Approve</button>
                                    <button onClick={() => handleReject(app._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HustlerApplications; 