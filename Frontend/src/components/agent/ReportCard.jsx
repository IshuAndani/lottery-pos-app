import React from 'react';

const ReportCard = ({ title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="mt-2 text-3xl font-bold">
        {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
      </p>
    </div>
  );
};

export default ReportCard;