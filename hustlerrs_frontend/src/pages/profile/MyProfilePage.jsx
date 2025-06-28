import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/profileService';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-2xl font-bold text-blue-600">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
    </div>
);

const MyProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                setError("You must be logged in to view this page.");
                return;
            }
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err) {
                setError('Failed to fetch profile. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    if (!profile) {
        return <div className="text-center p-10">Could not load profile.</div>;
    }

    const { fullName, email, phone, role, location, bio, profilePicture, averageRating, reviewCount, skills } = profile;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 p-4 text-white text-center">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <p className="text-blue-200">{role}</p>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                        <img
                            src={profilePicture ? `http://localhost:5000${profilePicture}` : 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-white -mt-16 shadow-lg"
                        />
                        <div className="md:ml-6 mt-4 md:mt-0">
                            <h2 className="text-xl font-semibold">{fullName}</h2>
                            <p className="text-gray-600">{location}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                <span className="text-yellow-500">★</span>
                                <span className="ml-1 font-bold">{averageRating || 'N/A'}</span>
                                <span className="text-gray-500 ml-2">({reviewCount || 0} reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><span className="font-medium text-gray-600">Email:</span> {email}</p>
                            <p><span className="font-medium text-gray-600">Phone:</span> {phone}</p>
                            <p><span className="font-medium text-gray-600">Address:</span> {profile.address}</p>
                        </div>
                    </div>

                    {bio && (
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">About Me</h3>
                            <p className="text-gray-700">{bio}</p>
                        </div>
                    )}

                    {role === 'Hustler' && skills && skills.length > 0 && (
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/profile/settings" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage; 