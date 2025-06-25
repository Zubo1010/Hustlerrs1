import React from 'react';
import { FaClipboardList, FaCheckCircle, FaHourglassHalf, FaDollarSign } from 'react-icons/fa';

export default function ActivityOverview({ user, stats }) {
  const getActivityData = () => {
    if (user.role === 'Hustler') {
      return [
        {
          icon: '📄',
          title: 'Applied',
          value: stats?.totalApplications || 0,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          icon: '🕒',
          title: 'Pending',
          value: stats?.pendingApplications || 0,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        },
        {
          icon: '✅',
          title: 'Hired',
          value: stats?.completedJobs || 0,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
      ];
    } else {
      return [
        {
          icon: '📂',
          title: 'Open Jobs',
          value: stats?.openJobs || 0,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          icon: '👥',
          title: 'Applicants',
          value: stats?.totalApplicants || 0,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          icon: '👍',
          title: 'Hired',
          value: stats?.hiredWorkers || 0,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
      ];
    }
  };

  const activityData = getActivityData();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Activity</h2>
        <a href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          View All
        </a>
      </div>
      <div className={`grid grid-cols-${activityData.length} gap-4`}>
        {activityData.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`${item.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <span className="text-xl">{item.icon}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{item.value}</div>
            <div className="text-sm text-gray-600 mb-1">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 