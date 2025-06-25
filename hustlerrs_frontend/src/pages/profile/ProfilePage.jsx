import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaPen } from 'react-icons/fa';

const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
        ))}
        {rating && <span className="ml-2 text-sm text-gray-600 font-semibold">{Number(rating).toFixed(1)}</span>}
    </div>
);

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const profileId = userId || currentUser?._id;
  const isOwnProfile = profileId === currentUser?._id;

  useEffect(() => {
    if (profileId) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const data = await getProfile(profileId);
          setProfile(data);
          setError('');
        } catch (err) {
          setError('Failed to fetch profile. This profile might be private.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    } else {
        setLoading(false);
        setError('No profile to display.');
    }
  }, [profileId]);

  if (loading) {
    return <div className="text-center mt-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center mt-8">Profile not found.</div>;
  }
  
  const {
    fullName,
    role,
    location,
    profilePicture,
    bio,
    skills,
    completedJobsCount,
    postedJobsCount,
    averageRating,
    badges,
    businessName,
    reviews,
  } = profile;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col sm:flex-row items-center">
          <img
            className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-gray-200"
            src={profilePicture ? `http://localhost:5000${profilePicture}`: `https://ui-avatars.com/api/?name=${fullName}&background=random`}
            alt={fullName}
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{fullName}</h1>
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 ${role === 'Hustler' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {role === 'Hustler' ? <FaGraduationCap className="inline -mt-1 mr-1" /> : <FaBriefcase className="inline -mt-1 mr-1" />}
              {role}
            </span>
            <div className="text-gray-600 mt-2 flex items-center justify-center sm:justify-start">
              <FaMapMarkerAlt className="mr-2" /> {location}
            </div>
          </div>
          {isOwnProfile && (
            <Link to="/settings/profile" className="mt-4 sm:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center">
              <FaPen className="mr-2" /> Edit Profile
            </Link>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{bio || (role === 'Hustler' ? 'Let people know what kind of work you love doing!' : 'Tell Hustlers what kind of help you usually need.')}</p>
        </div>

        {/* Role-Specific Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hustler Block */}
          {role === 'Hustler' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hustler Stats</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills && skills.length > 0 ? skills.map(skill => (
                      <span key={skill} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                    )) : <p className="text-gray-500">No skills listed yet.</p>}
                  </div>
                </div>
                <p><span className="font-semibold">Completed Jobs:</span> {completedJobsCount || 0}</p>
                <p><span className="font-semibold">Average Rating:</span> {'⭐'.repeat(Math.round(averageRating || 0)) || 'No ratings yet'}</p>
                <div>
                  <h3 className="font-semibold">Badges</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {badges && badges.length > 0 ? badges.map(badge => (
                      <span key={badge} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm">{badge}</span>
                    )) : <p className="text-gray-500">No badges earned yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Giver Block */}
          {role === 'Job Giver' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Job Giver Info</h2>
               <div className="space-y-4">
                <p><span className="font-semibold">Business Name:</span> {businessName || 'N/A'}</p>
                <p><span className="font-semibold">Posted Jobs:</span> {postedJobsCount || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section - Only for Hustlers with reviews */}
        {role === 'Hustler' && reviews && reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reviews ({reviews.length})</h2>
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center mb-2">
                                <StarRating rating={review.rating} />
                            </div>
                            <p className="text-gray-700 italic mb-2">"{review.comment}"</p>
                            <div className="text-sm text-gray-500 flex items-center">
                                <img 
                                    src={review.jobGiver.profilePicture ? `http://localhost:5000${review.jobGiver.profilePicture}` : `https://ui-avatars.com/api/?name=${review.jobGiver.fullName}&background=random`} 
                                    alt={review.jobGiver.fullName} 
                                    className="w-6 h-6 rounded-full mr-2"
                                />
                                <span className="font-semibold">{review.jobGiver.fullName}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 