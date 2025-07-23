import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './';

interface WizardStep {
  id: string;
  title: string;
  content: ReactNode;
  isOptional?: boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  initialStep?: number;
  className?: string;
}

const Wizard: React.FC<WizardProps> = ({
  steps,
  onComplete,
  onCancel,
  initialStep = 0,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const goToNextStep = () => {
    if (isLastStep) {
      onComplete();
      return;
    }
    
    setDirection(1);
    setCompletedSteps([...completedSteps, currentStep.id]);
    setCurrentStepIndex(currentStepIndex + 1);
  };
  
  const goToPreviousStep = () => {
    if (isFirstStep) {
      onCancel?.();
      return;
    }
    
    setDirection(-1);
    setCurrentStepIndex(currentStepIndex - 1);
  };
  
  const goToStep = (index: number) => {
    if (index < currentStepIndex) {
      setDirection(-1);
      setCurrentStepIndex(index);
    } else if (completedSteps.includes(steps[index].id) || index === currentStepIndex) {
      setDirection(1);
      setCurrentStepIndex(index);
    }
  };
  
  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* Progress indicator */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <button
                onClick={() => goToStep(index)}
                disabled={!completedSteps.includes(step.id) && index !== currentStepIndex}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                } ${
                  (completedSteps.includes(step.id) || index === currentStepIndex)
                    ? 'cursor-pointer hover:opacity-90'
                    : 'cursor-not-allowed'
                }`}
              >
                {index < currentStepIndex ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                {step.title}
                {step.isOptional && <span className="text-xs ml-1">(Optional)</span>}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="relative h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
          <motion.div
            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
            initial={{ width: `${(initialStep / (steps.length - 1)) * 100}%` }}
            animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Step content */}
      <div className="px-6 py-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {currentStep.content}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation buttons */}
      <div className="px-6 pb-6 flex justify-between">
        <Button
          variant="secondary"
          onClick={goToPreviousStep}
        >
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>
        
        <Button
          variant="primary"
          onClick={goToNextStep}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default Wizard;