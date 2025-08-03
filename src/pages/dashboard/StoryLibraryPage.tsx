import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, Button, Modal, ToastContainer } from '../../components/ui';
import { StoryViewModes, ExportModal } from '../../components/story';
import { storyService } from '../../services';
import { Story } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks';
import { createStoryFallbackImage } from '../../utils/imageUrlFixer';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

const StoryLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast, toasts, removeToast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  
  // GSAP refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [storyToRename, setStoryToRename] = useState<Story | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Story detail view modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Story view modes state
  const [isViewModesOpen, setIsViewModesOpen] = useState(false);
  const [storyToView, setStoryToView] = useState<Story | null>(null);

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [storyToExport, setStoryToExport] = useState<Story | null>(null);



  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[id^="menu-"]') && !target.closest('button[aria-label="Story options"]')) {
        // Close all open menus
        document.querySelectorAll('[id^="menu-"]').forEach(menu => {
          menu.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      if (!user) {
        // No user found, cannot fetch stories
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        // Fetching stories for user

        const result = await storyService.getUserStories(user.$id);
        console.log('✅ Stories fetch result:', result);
        console.log('✅ Stories fetched successfully:', {
          count: result.stories.length,
          total: result.total,
          stories: result.stories.map(s => ({
            id: s.$id,
            title: s.title,
            imagesCount: s.images?.length || 0,
            slidesCount: s.slides?.length || 0,
            createdAt: s.createdAt,
            hasImages: !!(s.images && s.images.length > 0),
            firstImage: s.images?.[0]?.substring(0, 50) + '...' || 'No image'
          }))
        });

        if (result.stories.length === 0) {
          // No stories found for user
        }

        setStories(result.stories);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching stories:', err);
        console.error('❌ Error details:', {
          message: err.message,
          code: err.code,
          type: err.type,
          stack: err.stack
        });
        setError(`Failed to load stories: ${err.message || 'Unknown error'}. Please try again later.`);
        setStories([]); // Clear stories on error
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

  // 🎭 GSAP ANIMATIONS! 
  useGSAP(() => {
    // Header is now visible immediately without entrance animation

    // Cards are now visible immediately without bouncy entrance animation
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.story-card');

      // 🔥 HOVER ANIMATIONS FOR CARDS
      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        
        cardElement.addEventListener('mouseenter', () => {
          gsap.to(cardElement, {
            scale: 1.08,
            y: -15,
            rotationY: 8,
            boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.5)",
            duration: 0.15,
            ease: "power3.out"
          });
        });

        cardElement.addEventListener('mouseleave', () => {
          gsap.to(cardElement, {
            scale: 1,
            y: 0,
            rotationY: 0,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            duration: 0.12,
            ease: "power3.out"
          });
        });
      });
    }

    // 🌟 SEARCH BAR ANIMATION
    if (isSearchBarVisible) {
      gsap.fromTo('.search-bar-container',
        {
          opacity: 0,
          height: 0,
          y: -20,
          scale: 0.95
        },
        {
          opacity: 1,
          height: 'auto',
          y: 0,
          scale: 1,
          duration: 0.15,
          ease: "back.out(2.5)"
        }
      );
    }

  }, { dependencies: [filteredStories, isSearchBarVisible], scope: containerRef });

  const togglePin = async (storyId: string, isPinned: boolean) => {
    try {
      // Optimistic update
      setStories(stories.map(story =>
        story.$id === storyId ? { ...story, isPinned: !isPinned } : story
      ));

      // Update in database
      await storyService.togglePinStatus(storyId, !isPinned);
      showSuccessToast('Success', isPinned ? 'Story unpinned' : 'Story pinned');
    } catch (err) {
      console.error('Error toggling pin status:', err);
      // Revert optimistic update
      setStories(stories.map(story =>
        story.$id === storyId ? { ...story, isPinned } : story
      ));
      showErrorToast('Error', 'Failed to update story');
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
      showSuccessToast('Success', 'Story deleted');
    } catch (err) {
      console.error('Error deleting story:', err);
      // Fetch stories again to restore state
      if (user) {
        const result = await storyService.getUserStories(user.$id);
        setStories(result.stories);
      }
      showErrorToast('Error', 'Failed to delete story');
    }
  };

  const openRenameModal = (story: Story) => {
    setStoryToRename(story);
    setNewTitle(story.title);
    setIsRenameModalOpen(true);
  };

  const _openDetailModal = (story: Story) => {
    console.log('Opening story detail modal:', {
      title: story.title,
      imagesCount: story.images?.length || 0,
      images: story.images?.map(img => img.substring(0, 50) + '...') || [],
      slides: story.slides?.length || 0
    });
    setSelectedStory(story);
    setIsDetailModalOpen(true);
  };

  const openViewModes = (story: Story) => {
    console.log('Opening story view modes:', {
      title: story.title,
      slidesCount: story.slides?.length || 0
    });
    setStoryToView(story);
    setIsViewModesOpen(true);
    // Scroll to top to ensure modal is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openExportModal = (story: Story) => {
    console.log('Opening export modal for story:', {
      title: story.title,
      slidesCount: story.slides?.length || 0,
      slides: story.slides,
      imagesCount: story.images?.length || 0
    });
    setStoryToExport(story);
    setIsExportModalOpen(true);
  };

  const handleExportComplete = (format: string) => {
    showSuccessToast('Export Complete', `Story exported as ${format.toUpperCase()}`);
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
      showSuccessToast('Success', 'Story renamed');
    } catch (err) {
      console.error('Error renaming story:', err);
      // Revert optimistic update
      setStories(stories.map(story =>
        story.$id === storyToRename.$id ? { ...story, title: storyToRename.title } : story
      ));
      showErrorToast('Error', 'Failed to rename story');
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
    <div ref={containerRef} className="p-6 max-w-7xl mx-auto">
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
                    <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4zm3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H18v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z" />
                  </svg>
                  Pinned
                </span>
              )}
            </div>

            {/* Story content */}
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedStory.content }} />
            </div>

            {/* Story Slides with enhanced display */}
            {selectedStory.images && selectedStory.images.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Story Slides ({selectedStory.images.length})
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Click any slide to view full size
                  </div>
                </div>

                {/* Slides Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedStory.images.map((imageUrl, idx) => (
                    <div key={idx} className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {/* Image Section */}
                      <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-gray-700">
                        <img
                          src={imageUrl}
                          alt={`Slide ${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-150"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onLoad={(e) => {
                            console.log(`Modal slide ${idx + 1} loaded successfully`);
                          }}
                          onError={(e) => {
                            console.error(`Modal slide ${idx + 1} failed to load:`, imageUrl.substring(0, 50) + '...');
                            (e.target as HTMLImageElement).src = createStoryFallbackImage(selectedStory.title, idx + 1, 800, 600);
                            (e.target as HTMLImageElement).alt = `Slide ${idx + 1} unavailable`;
                          }}
                        />

                        {/* Slide Number Badge */}
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          {idx + 1} / {selectedStory.images.length}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-15 transition-all duration-100 flex items-center justify-center cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}>
                          <div className="opacity-0 hover:opacity-100 transition-opacity duration-100 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-full text-sm font-medium transform hover:scale-105">
                            View Full Size
                          </div>
                        </div>
                      </div>

                      {/* Caption Section - Below Image */}
                      <div className="p-8 bg-white dark:bg-gray-800">
                        {selectedStory.slides && selectedStory.slides[idx] && selectedStory.slides[idx].text ? (
                          <p className="story-caption text-gray-800 dark:text-gray-200">
                            {selectedStory.slides[idx].text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()}
                          </p>
                        ) : (
                          <p className="indie-flower text-gray-500 dark:text-gray-400 text-lg text-center italic">
                            AI-generated illustration
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* No images fallback */
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  This story doesn't have any images
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Images are generated automatically for new stories
                </p>
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

      <div ref={headerRef}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Stories
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and organize your AI-generated stories
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsSearchBarVisible(!isSearchBarVisible);
                if (!isSearchBarVisible) {
                  // Auto-expand search when opening
                  setTimeout(() => setIsSearchExpanded(true), 100);
                }
              }}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </Button>
            
            <Button to="/dashboard" variant="primary">
              Create New Story
            </Button>
          </div>
        </div>

        {/* Collapsible Search/Filter Bar */}
        {isSearchBarVisible && (
          <div className="search-bar-container bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 overflow-hidden mb-8">
            <div className="flex items-center justify-between space-x-4">
              {/* Left: Search Input */}
              <div className="flex-shrink-0">
                <div className={`flex items-center transition-all duration-200 ease-out ${
                  isSearchExpanded || searchTerm ? 'w-64 sm:w-80' : 'w-10'
                }`}>
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search stories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchExpanded(true)}
                      onBlur={() => {
                        if (!searchTerm) {
                          setIsSearchExpanded(false);
                        }
                      }}
                      className={`transition-all duration-200 ease-out h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                        isSearchExpanded || searchTerm
                          ? 'pl-10 pr-4 w-full opacity-100'
                          : 'pl-10 pr-4 w-0 opacity-0'
                      }`}
                      autoFocus={isSearchBarVisible}
                    />
                    <button
                      onClick={() => {
                        if (searchTerm) {
                          setSearchTerm('');
                          setIsSearchExpanded(false);
                        } else {
                          setIsSearchExpanded(true);
                          setTimeout(() => {
                            const input = document.querySelector('input[placeholder="Search stories..."]') as HTMLInputElement;
                            if (input) input.focus();
                          }, 100);
                        }
                      }}
                      className={`absolute left-0 top-0 h-full flex items-center justify-center transition-all duration-150 z-10 ${
                        isSearchExpanded || searchTerm
                          ? 'w-10 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-600 rounded-l-lg'
                          : 'w-10 h-10 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm'
                      }`}
                      title={searchTerm ? 'Clear search' : 'Search stories'}
                    >
                      {searchTerm ? (
                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Center: Filter Dropdown */}
              <div className="flex-1 max-w-xs">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as 'all' | 'pinned')}
                  className="w-full h-10 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Stories</option>
                  <option value="pinned">Pinned Only</option>
                </select>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex-1 max-w-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                  className="w-full h-10 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>

              {/* Far Right: Story Count & Close Button */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {filteredStories.length} stories
                </span>
                <button
                  onClick={() => {
                    setIsSearchBarVisible(false);
                    setIsSearchExpanded(false);
                    setSearchTerm('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-100 hover:scale-110"
                  title="Close search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

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
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <div key={story.$id} className="story-card">
                <Card
                  animate
                  className="h-full flex flex-col cursor-pointer relative transform-gpu"
                  onClick={() => openViewModes(story)}
                >
                  {/* 3-Dot Menu in top-left corner */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const menuId = `menu-${story.$id}`;
                          const menu = document.getElementById(menuId);
                          if (menu) {
                            menu.classList.toggle('hidden');
                          }
                        }}
                        className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-100 hover:scale-110 hover:shadow-xl"
                        aria-label="Story options"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div
                        id={`menu-${story.$id}`}
                        className="hidden absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`menu-${story.$id}`)?.classList.add('hidden');
                            openExportModal(story);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`menu-${story.$id}`)?.classList.add('hidden');
                            openRenameModal(story);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Rename
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`menu-${story.$id}`)?.classList.add('hidden');
                            deleteStory(story.$id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pin button in top-right corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(story.$id, story.isPinned);
                      }}
                      className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-100 hover:scale-110 hover:shadow-xl ${story.isPinned
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-gray-500'
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4zm3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H18v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-3 pt-12">
                    <h3 className="font-dosis font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                      {story.title}
                    </h3>
                  </div>

                  <p className="font-ubuntu-light text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {formatDate(story.createdAt)}
                  </p>

                  {/* First Image Preview - Large */}
                  {story.images && story.images.length > 0 && (
                    <div className="mb-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 group">
                        <img
                          src={story.images[0]}
                          alt={`${story.title} - Preview`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-150"
                          onLoad={(e) => {
                            console.log(`Preview image loaded successfully:`, story.images[0].substring(0, 50) + '...');
                            // Show green indicator for successful load
                            const indicator = document.getElementById(`status-${story.$id}`);
                            if (indicator) {
                              indicator.className = 'w-2 h-2 rounded-full bg-green-500 opacity-100';
                            }
                          }}
                          onError={(e) => {
                            console.error(`Preview image failed to load:`, story.images[0].substring(0, 50) + '...');
                            (e.target as HTMLImageElement).src = createStoryFallbackImage(story.title, undefined, 400, 200);
                            (e.target as HTMLImageElement).alt = 'Story preview unavailable';
                            // Show red indicator for failed load
                            const indicator = document.getElementById(`status-${story.$id}`);
                            if (indicator) {
                              indicator.className = 'w-2 h-2 rounded-full bg-red-500 opacity-100';
                            }
                          }}
                        />

                        {/* Image count overlay */}
                        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {story.images.length}
                        </div>

                        {/* Image status indicator */}
                        <div className="absolute top-3 left-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 opacity-0" id={`status-${story.$id}`}></div>
                        </div>

                        {/* Click to view overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-all duration-150 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transform group-hover:scale-105">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>View Story</span>
                          </div>
                        </div>
                      </div>

                      {/* First slide caption if available */}
                      {story.slides && story.slides[0] && story.slides[0].text && (
                        <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="indie-flower text-gray-700 dark:text-gray-300 text-sm text-center">
                            {story.slides[0].text.replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}




                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story View Modes Modal */}
      {isViewModesOpen && storyToView && (
        <StoryViewModes
          story={storyToView}
          onClose={() => {
            setIsViewModesOpen(false);
            setStoryToView(null);
          }}
        />
      )}

      {/* Export Modal */}
      {isExportModalOpen && storyToExport && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
            setStoryToExport(null);
          }}
          story={storyToExport}
          slides={storyToExport.slides || []}
          onExportComplete={handleExportComplete}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default StoryLibraryPage;