import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobApplications } from '../../services/jobService';
import { updateBidStatus } from '../../services/bidService';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/common/Toast';
import ChatInitiationModal from '../../components/job/ChatInitiationModal';

export default function JobApplications() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ isVisible: false, message: '', type: '' });

    // New states for chat modal
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => setToast({ isVisible: false, message: '', type: '' }), 3000);
    };

    const fetchApplications = useCallback(async () => {
        if (!user || user.role !== 'Job Giver') {
            setError('Access Denied. Only job givers can view applications.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getJobApplications(id);
            setJob(data.job || null);
            setApplications(data.applications || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications. Please ensure you are the job owner and try again.');
            showToast('Failed to load applications.', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleBidAction = async (bidId, status) => {
        try {
            await updateBidStatus(bidId, { status });
            showToast(`Application has been ${status}.`, 'success');
            fetchApplications();
        } catch (err) {
            console.error(`Error updating bid status to ${status}:`, err);
            showToast(`Failed to ${status} application.`, 'error');
        }
    };

    const handleOpenChatModal = (applicant) => {
        setSelectedApplicant(applicant);
        setIsChatModalOpen(true);
    };

    const handleCloseChatModal = () => {
        setSelectedApplicant(null);
        setIsChatModalOpen(false);
    };

    const handleMessageSent = () => {
        handleCloseChatModal();
        showToast('Message sent! Redirecting to chat...', 'success');
        // Redirect to messages page with state to auto-select the chat
        setTimeout(() => {
            navigate('/messages', { state: { jobId: id } });
        }, 1000); // Short delay to allow user to see toast
    };

    if (loading) return <div className="text-center py-12">Loading applications...</div>;
    if (error) return <div className="text-center py-12 text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">{error}</div>;

    return (
        <>
            <Toast 
                isVisible={toast.isVisible} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
            <div className="container mx-auto p-4 md:p-8">
                <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline">
                    &larr; Back to Jobs
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Applicants</h1>
                {job && <p className="text-lg text-gray-600 mb-8">For job: "{job.title}"</p>}

                {applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app) => {
                            const displayStatus = (app.status === 'accepted' && job?.status === 'completed') ? 'completed' : app.status;
                            const statusStyles = {
                                completed: 'bg-gray-500 text-white',
                                accepted: 'bg-green-100 text-green-800',
                                rejected: 'bg-red-100 text-red-800',
                                withdrawn: 'bg-yellow-100 text-yellow-800',
                                pending: 'bg-blue-100 text-blue-800',
                            };

                            return (
                                <div key={app._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-shadow duration-300 hover:shadow-lg">
                                    <div className="grid md:grid-cols-3 gap-4 items-center">
                                        <div className="md:col-span-1">
                                            <h3 className="font-semibold text-lg text-gray-900">{app.hustler?.fullName || 'Unnamed Applicant'}</h3>
                                            <p className="text-blue-600 font-bold text-xl">Bid: ৳{app.price}</p>
                                            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[displayStatus]}`}>
                                                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-600 text-sm italic">"{app.notes || 'No cover letter provided.'}"</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-end">
                                        <Link to={`/profile/${app.hustler?._id}`} className="btn-secondary text-sm">
                                            View Profile
                                        </Link>
                                        {app.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleBidAction(app._id, 'rejected')} className="btn-danger text-sm">
                                                    Reject
                                                </button>
                                                <button onClick={() => handleBidAction(app._id, 'accepted')} className="btn-primary text-sm">
                                                    Accept
                                                </button>
                                            </>
                                        )}
                                        {app.status === 'accepted' && job?.status !== 'completed' && (
                                            <button onClick={() => handleOpenChatModal(app)} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                                Chat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-700">No applications yet.</h3>
                        <p className="text-gray-500 mt-2">Check back later to see who has applied to your job!</p>
                    </div>
                )}
            </div>

            {selectedApplicant && (
                <ChatInitiationModal 
                    isOpen={isChatModalOpen}
                    onClose={handleCloseChatModal}
                    applicant={selectedApplicant}
                    jobId={id}
                    onSuccess={handleMessageSent}
                />
            )}
        </>
    );
}
