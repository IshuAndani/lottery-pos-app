import React from 'react';

const ReportCard = ({ title, value, color = 'blue', tooltip, delta, format = 'currency' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`w-full p-4 sm:p-6 rounded-lg shadow-md ${colorClasses[color]}`} title={tooltip}>
      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider flex items-center gap-2">
        {title}
      </h3>
      <p className="mt-2 text-2xl sm:text-3xl font-bold break-words">
        {typeof value === 'number'
          ? (format === 'currency'
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
              : new Intl.NumberFormat('en-US').format(value)
            )
          : value}
      </p>
      {delta !== undefined && (
        <p className={`mt-1 text-xs sm:text-sm font-semibold ${delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {delta >= 0 ? '+' : ''}{delta}% vs last period
        </p>
      )}
    </div>
  );
};

export default ReportCard;