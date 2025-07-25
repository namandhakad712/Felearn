import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserTheme } from '../hooks/useUserTheme';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Apply user's theme preference automatically
  useUserTheme();

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user?.geminiKey) return;
    
    setIsGenerating(true);
    try {
      // Simple story generation without complex components
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: user.geminiKey });
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const result = await model.generateContent(
        prompt + "\n\nExplain this using a fun story about tiny cats as a metaphor. Keep it engaging and educational."
      );
      
      setStory(result.response.text());
    } catch (error) {
      console.error('Story generation error:', error);
      setStory('Error generating story. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Felearn</h1>
              
              {/* Simple Story Generator */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Generate AI Story</h2>
                <form onSubmit={handleGenerateStory}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Explain how neural networks work..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    maxLength={1000}
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">Max 1000 characters</span>
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Story'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Story Display */}
              {story && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Generated Story</h3>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{story}</div>
                  </div>
                  <button
                    onClick={() => {
                      setStory('');
                      setPrompt('');
                    }}
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    New Story
                  </button>
                </div>
              )}
            </div>
          } />
          
          <Route path="/settings" element={
            <div>
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4">Profile Settings</h3>
                <p className="text-gray-600">Settings page - simplified version</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;