import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '../../types';

export interface SearchFilters {
  query: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  status: 'all' | 'pinned' | 'unpinned';
  tags: string[];
  sortBy: 'date' | 'title' | 'length' | 'images';
  sortOrder: 'asc' | 'desc';
  hasImages: 'all' | 'with' | 'without';
}

interface AdvancedSearchFilterProps {
  stories: Story[];
  onFilteredStoriesChange: (filteredStories: Story[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  stories,
  onFilteredStoriesChange,
  onFiltersChange,
  className = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: 'all',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc',
    hasImages: 'all',
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Extract all unique tags from stories
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    stories.forEach(story => {
      story.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [stories]);

  // Filter and sort stories based on current filters
  const filteredStories = useMemo(() => {
    let filtered = [...stories];

    // Text search
    if (filters.query.trim()) {
      const searchTerm = filters.query.toLowerCase().trim();
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm) ||
        story.content.toLowerCase().includes(searchTerm) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(story => new Date(story.createdAt) >= cutoffDate);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(story => 
        filters.status === 'pinned' ? story.isPinned : !story.isPinned
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(story => 
        story.tags && filters.tags.every(tag => story.tags!.includes(tag))
      );
    }

    // Images filter
    if (filters.hasImages !== 'all') {
      filtered = filtered.filter(story => {
        const hasImages = story.images && story.images.length > 0;
        return filters.hasImages === 'with' ? hasImages : !hasImages;
      });
    }

    // Sort stories
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'length':
          comparison = a.content.length - b.content.length;
          break;
        case 'images': {
          const aImages = a.images?.length || 0;
          const bImages = b.images?.length || 0;
          comparison = aImages - bImages;
          break;
        }
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      // Always prioritize pinned stories
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [stories, filters]);

  // Update filtered stories when they change
  useEffect(() => {
    onFilteredStoriesChange(filteredStories);
  }, [filteredStories, onFilteredStoriesChange]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.query.trim() && !searchHistory.includes(filters.query.trim())) {
      setSearchHistory(prev => [filters.query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      dateRange: 'all',
      status: 'all',
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc',
      hasImages: 'all',
    });
  };

  const hasActiveFilters = filters.query || filters.dateRange !== 'all' || 
    filters.status !== 'all' || filters.tags.length > 0 || filters.hasImages !== 'all';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search stories, content, or tags..."
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          className="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {/* Clear search button */}
        {filters.query && (
          <button
            type="button"
            onClick={() => updateFilter('query', '')}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && filters.query === '' && (
        <div className="text-xs">
          <div className="text-gray-500 dark:text-gray-400 mb-2">Recent searches:</div>
          <div className="flex flex-wrap gap-1">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => updateFilter('query', term)}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.dateRange}
          onChange={(e) => updateFilter('dateRange', e.target.value as any)}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as any)}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Stories</option>
          <option value="pinned">Pinned Only</option>
          <option value="unpinned">Unpinned Only</option>
        </select>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            updateFilter('sortBy', sortBy as any);
            updateFilter('sortOrder', sortOrder as any);
          }}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="length-desc">Longest First</option>
          <option value="length-asc">Shortest First</option>
          <option value="images-desc">Most Images</option>
          <option value="images-asc">Least Images</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            isAdvancedOpen || hasActiveFilters
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          Advanced {hasActiveFilters && '•'}
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isAdvancedOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter(t => t !== tag)
                            : [...filters.tags, tag];
                          updateFilter('tags', newTags);
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All Stories' },
                    { value: 'with', label: 'With Images' },
                    { value: 'without', label: 'Without Images' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('hasImages', option.value as any)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        filters.hasImages === option.value
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>
          {filteredStories.length} of {stories.length} stories
          {hasActiveFilters && ' (filtered)'}
        </span>
        {filteredStories.length > 0 && (
          <span>
            Sorted by {filters.sortBy} ({filters.sortOrder === 'desc' ? 'descending' : 'ascending'})
          </span>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;