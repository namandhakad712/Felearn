import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // TODO: Implement subscriberService when file exists
      // await subscriberService.subscribe(email, 'footer');
      console.log('Would subscribe email:', email); // Placeholder
      setEmail('');
      setMessage({
        type: 'success',
        text: 'Thank you for subscribing! You\'ll receive updates about new features and stories.'
      });
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage({
        type: 'error',
        text: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Felearn</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered storytelling platform that helps you create captivating narratives with ease.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</Link></li>
              <li><Link to="/faq" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">About</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Stay Updated</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Get the latest updates and stories delivered to your inbox.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </form>
            <div className="mt-6">
              <h5 className="font-semibold mb-2 text-gray-900 dark:text-white text-sm">Legal</h5>
              <ul className="space-y-1">
                <li><Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Terms</Link></li>
                <li><Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Privacy</Link></li>
                <li><Link to="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} Felearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;