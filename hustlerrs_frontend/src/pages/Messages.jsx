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
    setTimeout(() => setToast({ isVisible: false, message: '', type: '' }), 3000);
  };

  // Fetch jobs where user is accepted hustler or job giver
  useEffect(() => {
    if (!user) return;
    
    getChatJobs().then(jobs => {
        setJobChats(jobs);
        
        // Check if we need to pre-select a job from the redirect state
        const preselectJobId = location.state?.jobId;
        if (preselectJobId) {
            const jobToSelect = jobs.find(j => j._id === preselectJobId);
            if (jobToSelect) {
                setSelectedJob(jobToSelect);
            }
        }
    });
  }, [user, location.state]);

  // Connect to socket and join room when job selected
  useEffect(() => {
    if (!selectedJob) return;
    if (!socket) socket = io(SOCKET_URL);
    socket.emit('joinJobRoom', { jobId: selectedJob._id });

    socket.on('newMessage', (msg) => {
      if (!selectedJob || msg.job !== selectedJob._id) {
        setToast({ jobId: msg.job, sender: msg.sender.name, text: msg.text });
        setUnreadJobs((prev) => (prev.includes(msg.job) ? prev : [...prev, msg.job]));
        setTimeout(() => setToast(null), 4000);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
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
    const receiverId = user._id === selectedJob.createdBy._id ? selectedJob.acceptedHustler._id : selectedJob.createdBy._id;
    const msg = await sendMessage(selectedJob._id, newMessage, receiverId);
    socket.emit('sendMessage', { ...msg, jobId: selectedJob._id });
    setNewMessage('');
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!selectedJob) return;

    setIsSubmittingReview(true);
    try {
      await submitReview(selectedJob._id, reviewData);
      showToast('Review submitted! Job completed.', 'success');
      
      // Close modal and remove job from UI
      setIsReviewModalOpen(false);
      setJobChats(prev => prev.filter(j => j._id !== selectedJob._id));
      setSelectedJob(null);
    } catch (err) {
      console.error('Error submitting review:', err);
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
            onClick={() => setSelectedJob(job)}
          >
            <div className="font-semibold flex items-center">
              {job.title}
              {unreadJobs.includes(job._id) && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              With: {user._id === job.createdBy._id ? job.acceptedHustler.name : job.createdBy.name}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {selectedJob ? (
          <>
            <div className="border-b p-4 font-bold bg-white flex justify-between items-center">
              <span>Chat for: {selectedJob.title}</span>
              {user && user._id === selectedJob.createdBy._id && !selectedJob.isReviewed && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Mark as Done & Review
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
                          {msg.sender.name}
                        </div>
                        <div className={`rounded px-3 py-2 ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          <div className="text-sm">{msg.text}</div>
                          <div className="text-xs opacity-60 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t flex">
              <input
                className="flex-1 border rounded px-3 py-2 mr-2"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>
        )}
      </div>
      
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
}
