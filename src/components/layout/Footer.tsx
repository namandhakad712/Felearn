import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriberService } from '../../services/subscriberService';

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
      await subscriberService.subscribe(email, 'footer');
      setEmail('');
      setMessage({ 
        type: 'success', 
        text: 'Thank you for subscribing! You\'ll rec
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
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Terms</Link></li>
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</Link></li>
              <li><Link to="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Cookies</Link></li>
            </ul>
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