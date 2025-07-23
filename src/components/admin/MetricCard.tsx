import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'red' | 'purple' | 'yellow' | 'indigo';
  change?: {
    value: number;
    isPositive: boolean;
    text?: string;
  };
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  isLoading = false,
}) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
  };

  return (
    <Card>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorClasses[color].bg} ${colorClasses[color].text} mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <motion.p
              key={`${value}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {value}
            </motion.p>
            {change && (
              <p className={`text-sm ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-1`}>
                {change.isPositive ? '+' : '-'}{Math.abs(change.value)}% {change.text || 'from yesterday'}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};