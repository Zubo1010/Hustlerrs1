import React, { useState } from 'react';
import { sendMessage } from '../../services/chatService';

export default function ChatInitiationModal({ isOpen, onClose, applicant, jobId, onSuccess }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) {
            setError('Message cannot be empty.');
            return;
        }
        setIsSending(true);
        setError('');
        try {
            // The sendMessage service expects the receiver's ID
            await sendMessage(jobId, message, applicant.hustler._id);
            onSuccess(); // This will trigger redirection in the parent component
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Error sending initial message:', err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Start a Conversation</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <p className="mb-4 text-gray-600">
                    To: <span className="font-semibold text-blue-600">{applicant.hustler.name}</span>
                </p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your initial message to start the chat..."
                    className="w-full h-36 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    rows="4"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
                    <button onClick={handleSend} disabled={isSending || !message.trim()} className="btn-primary text-sm">
                        {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
} 