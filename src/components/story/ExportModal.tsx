import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story, StorySlide } from '../../types';
import { exportService, ExportFormat } from '../../services/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: Story;
  stories?: Story[];
  slides?: StorySlide[];
  onExportComplete: (format: ExportFormat) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  story,
  stories,
  slides = [],
  onExportComplete,
}) => {
  const [includeImages, _setIncludeImages] = useState(true);
  const [includeMetadata, _setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isMultipleStories = stories && stories.length > 1;
  const exportTarget = isMultipleStories ? stories : story;
  const targetTitle = isMultipleStories 
    ? `${stories.length} stories` 
    : story?.title || 'story';

  const handleExport = async () => {
    if (!exportTarget) return;

    // Starting export process

    setIsExporting(true);
    setExportError(null);

    try {
      const options = {
        includeImages,
        includeMetadata,
        fontSize: 12,
        pageMargin: 20,
      };

      if (isMultipleStories && stories) {
        await exportService.exportMultipleStories(stories, 'pdf', options);
      } else if (story) {
        await exportService.exportStory(story, 'pdf', options, slides);
      }

      onExportComplete('pdf');
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      setExportError(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -50 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto mt-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export {targetTitle}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Export your story as a PDF document
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  key="pdf"
                  onClick={() => onExportComplete('pdf')}
                  className="p-3 rounded-lg border-2 transition-all border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <div className="flex items-center space-x-2">
                    <div className="text-indigo-600 dark:text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">
                        PDF
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Standard PDF export
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Details Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              𝕰𝖝𝖕𝖔𝖗𝖙 𝕯𝖊𝖙𝖆𝖎𝖑𝖘 ⇓
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Format: Portable Document Format</div>
                <div>Content: {isMultipleStories ? `${stories.length} stories` : '1 story'}</div>
                <div>Images: Included</div>
                <div>File Size: ≃ 2-7 MB</div>
              </div>
            </div>

            {/* Error Message */}
            {exportError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Export Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {exportError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !exportTarget}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;