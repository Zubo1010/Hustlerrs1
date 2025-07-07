import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileById } from '../../services/profileService';
import { getProfilePictureUrl } from '../../utils/imageUtils';

export default function HustlerProfilePage() {
    const { hustlerId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileById(hustlerId);
                if (data.role !== 'Hustler') {
                    setError('This user is not a hustler');
                    return;
                }
                setProfile(data);
            } catch (err) {
                console.error('Error fetching hustler profile:', err);
                setError('Failed to load hustler profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [hustlerId]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
        </div>
    );

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-blue-600 hover:underline flex items-center"
            >
                ← Back
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                            <img
                                src={getProfilePictureUrl(profile.profilePicture)}
                                alt={profile.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:ml-6 mt-4 md:mt-0">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                            <p className="text-gray-600 mt-1">Age: {profile.age}</p>
                            <p className="text-gray-600">Location: {profile.division}, {profile.district}</p>
                            {profile.bio && (
                                <p className="mt-4 text-gray-700">{profile.bio}</p>
                            )}
                        </div>
                    </div>

                    {profile.skills?.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.badges?.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Badges</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.badges.map((badge, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Completed Jobs</p>
                                <p className="text-2xl font-bold text-gray-900">{profile.completedJobsCount || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Average Rating</p>
                                <p className="text-2xl font-bold text-gray-900">{profile.averageRating || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">{profile.reviewCount || 0}</p>
                            </div>
                        </div>
                    </div>

                    {profile.reviews?.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Reviews</h2>
                            <div className="space-y-4">
                                {profile.reviews.map((review) => (
                                    <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                                                <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 