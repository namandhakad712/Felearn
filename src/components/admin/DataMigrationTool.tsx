import React, { useState } from 'react';
import DataMigration from '../../utils/dataMigration';
import DataTransformation from '../../utils/dataTransformation';

interface MigrationResults {
  users?: {
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  };
  stories?: {
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  };
}

/**
 * Data Migration Tool Component
 * Provides a UI for migrating data from Firebase to Appwrite
 */
const DataMigrationTool: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<MigrationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firebaseData, setFirebaseData] = useState<{
    users?: any[];
    stories?: any[];
  } | null>(null);

  /**
   * Handle file upload for Firebase data
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'users' | 'stories') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setFirebaseData(prev => ({
          ...prev,
          [type]: data
        }));
        setError(null);
      } catch (err) {
        setError(`Failed to parse ${type} JSON file: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Start migration process
   */
  const startMigration = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const migrationResults: MigrationResults = {};

      // Migrate users if available
      if (firebaseData?.users?.length) {
        // Transform Firebase data to Appwrite format
        const transformedUsers = firebaseData.users.map(user => 
          DataTransformation.convertFirebaseToAppwrite(user)
        );
        
        // Migrate users
        migrationResults.users = await DataMigration.migrateUsers(transformedUsers);
      }

      // Migrate stories if available
      if (firebaseData?.stories?.length) {
        // Transform Firebase data to Appwrite format
        const transformedStories = firebaseData.stories.map(story => 
          DataTransformation.convertFirebaseToAppwrite(story)
        );
        
        // Migrate stories
        migrationResults.stories = await DataMigration.migrateStories(transformedStories);
      }

      setResults(migrationResults);
    } catch (err) {
      setError(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Firebase to Appwrite Data Migration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Step 1: Upload Firebase Data</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Users JSON File:</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'users')}
              className="border p-2 w-full"
              disabled={isLoading}
            />
            {firebaseData?.users && (
              <p className="text-sm text-green-600 mt-1">
                Loaded {firebaseData.users.length} users
              </p>
            )}
          </div>
          
          <div>
            <label className="block mb-1">Stories JSON File:</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'stories')}
              className="border p-2 w-full"
              disabled={isLoading}
            />
            {firebaseData?.stories && (
              <p className="text-sm text-green-600 mt-1">
                Loaded {firebaseData.stories.length} stories
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Step 2: Start Migration</h3>
        <button
          onClick={startMigration}
          disabled={isLoading || (!firebaseData?.users && !firebaseData?.stories)}
          className={`px-4 py-2 rounded ${
            isLoading || (!firebaseData?.users && !firebaseData?.stories)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Migrating...' : 'Start Migration'}
        </button>
      </div>
      
      {results && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Migration Results</h3>
          
          {results.users && (
            <div className="mb-4">
              <h4 className="font-medium">Users:</h4>
              <ul className="list-disc pl-5">
                <li>Total: {results.users.total}</li>
                <li className="text-green-600">Successful: {results.users.successful}</li>
                <li className="text-red-600">Failed: {results.users.failed}</li>
              </ul>
              
              {results.users.errors.length > 0 && (
                <div className="mt-2">
                  <h5 className="font-medium">Errors:</h5>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                    <pre className="text-xs">{JSON.stringify(results.users.errors, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {results.stories && (
            <div>
              <h4 className="font-medium">Stories:</h4>
              <ul className="list-disc pl-5">
                <li>Total: {results.stories.total}</li>
                <li className="text-green-600">Successful: {results.stories.successful}</li>
                <li className="text-red-600">Failed: {results.stories.failed}</li>
              </ul>
              
              {results.stories.errors.length > 0 && (
                <div className="mt-2">
                  <h5 className="font-medium">Errors:</h5>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                    <pre className="text-xs">{JSON.stringify(results.stories.errors, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p className="mb-1">Note: This tool migrates data from Firebase to Appwrite.</p>
        <p>Make sure you have the correct permissions and have set up the Appwrite collections before migration.</p>
      </div>
    </div>
  );
};

export default DataMigrationTool;