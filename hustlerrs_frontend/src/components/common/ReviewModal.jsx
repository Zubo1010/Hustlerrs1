import React, { useState } from 'react';

const Star = ({ filled, onClick }) => (
    <svg 
        onClick={onClick} 
        className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
);

export default function ReviewModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleRating = (rate) => {
        setRating(rate);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }
        if (!comment.trim()) {
            setError('Please leave a comment.');
            return;
        }
        setError('');
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave a Review</h2>
                
                <div className="mb-4">
                    <p className="font-semibold mb-2">Rating</p>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                filled={star <= rating} 
                                onClick={() => handleRating(star)} 
                            />
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="comment" className="font-semibold mb-2 block">Comment</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-28 p-2 border border-gray-300 rounded-md"
                        placeholder="Share your experience with this hustler..."
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} disabled={isSubmitting} className="btn-secondary text-sm">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary text-sm">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
} 