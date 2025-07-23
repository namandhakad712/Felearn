import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Modal } from '../../components/ui';
import { storyService } from '../../services';
import { Story } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';

const StoryLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned'>('all');
  
  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [storyToRename, setStoryToRename] = useState<Story | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  // Story detail view modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const result = await storyService.getUserStories(user.$id);
        setStories(result.stories);
        setError(null);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStories();
  }, [user]);

  const filteredStories = stories
    .filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           story.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || (filterBy === 'pinned' && story.isPinned);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  
  const togglePin = async (storyId: string, isPinned: boolean) => {
    try {
      // Optimistic update
      setStories(stories.map(story => 
        story.$id === storyId ? { ...story, isPinned: !isPinned } : story
      ));
      
      // Update in database
      await storyService.togglePinStatus(storyId, !isPinned);
      toast.success(isPinned ? 'Story unpinned' : 'Story pinned');
    } catch (err) {
      console.error('Error toggling pin status:', err);
      // Revert optimistic update
      setStories(stories.map(story => 
        story.$id === storyId ? { ...story, isPinned } : story
      ));
      toast.error('Failed to update story');
    }
  };
  
  const deleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Optimistic update
      setStories(stories.filter(story => story.$id !== storyId));
      
      // Delete from database
      await storyService.deleteStory(storyId);
      toast.success('Story deleted');
    } catch (err) {
      console.error('Error deleting story:', err);
      // Fetch stories again to restore state
      if (user) {
        const result = await storyService.getUserStories(user.$id);
        setStories(result.stories);
      }
      toast.error('Failed to delete story');
    }
  };
  
  const openRenameModal = (story: Story) => {
    setStoryToRename(story);
    setNewTitle(story.title);
    setIsRenameModalOpen(true);
  };
  
  const openDetailModal = (story: Story) => {
    setSelectedStory(story);
    setIsDetailModalOpen(true);
  };
  
  const handleRename = async () => {
    if (!storyToRename || !newTitle.trim() || newTitle === storyToRename.title) {
      setIsRenameModalOpen(false);
      return;
    }
    
    try {
      // Optimistic update
      setStories(stories.map(story => 
        story.$id === storyToRename.$id ? { ...story, title: newTitle } : story
      ));
      
      // Update in database
      await storyService.updateStory(storyToRename.$id, { title: newTitle });
      toast.success('Story renamed');
    } catch (err) {
      console.error('Error renaming story:', err);
      // Revert optimistic update
      setStories(stories.map(story => 
        story.$id === storyToRename.$id ? { ...story, title: storyToRename.title } : story
      ));
      toast.error('Failed to rename story');
    } finally {
      setIsRenameModalOpen(false);
      setStoryToRename(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Rename Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Story"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="newTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Title
            </label>
            <input
              type="text"
              id="newTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter new title"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRename} disabled={!newTitle.trim() || newTitle === storyToRename?.title}>
              Rename
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Story Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedStory?.title || "Story Details"}
        size="lg"
      >
        {selectedStory && (
          <div className="space-y-6">
            {/* Story metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Created: {formatDate(selectedStory.createdAt)}</span>
              {selectedStory.isPinned && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4zm3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H18v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                  </svg>
                  Pinned
                </span>
              )}
            </div>
            
            {/* Story content */}
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: marked(selectedStory.content) }} />
            </div>
            
            {/* Story images */}
            {selectedStory.images && selectedStory.images.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Story Images
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {selectedStory.images.map((imageUrl, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={imageUrl} 
                        alt={`Story image ${idx + 1}`} 
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          // Fallback for broken images
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                        }}
                      />
                      <div className="p-3 bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Image {idx + 1} of {selectedStory.images.length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {selectedStory.tags && selectedStory.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openRenameModal(selectedStory);
                }}
              >
                Rename
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Stories
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and organize your AI-generated stories
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button to="/dashboard" variant="primary">
              Create New Story
            </Button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'pinned')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Stories</option>
                <option value="pinned">Pinned Only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredStories.length} stories
              </span>
            </div>
          </div>
        </Card>
        
        {/* Stories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-64">
                <div className="animate-pulse h-full flex flex-col">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Error Loading Stories
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        ) : filteredStories.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first story to get started.'}
              </p>
              <Button to="/dashboard" variant="primary">
                Create Your First Story
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  animate 
                  className="h-full flex flex-col cursor-pointer"
                  onClick={() => openDetailModal(story)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                      {story.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        togglePin(story.$id, story.isPinned);
                      }}
                      className={`ml-2 p-1 rounded ${
                        story.isPinned
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4zm3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H18v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {formatDate(story.createdAt)}
                  </p>
                  
                  {/* Story content */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-4 flex-1 mb-4">
                    {story.content}
                  </p>
                  
                  {/* Story images preview */}
                  {story.images && story.images.length > 0 && (
                    <div className="mb-4 flex overflow-x-auto space-x-2 pb-2">
                      {story.images.slice(0, 3).map((imageUrl, idx) => (
                        <div key={idx} className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img 
                            src={imageUrl} 
                            alt={`Story image ${idx + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback for broken images
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Image';
                            }}
                          />
                        </div>
                      ))}
                      {story.images.length > 3 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <span className="text-sm text-gray-500 dark:text-gray-400">+{story.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags && story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Button 
                        variant="text" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          openDetailModal(story);
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="text" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          openRenameModal(story);
                        }}
                      >
                        Rename
                      </Button>
                      <Button 
                        variant="text" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()} // Prevent card click event
                      >
                        Export
                      </Button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        deleteStory(story.$id);
                      }}
                      className="text-red-500 hover:text-red-600 p-1"
                      aria-label="Delete story"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StoryLibraryPage;