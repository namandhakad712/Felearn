import { ID } from 'appwrite';
import { databaseService } from '../services';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { DataTransformation } from './dataTransformation';
import fs from 'fs';
import path from 'path';

/**
 * Appwrite Data Import Utility
 * Handles importing data from Firebase exports into Appwrite
 */
export class AppwriteDataImport {
  /**
   * Import users from a Firebase export file into Appwrite
   * @param inputFilePath Path to the Firebase users export JSON file
   * @returns Promise with import results
   */
  static async importUsers(inputFilePath: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  }> {
    try {
      console.log(`Starting user import from ${inputFilePath}...`);
      
      // Read the exported users file
      const fileContent = fs.readFileSync(inputFilePath, 'utf8');
      const firebaseUsers = JSON.parse(fileContent);
      
      const results = {
        total: firebaseUsers.length,
        successful: 0,
        failed: 0,
        errors: [] as any[]
      };
      
      // Process each user
      for (const firebaseUser of firebaseUsers) {
        try {
          // Validate and transform the user data
          const appwriteUser = DataTransformation.validateUserData({
            $id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            createdAt: DataTransformation.convertFirebaseTimestamp(firebaseUser.metadata?.creationTime),
            lastLogin: DataTransformation.convertFirebaseTimestamp(firebaseUser.metadata?.lastSignInTime),
            emailVerification: firebaseUser.emailVerified,
            disabled: firebaseUser.disabled,
            // Extract OAuth provider if available
            oauthProvider: firebaseUser.providerData && firebaseUser.providerData.length > 0 
              ? firebaseUser.providerData[0].providerId.replace('.com', '') 
              : undefined,
            // Default settings
            settings: {
              theme: 'light',
              language: 'en',
              onboardingCompleted: true // Assume completed for migrated users
            },
            geminiKey: ''
          });
          
          // Create user document in Appwrite
          await databaseService.createDocument(
            APPWRITE_CONFIG.collections.users,
            appwriteUser,
            appwriteUser.$id || ID.unique()
          );
          
          results.successful++;
        } catch (error) {
          console.error(`Failed to import user ${firebaseUser.uid || 'unknown'}:`, error);
          results.failed++;
          results.errors.push({
            userId: firebaseUser.uid || 'unknown',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      console.log(`User import completed: ${results.successful} successful, ${results.failed} failed`);
      return results;
    } catch (error) {
      console.error('Error importing users:', error);
      throw new Error(`Failed to import users: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Import collection data from a Firebase export file into Appwrite
   * @param collectionId Appwrite collection ID to import into
   * @param inputFilePath Path to the Firebase collection export JSON file
   * @returns Promise with import results
   */
  static async importCollection(
    collectionId: string,
    inputFilePath: string
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  }> {
    try {
      console.log(`Starting collection import to "${collectionId}" from ${inputFilePath}...`);
      
      // Read the exported collection file
      const fileContent = fs.readFileSync(inputFilePath, 'utf8');
      const documents = JSON.parse(fileContent);
      
      const results = {
        total: documents.length,
        successful: 0,
        failed: 0,
        errors: [] as any[]
      };
      
      // Process each document
      for (const document of documents) {
        try {
          // Ensure document has an ID
          const documentId = document.id || document.$id || ID.unique();
          
          // Remove Firebase-specific fields
          const cleanDocument = { ...document };
          delete cleanDocument.id; // Remove Firebase ID if present
          
          // Create document in Appwrite
          await databaseService.createDocument(
            collectionId,
            {
              ...cleanDocument,
              $id: documentId
            },
            documentId
          );
          
          results.successful++;
        } catch (error) {
          console.error(`Failed to import document ${document.id || document.$id || 'unknown'}:`, error);
          results.failed++;
          results.errors.push({
            documentId: document.id || document.$id || 'unknown',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      console.log(`Collection import completed: ${results.successful} successful, ${results.failed} failed`);
      return results;
    } catch (error) {
      console.error(`Error importing collection "${collectionId}":`, error);
      throw new Error(`Failed to import collection "${collectionId}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Import all collections from Firebase exports into Appwrite
   * @param collectionMappings Map of Firebase collection names to Appwrite collection IDs
   * @param inputDir Directory containing the Firebase exports
   * @returns Promise with import results
   */
  static async importAllCollections(
    collectionMappings: { [firebaseCollection: string]: string },
    inputDir: string
  ): Promise<{ [collection: string]: { successful: number; failed: number } }> {
    try {
      console.log('Starting import of all collections...');
      
      const results: { [collection: string]: { successful: number; failed: number } } = {};
      
      // Import each collection
      for (const [firebaseCollection, appwriteCollectionId] of Object.entries(collectionMappings)) {
        const inputFilePath = path.resolve(inputDir, `firebase-${firebaseCollection}.json`);
        
        // Check if the export file exists
        if (!fs.existsSync(inputFilePath)) {
          console.warn(`Export file not found for collection "${firebaseCollection}": ${inputFilePath}`);
          results[firebaseCollection] = { successful: 0, failed: 0 };
          continue;
        }
        
        // Import the collection
        const importResult = await this.importCollection(appwriteCollectionId, inputFilePath);
        
        results[firebaseCollection] = {
          successful: importResult.successful,
          failed: importResult.failed
        };
      }
      
      // Write summary file
      fs.writeFileSync(
        path.resolve(inputDir, 'import-summary.json'),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          collections: results,
          total: {
            successful: Object.values(results).reduce((sum, result) => sum + result.successful, 0),
            failed: Object.values(results).reduce((sum, result) => sum + result.failed, 0)
          }
        }, null, 2)
      );
      
      console.log('Collection import completed successfully');
      return results;
    } catch (error) {
      console.error('Error importing collections:', error);
      throw new Error(`Failed to import collections: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Run a complete migration from Firebase to Appwrite
   * @param exportDir Directory to store Firebase exports
   * @param collectionMappings Map of Firebase collection names to Appwrite collection IDs
   * @returns Promise with migration results
   */
  static async runFullMigration(
    exportDir: string,
    collectionMappings: { [firebaseCollection: string]: string }
  ): Promise<{
    users: { successful: number; failed: number };
    collections: { [collection: string]: { successful: number; failed: number } };
  }> {
    try {
      console.log('Starting full Firebase to Appwrite migration...');
      
      // Create export directory if it doesn't exist
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      // Step 1: Export users from Firebase
      const userCount = await import('./firebaseDataExport').then(module => {
        return module.default.exportUsers(exportDir);
      });
      
      console.log(`Exported ${userCount} users from Firebase`);
      
      // Step 2: Export collections from Firebase
      const collectionResults = await import('./firebaseDataExport').then(module => {
        return module.default.exportAllCollections(Object.keys(collectionMappings), exportDir);
      });
      
      console.log('Exported collections from Firebase:', collectionResults);
      
      // Step 3: Import users to Appwrite
      const userImportResult = await this.importUsers(path.resolve(exportDir, 'firebase-users.json'));
      
      // Step 4: Import collections to Appwrite
      const collectionImportResults = await this.importAllCollections(collectionMappings, exportDir);
      
      // Prepare final results
      const results = {
        users: {
          successful: userImportResult.successful,
          failed: userImportResult.failed
        },
        collections: collectionImportResults
      };
      
      // Write final summary
      fs.writeFileSync(
        path.resolve(exportDir, 'migration-summary.json'),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          users: results.users,
          collections: results.collections,
          total: {
            users: userImportResult.successful,
            documents: Object.values(collectionImportResults).reduce((sum, result) => sum + result.successful, 0)
          }
        }, null, 2)
      );
      
      console.log('Full migration completed successfully');
      return results;
    } catch (error) {
      console.error('Error during full migration:', error);
      throw new Error(`Failed to complete migration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default AppwriteDataImport;