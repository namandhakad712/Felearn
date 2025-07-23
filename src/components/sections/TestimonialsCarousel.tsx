import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout';
import { Carousel, Card } from '../ui';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  initials?: string;
}

interface TestimonialsCarouselProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  title,
  subtitle,
  testimonials,
}) => {
  return (
    <section className="py-16 md:py-24 gradient-bg">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <Carousel
            autoPlay={true}
            interval={6000}
            showControls={true}
            showIndicators={true}
            className="h-full"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Carousel>
        </div>
      </Container>
    </section>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <Card className="mx-4 md:mx-8 my-8 overflow-visible">
      {/* Decorative quote mark */}
      <div className="absolute -top-6 left-8 text-6xl text-indigo-300 dark:text-indigo-700 opacity-50">
        "
      </div>
      
      <div className="pt-6 px-6 pb-8">
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 relative z-10">
          "{testimonial.content}"
        </p>
        
        <div className="flex items-center">
          {testimonial.avatar ? (
            <img 
              src={testimonial.avatar} 
              alt={testimonial.name}
              className="h-12 w-12 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <span className="text-indigo-600 font-bold">
                {testimonial.initials || testimonial.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialsCarousel;