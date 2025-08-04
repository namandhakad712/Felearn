import React from 'react';
import { motion } from 'framer-motion';
import { PageLayout, Container, Grid } from '../components/layout';
import { Card } from '../components/ui';
import { HeroSection, TestimonialsCarousel, CTASection, AuthCTASection } from '../components/sections';
import { testimonials } from '../data/testimonials';

const LandingPage: React.FC = () => {
  return (
    <PageLayout transparentHeader={true}>
      <div className="min-h-screen gradient-bg">
        {/* Hero Section */}
        <HeroSection
          title="Bring your stories to life with AI"
          subtitle="Create captivating stories with the power of Google Gemini AI. Transform your ideas into beautifully crafted narratives with just a few clicks."
          ctaText="Start for Free"
          ctaLink="/auth/signup"
          secondaryCtaText="Watch Demo"
          secondaryCtaLink="#demo"
        />

        {/* Auth CTA Section */}
        <AuthCTASection
          title="Choose how you want to get started"
          subtitle="Sign up with your email or use your Google or GitHub account for quick access."
          variant="secondary"
        />
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Creative content at the speed of light
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Skip the blank page, create brilliance in a flash with our AI-powered storytelling platform.
              </p>
            </motion.div>
            
            <Grid cols={{ default: 1, md: 3 }} gap={8}>
              {/* Feature 1 */}
              <Card
                animate
                className="transform transition-all duration-500"
              >
                <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Stories</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate captivating stories with Google Gemini AI. Just provide a concept, and watch as your ideas transform into engaging narratives.
                </p>
              </Card>
              
              {/* Feature 2 */}
              <Card
                animate
                className="transform transition-all duration-500"
              >
                <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Visual Storytelling</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enhance your stories with AI-generated images that bring your narratives to life, creating a complete visual storytelling experience.
                </p>
              </Card>
              
              {/* Feature 3 */}
              <Card
                animate
                className="transform transition-all duration-500"
              >
                <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Easy Export</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export your stories as PDF or JSON files to share with others or integrate into other platforms and applications.
                </p>
              </Card>
            </Grid>
          </Container>
        </section>

        {/* Testimonials Section */}
        <TestimonialsCarousel
          title="What our users are saying"
          subtitle="Join thousands of storytellers who are already creating amazing content with our platform."
          testimonials={testimonials}
        />

        {/* CTA Section */}
        <CTASection
          title="Ready to start your creative journey?"
          subtitle="Join thousands of storytellers who are already creating amazing content with our AI-powered platform."
          buttonText="Get Started for Free"
          buttonLink="/auth/signup"
          variant="primary"
        />
      </div>
    </PageLayout>
  );
};

export default LandingPage;