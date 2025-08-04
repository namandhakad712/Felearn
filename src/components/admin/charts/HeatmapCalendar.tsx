import React from 'react';
import { Card } from '../../ui';

interface HeatmapData {
  date: string;
  count: number;
}

interface HeatmapCalendarProps {
  title: string;
  data: HeatmapData[];
  colorScale?: string[];
  maxCount?: number;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  title,
  data,
  colorScale = [
    'rgb(239, 246, 255)', // Very light blue
    'rgb(191, 219, 254)', // Light blue
    'rgb(147, 197, 253)', // Medium blue
    'rgb(96, 165, 250)',  // Blue
    'rgb(59, 130, 246)',  // Darker blue
  ],
  maxCount = 200,
}) => {
  // Group data by week
  const weeks: HeatmapData[][] = [];
  const dateMap = new Map<string, HeatmapData>();
  
  // Create a map of dates to counts
  data.forEach(item => {
    dateMap.set(item.date, item);
  });
  
  // Get the first date in the data
  const firstDate = data.length > 0 ? new Date(data[0].date) : new Date();
  
  // Calculate the start of the week (Sunday)
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - firstDate.getDay());
  
  // Generate a 5-week calendar (35 days)
  for (let week = 0; week < 5; week++) {
    const weekData: HeatmapData[] = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const dataPoint = dateMap.get(dateString);
      
      weekData.push(dataPoint || { date: dateString, count: 0 });
    }
    
    weeks.push(weekData);
  }
  
  // Function to get color based on count
  const getColor = (count: number): string => {
    const index = Math.min(
      Math.floor((count / maxCount) * colorScale.length),
      colorScale.length - 1
    );
    return colorScale[index];
  };
  
  // Day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="flex mb-2">
        <div className="w-8"></div>
        {dayLabels.map((day) => (
          <div key={day} className="flex-1 text-xs text-center text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {weeks.map((week, weekIndex) => (
        <div key={`week-${weekIndex}`} className="flex mb-2">
          <div className="w-8 text-xs text-right pr-2 text-gray-500 dark:text-gray-400">
            Week {weekIndex + 1}
          </div>
          {week.map((day, dayIndex) => (
            <div 
              key={`day-${weekIndex}-${dayIndex}`} 
              className="flex-1 aspect-square mx-0.5"
            >
              <div 
                className="w-full h-full rounded-sm hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                style={{ backgroundColor: getColor(day.count) }}
                title={`${day.date}: ${day.count} API calls`}
              ></div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="flex items-center justify-end mt-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mr-2">Less</div>
        {colorScale.map((color, index) => (
          <div 
            key={`legend-${index}`}
            className="w-4 h-4 mx-0.5 rounded-sm"
            style={{ backgroundColor: color }}
          ></div>
        ))}
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">More</div>
      </div>
    </Card>
  );
};

export default HeatmapCalendar;