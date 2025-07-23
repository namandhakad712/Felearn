import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout';
import { AuthButtons } from '../auth';

interface AuthCTASectionProps {
  title: string;
  subtitle: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const AuthCTASection: React.FC<AuthCTASectionProps> = ({
  title,
  subtitle,
  className = '',
  variant = 'secondary',
}) => {
  // Determine background and text colors based on variant
  const bgColor = variant === 'primary' 
    ? 'bg-indigo-600 dark:bg-indigo-800' 
    : 'bg-white dark:bg-gray-800';
  
  const textColor = variant === 'primary'
    ? 'text-white dark:text-white'
    : 'text-gray-900 dark:text-white';
  
  const subtitleColor = variant === 'primary'
    ? 'text-indigo-100'
    : 'text-gray-600 dark:text-gray-300';
  
  return (
    <section className={`py-16 md:py-24 ${bgColor} ${className}`}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColor}`}>
            {title}
          </h2>
          <p className={`text-xl mb-8 ${subtitleColor} max-w-3xl mx-auto`}>
            {subtitle}
          </p>
          
          <AuthButtons 
            layout="horizontal" 
            showEmail={true} 
            showOAuth={true} 
            size="lg"
          />
          
          {/* Decorative elements */}
          <div className="relative">
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-300 dark:bg-indigo-700 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-300 dark:bg-purple-700 rounded-full opacity-10 blur-3xl"></div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AuthCTASection;