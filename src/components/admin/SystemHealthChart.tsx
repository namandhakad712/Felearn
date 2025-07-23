import React from 'react';
import { Card } from '../ui';

interface SystemHealthChartProps {
  title: string;
  isLoading: boolean;
  children?: React.ReactNode;
}

export const SystemHealthChart: React.FC<SystemHealthChartProps> = ({
  title,
  isLoading,
  children,
}) => {
  return (
    <Card>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {isLoading ? (
        <div className="h-40 animate-pulse flex flex-col justify-center items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="h-40 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Chart will be implemented in the next phase
          </p>
        </div>
      )}
    </Card>
  );
};