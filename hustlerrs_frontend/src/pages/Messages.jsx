import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage, getChatJobs } from '../services/chatService';
import io from 'socket.io-client';
import { useLocation, Link } from 'react-router-dom';
import { submitReview } from '../services/reviewService';
import Toast from '../components/common/Toast';
import ReviewModal from '../components/common/ReviewModal';

const SOCKET_URL = 'http://localhost:5000';
let socket;

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [jobChats, setJobChats] = useState([]); // List of jobs with accepted chat
  const [selectedJob, setSelectedJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadJobs, setUnreadJobs] = useState([]); // Track jobs with unread messages
  const [toast, setToast] = useState({ isVisible: false, message: '', type: '' });
  const messagesEndRef = useRef(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  // Fetch jobs where user is accepted hustler or job giver
  useEffect(() => {
    if (!user) return;
    
    getChatJobs().then(jobs => {
        console.log('Debug - User:', user);
        console.log('Debug - Fetched jobs:', jobs);
        setJobChats(jobs);
        
        // Check if we need to pre-select a job from the redirect state
        const preselectJobId = location.state?.jobId;
        if (preselectJobId) {
            const jobToSelect = jobs.find(j => j._id === preselectJobId);
            if (jobToSelect) {
                console.log('Debug - Preselected job:', jobToSelect);
                setSelectedJob(jobToSelect);
            }
        }
    });
  }, [user, location.state]);

  useEffect(() => {
    console.log('Debug - Selected job updated:', selectedJob);
    console.log('Debug - Current user:', user);
    if (selectedJob) {
      console.log('Debug - Conditions:', {
        isUserJobCreator: user?.id === selectedJob?.createdBy?._id,
        jobStatus: selectedJob?.status === 'in-progress',
        notReviewed: !selectedJob?.isReviewed,
        userId: user?.id,
        creatorId: selectedJob?.createdBy?._id
      });
    }
  }, [selectedJob, user]);

  // Connect to socket and join rooms when component mounts
  useEffect(() => {
    if (!user) return;
    
    if (!socket) {
      socket = io(SOCKET_URL);
      
      // Join user's personal room
      socket.emit('joinUserRoom', { userId: user.id });
    }

    socket.on('newMessage', (msg) => {
      if (!selectedJob || msg.job !== selectedJob._id) {
        setToast({ jobId: msg.job, sender: msg.sender.name, text: msg.text });
        setUnreadJobs((prev) => (prev.includes(msg.job) ? prev : [...prev, msg.job]));
        setTimeout(() => setToast(null), 4000);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Add listener for chat removal
    socket.on('chatRemoved', ({ jobId, message }) => {
      console.log('Debug - Chat removed for job:', jobId);
      setJobChats(prev => prev.filter(j => j._id !== jobId));
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob(null);
        setMessages([]);
        showToast(message || 'This chat has been closed as the job is completed', 'info');
      }
    });

    // Add listener for job completion
    socket.on('jobCompleted', ({ jobId, message }) => {
      console.log('Debug - Job completed:', jobId);
      setJobChats(prev => prev.map(job => 
        job._id === jobId 
          ? { ...job, status: 'completed', isReviewed: true }
          : job
      ));
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob(prev => ({ ...prev, status: 'completed', isReviewed: true }));
        showToast(message, 'success');
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('chatRemoved');
      socket.off('jobCompleted');
    };
  }, [user]);

  // Join job room when a job is selected
  useEffect(() => {
    if (!socket || !selectedJob) return;
    socket.emit('joinJobRoom', { jobId: selectedJob._id });
  }, [selectedJob]);

  // Fetch messages for selected job
  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    getMessages(selectedJob._id)
      .then(setMessages)
      .finally(() => setLoading(false));
    setUnreadJobs((prev) => prev.filter((id) => id !== selectedJob._id));
  }, [selectedJob]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const receiverId = user._id === selectedJob.createdBy._id ? selectedJob.assignedTo._id : selectedJob.createdBy._id;
    const msg = await sendMessage(selectedJob._id, newMessage, receiverId);
    socket.emit('sendMessage', { ...msg, jobId: selectedJob._id });
    setNewMessage('');
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      setIsSubmittingReview(true);
      console.log('Debug - Selected job before review:', selectedJob);
      console.log('Debug - Review data:', reviewData);
      
      const response = await submitReview(selectedJob._id, reviewData);
      console.log('Debug - Review submission response:', response);

      // Update the job status locally
      setSelectedJob(prev => ({
        ...prev,
        status: 'completed',
        isReviewed: true
      }));

      // Close the modal
      setIsReviewModalOpen(false);

      // Show success message
      showToast('Review submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      console.log('Debug - Full error object:', error.response?.data);
      showToast(error.response?.data?.message || 'Error submitting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isJobCreator = user && selectedJob && user.id === selectedJob.createdBy._id;
  const canMarkAsDone = isJobCreator && selectedJob?.status === 'in-progress' && !selectedJob?.isReviewed;

  useEffect(() => {
    if (selectedJob) {
      console.log('Debug - Selected job details:', {
        id: selectedJob._id,
        title: selectedJob.title,
        status: selectedJob.status,
        isReviewed: selectedJob.isReviewed,
        createdBy: selectedJob.createdBy,
        acceptedHustler: selectedJob.acceptedHustler
      });
    }
  }, [selectedJob]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
          <pre>
            {JSON.stringify({
              userRole: user?.role,
              userId: user?.id,
              jobCreatorId: selectedJob?.createdBy?._id,
              jobStatus: selectedJob?.status,
              isReviewed: selectedJob?.isReviewed,
              isJobCreator,
              canMarkAsDone,
              idsMatch: user?.id === selectedJob?.createdBy?._id
            }, null, 2)}
          </pre>
        </div>
      )}
      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-xl font-bold p-4">Messages</h2>
        {jobChats.length === 0 && <p className="p-4 text-gray-500">No chats yet.</p>}
        {jobChats.map((job) => (
          <div
            key={job._id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedJob && selectedJob._id === job._id ? 'bg-gray-200' : ''
            }`}
            onClick={() => {
              console.log('Selected job:', job); // Debug log
              setSelectedJob(job);
            }}
          >
            <div className="font-semibold flex items-center">
              {job.title}
              {unreadJobs.includes(job._id) && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              With: {user._id === job.createdBy._id ? job.assignedTo?.fullName : job.createdBy?.fullName}
            </div>
            <div className="text-xs text-gray-500">
              Status: {job.status}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {selectedJob ? (
          <>
            <div className="border-b p-4 bg-white flex justify-between items-center">
              <div>
                <div className="font-bold">{selectedJob.title}</div>
                <div className="text-sm text-gray-600">
                  Status: {selectedJob.status}
                  {canMarkAsDone && ' (You can mark this job as done)'}
                </div>
              </div>
              {canMarkAsDone && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Mark Job as Done'}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <p>Loading messages...</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender._id === user._id;
                  return (
                    <div key={msg._id} className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs ${isMe ? 'text-right' : 'text-left'}`}>
                        <div className={`text-xs font-semibold mb-1 ${isMe ? 'text-blue-700' : 'text-gray-700'}`}>
                          {msg.sender.fullName}
                        </div>
                        <div className={`rounded-lg p-3 ${isMe ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 bg-white border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-l focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />
      )}
    </div>
  );
}
