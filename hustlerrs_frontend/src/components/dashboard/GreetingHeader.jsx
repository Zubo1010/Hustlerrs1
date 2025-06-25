import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

export default function GreetingHeader({ user, stats }) {
  const getGreeting = () => {
    // const hour = new Date().getHours();
    // let timeGreeting = '';
    
    // if (hour < 12) timeGreeting = 'Good morning';
    // else if (hour < 17) timeGreeting = 'Good afternoon';
    // else timeGreeting = 'Good evening';
    
    const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Hustler';
    return `Hey ${firstName}!`;
  };

  const getQuickStat = () => {
    if (!stats) return null;
    if (user.role === 'Hustler') {
      return (
        <div className="flex items-center">
          <FaMoneyBillWave className="text-green-500 mr-2" />
          <p className="text-sm font-medium text-gray-700">{`You earned ${stats?.weeklyEarnings || 0}৳ last week`}</p>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <span className="text-xl mr-2">📋</span>
          <p className="text-sm font-medium text-gray-700">{`You've posted ${stats?.monthlyJobs || 0} jobs this month`}</p>
        </div>
      );
    }
  };

  const quickStat = getQuickStat();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{getGreeting()}</h1>
          <p className="text-gray-600">
            {user.role === 'Hustler' ? 'Ready to hustle today?' : 'Welcome back, boss!'}
          </p>
        </div>
        <div className="text-right">
          {quickStat}
        </div>
      </div>
    </div>
  );
} 