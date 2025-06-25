import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFolderOpen, FaBriefcase, FaMoneyBillWave, FaMedal, FaBullseye, FaUsers, FaChartBar } from 'react-icons/fa';

const ICON_STYLE = { color: '#4CAF50', fontSize: '2rem', marginBottom: '0.5rem' };

const ACTIONS = {
  Hustler: [
    {
      icon: <FaSearch style={ICON_STYLE} />,
      text: 'Find Work',
      link: '/jobs',
      bg: 'bg-white',
      border: 'border border-green-100',
      description: 'Browse available jobs',
    },
    {
      icon: <FaFolderOpen style={ICON_STYLE} />,
      text: 'My Applications',
      link: '/my-applications',
      bg: 'bg-green-50',
      border: 'border border-green-100',
      description: 'Track your applications',
    },
    {
      icon: <FaBriefcase style={ICON_STYLE} />,
      text: 'My Jobs',
      link: '/my-jobs',
      bg: 'bg-blue-50',
      border: 'border border-blue-100',
      description: 'View your active jobs',
    },
    {
      icon: <FaMoneyBillWave style={ICON_STYLE} />,
      text: 'Earnings',
      link: '/profile/earnings',
      bg: 'bg-yellow-50',
      border: 'border border-yellow-100',
      description: 'View your earnings',
    },
    {
      icon: <FaMedal style={ICON_STYLE} />,
      text: 'Leaderboard',
      link: '/leaderboard',
      bg: 'bg-orange-50',
      border: 'border border-orange-100',
      description: 'See top earners',
    },
  ],
  'Job Giver': [
    {
      icon: <FaBullseye style={ICON_STYLE} />,
      text: 'Post a Job',
      link: '/post-job',
      bg: 'bg-green-50',
      border: 'border border-green-100',
      description: 'Create new job post',
    },
    {
      icon: <FaBriefcase style={ICON_STYLE} />,
      text: 'My Jobs',
      link: '/my-jobs',
      bg: 'bg-blue-50',
      border: 'border border-blue-100',
      description: 'Manage your jobs',
    },
    {
      icon: <FaUsers style={ICON_STYLE} />,
      text: 'View Applicants',
      link: '/my-jobs',
      bg: 'bg-orange-50',
      border: 'border border-orange-100',
      description: 'Review applications',
    },
    {
      icon: <FaChartBar style={ICON_STYLE} />,
      text: 'Analytics',
      link: '/analytics',
      bg: 'bg-purple-50',
      border: 'border border-purple-100',
      description: 'Job performance stats',
    },
  ],
};

export default function QuickActions({ user }) {
  const actions = ACTIONS[user.role] || [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            to={action.link}
            className={`group ${action.bg} ${action.border} rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-200 card-hover focus-ring hover:shadow-xl hover:-translate-y-1`}
            style={{ minHeight: 140 }}
          >
            {action.icon}
            <div className="font-semibold text-base mb-1 text-gray-900 group-hover:text-primary-green transition-colors">{action.text}</div>
            <div className="text-xs text-gray-500 text-center">{action.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 