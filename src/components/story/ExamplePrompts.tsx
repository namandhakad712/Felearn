import React from 'react';

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelectPrompt }) => {
  const examples = [
    'Explain thermodynamics properties.',
    'How does a solar panel work?',
    'What is neural network of AI.',
  ];

  return (
    <div className="mb-6">
      <p className="text-gray-600 dark:text-gray-400 mb-2">Examples:</p>
      <ul className="list-none p-0 cursor-pointer space-y-2">
        {examples.map((example, index) => (
          <li
            key={index}
            onClick={() => onSelectPrompt(example)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {example}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamplePrompts;