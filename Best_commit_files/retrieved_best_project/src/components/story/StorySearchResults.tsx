import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '../../types';
import { Card } from '../ui';

interface StorySearchResultsProps {
  stories: Story[];
  searchQuery: string;
  onStorySelect: (story: Story) => void;
  selectedStoryId?: string;
  className?: string;
}

const StorySearchResults: React.FC<StorySearchResultsProps> = ({
  stories,
  searchQuery,
  onStorySelect,
  selectedStoryId,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    const lines = content.split('\n').filter(line => line.trim());
    const contentWithoutTitle = lines.slice(1).join(' ');
    return contentWithoutTitle.substring(0, maxLength) + (contentWithoutTitle.length > maxLength ? '...' : '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (stories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No stories found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {searchQuery ? `No stories match "${searchQuery}"` : 'No stories match your current filters'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with view controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
            {searchQuery && (
              <span> for "<span className="font-medium">{searchQuery}</span>"</span>
            )}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {stories.map((story) => (
            <motion.div
              key={story.$id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedStoryId === story.$id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:shadow-md'
                } ${viewMode === 'list' ? 'p-4' : 'p-6'}`}
                onClick={() => onStorySelect(story)}
              >
                <div className={viewMode === 'list' ? 'flex items-start space-x-4' : ''}>
                  {/* Story Image (if available) */}
                  {story.images && story.images.length > 0 && (
                    <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-20 h-20' : 'w-full h-32 mb-4'}`}>
                      <img
                        src={story.images[0]}
                        alt={story.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {highlightText(story.title, searchQuery)}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(story.createdAt)}
                          </span>
                          {story.isPinned && (
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          {story.images && story.images.length > 0 && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {story.images.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className={`text-gray-600 dark:text-gray-400 ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'} mb-3`}>
                      {highlightText(getPreview(story.content, viewMode === 'list' ? 100 : 150), searchQuery)}
                    </p>

                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, viewMode === 'list' ? 2 : 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {highlightText(tag, searchQuery)}
                          </span>
                        ))}
                        {story.tags.length > (viewMode === 'list' ? 2 : 3) && (
                          <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                            +{story.tags.length - (viewMode === 'list' ? 2 : 3)} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StorySearchResults;