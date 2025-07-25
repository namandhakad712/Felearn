import React, { useEffect, useState } from 'react';

const ImportTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing imports...');
  const [error, setError] = useState<string | null>(null);
  const [imports, setImports] = useState<Record<string, any>>({});

  useEffect(() => {
    const testImports = async () => {
      try {
        // Test importing from @google/generative-ai
        const genaiModule = await import('@google/generative-ai');
        const { GoogleGenerativeAI } = genaiModule;
        
        // Check if the imported classes are functions/objects
        const importDetails = {
          genai: Object.keys(genaiModule),
          GoogleGenAI: typeof GoogleGenAI,
          Modality: typeof Modality,
          availableModels: Modality ? Object.keys(Modality).join(', ') : 'Not available'
        };
        
        setImports(importDetails);
        setStatus('Imports successful!');
        
        // Test creating a client (without making API calls)
        try {
          // Just test instantiation, don't make actual API calls
          const dummyKey = 'dummy-key-for-testing';
          const ai = new GoogleGenAI({apiKey: dummyKey});
          setImports(prev => ({ 
            ...prev, 
            clientCreation: 'Success',
            clientMethods: Object.keys(ai).join(', ')
          }));
        } catch (clientErr) {
          setImports(prev => ({ 
            ...prev, 
            clientCreation: 'Failed',
            clientError: (clientErr as Error).message
          }));
        }
      } catch (err) {
        setError((err as Error).message);
        setStatus('Import failed');
      }
    };

    testImports();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Import Test</h2>
      <p className={`font-medium ${error ? 'text-red-500' : 'text-green-500'}`}>
        Status: {status}
      </p>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 font-medium">Error:</p>
          <pre className="text-red-600 text-sm mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {Object.keys(imports).length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Available Imports:</h3>
          <ul className="space-y-1">
            {Object.entries(imports).map(([lib, exports]) => (
              <li key={lib} className="text-sm">
                <span className="font-medium">{lib}:</span>{' '}
                {Array.isArray(exports) ? exports.join(', ') : String(exports)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportTest;