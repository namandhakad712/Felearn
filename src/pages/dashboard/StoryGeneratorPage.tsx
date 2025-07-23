import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../../components/ui';

const StoryGeneratorPage: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!concept.trim()) return;
    
    setIsGenerating(true);
    // TODO: Implement story generation with Gemini API
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create a New Story
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Enter your story concept and let AI bring it to life with engaging narratives and beautiful imagery.
        </p>
        
        <Card className="mb-8">
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="concept" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Story Concept
              </label>
              <textarea
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={6}
                placeholder="Write a story about a magical cat who can travel through time and helps solve historical mysteries..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {concept.length}/500 characters
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Include images
                  </span>
                </label>
                
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option>Creative</option>
                  <option>Balanced</option>
                  <option>Precise</option>
                </select>
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={!concept.trim() || isGenerating}
                loading={isGenerating}
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Story'}
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Story output area */}
        {isGenerating && (
          <Card>
            <div className="text-center py-12">
              <div className="cat-typing mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Creating your story... This may take a few moments.
              </p>
            </div>
          </Card>
        )}
        
        {/* Recent stories */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} animate className="cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  The Chronos Cat
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Created 2 hours ago
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  In the quiet corner of Mrs. Pemberton's bookshop, where dust motes danced in the afternoon sunlight, sat a peculiar silver-furred cat...
                </p>
                <div className="mt-4 flex justify-end">
                  <Button variant="text" size="sm">
                    View Story
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryGeneratorPage;