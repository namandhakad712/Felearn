import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '../../types';
import AdvancedSearchFilter, { SearchFilters } from './AdvancedSearchFilter';

interface StoryHistorySidebarProps {
  stories: Story[];
  selectedStoryId?: string;
  onStorySelect: (story: Story) => void;
  onStoryRename: (storyId: string, newTitle: string) => void;
  onStoryDelete: (storyId: string) => void;
  onStoryPin: (storyId: string, isPinned: boolean) => void;
  isLoading?: boolean;
}

interface StoryCardProps {
  story: Story;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onPin: (isPinned: boolean) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onPin,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [showActions, setShowActions] = useState(false);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== story.title) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(story.title);
      setIsEditing(false);
    }
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

  const getPreview = (content: string) => {
    // Remove title from content and get first few sentences
    const lines = content.split('\n').filter(line => line.trim());
    const contentWithoutTitle = lines.slice(1).join(' ');
    return contentWithoutTitle.substring(0, 120) + (contentWithoutTitle.length > 120 ? '...' : '');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Pin indicator */}
      {story.isPinned && (
        <div className="absolute top-2 right-2">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* Story title */}
      <div className="mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyPress}
            className="w-full text-sm font-semibold bg-transparent border-b border-indigo-300 dark:border-indigo-600 focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {story.title}
          </h3>
        )}
      </div>

      {/* Story preview */}
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
        {getPreview(story.content)}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatDate(story.createdAt)}</span>
        <div className="flex items-center space-x-2">
          {story.images && story.images.length > 0 && (
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{story.images.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 left-2 flex space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onPin(!story.isPinned)}
              className={`p-1 rounded transition-colors ${
                story.isPinned
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={story.isPinned ? 'Unpin story' : 'Pin story'}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Rename story"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={() => onDelete()}
              className="p-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              title="Delete story"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StoryHistorySidebar: React.FC<StoryHistorySidebarProps> = ({
  stories,
  selectedStoryId,
  onStorySelect,
  onStoryRename,
  onStoryDelete,
  onStoryPin,
  isLoading = false,
}) => {
  const [filteredStories, setFilteredStories] = useState<Story[]>(stories);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);

  const handleFilteredStoriesChange = useCallback((newFilteredStories: Story[]) => {
    setFilteredStories(newFilteredStories);
  }, []);

  const handleFiltersChange = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters);
  }, []);

  if (isLoading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Story History
        </h2>

        {/* Advanced Search and Filter */}
        <AdvancedSearchFilter
          stories={stories}
          onFilteredStoriesChange={handleFilteredStoriesChange}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Story List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <StoryCard
                key={story.$id}
                story={story}
                isSelected={selectedStoryId === story.$id}
                onSelect={() => onStorySelect(story)}
                onRename={(newTitle) => onStoryRename(story.$id, newTitle)}
                onDelete={() => onStoryDelete(story.$id)}
                onPin={(isPinned) => onStoryPin(story.$id, isPinned)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">
                {currentFilters?.query || (currentFilters && (
                  currentFilters.dateRange !== 'all' || 
                  currentFilters.status !== 'all' || 
                  currentFilters.tags.length > 0 || 
                  currentFilters.hasImages !== 'all'
                )) ? 'No stories match your filters' : 'No stories yet'}
              </p>
              <p className="text-xs mt-1">
                {currentFilters?.query || (currentFilters && (
                  currentFilters.dateRange !== 'all' || 
                  currentFilters.status !== 'all' || 
                  currentFilters.tags.length > 0 || 
                  currentFilters.hasImages !== 'all'
                )) ? 'Try adjusting your search or filters' : 'Create your first story to get started'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryHistorySidebar;