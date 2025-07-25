import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  limit, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { getAuth, listUsers } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../config/firebase.backup';
import { DataTransformation } from './dataTransformation';
import fs from 'fs';
import path from 'path';

/**
 * Firebase Data Export Utility
 * Handles exporting data from Firebase for migration to Appwrite
 */
export class FirebaseDataExport {
  private static app = initializeApp(FIREBASE_CONFIG);
  private static db = getFirestore(FirebaseDataExport.app);
  private static auth = getAuth(FirebaseDataExport.app);
  
  /**
   * Export all users from Firebase Authentication
   * @param outputPath Path to save the exported users JSON file
   * @returns Promise with the number of exported users
   */
  static async exportUsers(outputPath: string): Promise<number> {
    try {
      console.log('Starting Firebase user export...');
      
      const users: any[] = [];
      let pageToken: string | undefined;
      
      // Firebase Admin SDK listUsers is paginated
      do {
        const listUsersResult = await listUsers(this.auth, 1000, pageToken);
        listUsersResult.users.forEach(userRecord => {
          users.push({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            emailVerified: userRecord.emailVerified,
            disabled: userRecord.disabled,
            metadata: {
              creationTime: userRecord.metadata.creationTime,
              lastSignInTime: userRecord.metadata.lastSignInTime
            },
            providerData: userRecord.providerData
          });
        });
        
        pageToken = listUsersResult.pageToken;
      } while (pageToken);
      
      // Transform data to ensure compatibility with Appwrite
      const transformedUsers = users.map(user => DataTransformation.convertFirebaseToAppwrite(user));
      
      // Write to file
      fs.writeFileSync(
        path.resolve(outputPath, 'firebase-users.json'),
        JSON.stringify(transformedUsers, null, 2)
      );
      
      console.log(`Exported ${users.length} users to ${outputPath}/firebase-users.json`);
      return users.length;
    } catch (error) {
      console.error('Error exporting Firebase users:', error);
      throw new Error(`Failed to export Firebase users: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Export collection data from Firebase Firestore
   * @param collectionName Name of the collection to export
   * @param outputPath Path to save the exported collection JSON file
   * @param batchSize Number of documents to fetch in each batch
   * @returns Promise with the number of exported documents
   */
  static async exportCollection(
    collectionName: string,
    outputPath: string,
    batchSize = 500
  ): Promise<number> {
    try {
      console.log(`Starting Firebase collection export for "${collectionName}"...`);
      
      const documents: DocumentData[] = [];
      const collectionRef = collection(this.db, collectionName);
      
      let lastDoc: QueryDocumentSnapshot | null = null;
      let hasMoreDocs = true;
      
      // Use batched queries to handle large collections
      while (hasMoreDocs) {
        let q = query(collectionRef, limit(batchSize));
        
        if (lastDoc) {
          q = query(collectionRef, startAfter(lastDoc), limit(batchSize));
        }
        
        const querySnapshot = await getDocs(q);
        const docCount = querySnapshot.docs.length;
        
        if (docCount < batchSize) {
          hasMoreDocs = false;
        }
        
        if (docCount > 0) {
          lastDoc = querySnapshot.docs[docCount - 1];
          
          querySnapshot.docs.forEach(doc => {
            documents.push({
              id: doc.id,
              ...doc.data()
            });
          });
        } else {
          hasMoreDocs = false;
        }
        
        console.log(`Fetched ${documents.length} documents from "${collectionName}" collection`);
      }
      
      // Transform data to ensure compatibility with Appwrite
      const transformedDocuments = documents.map(doc => 
        DataTransformation.convertFirebaseToAppwrite(doc)
      );
      
      // Write to file
      fs.writeFileSync(
        path.resolve(outputPath, `firebase-${collectionName}.json`),
        JSON.stringify(transformedDocuments, null, 2)
      );
      
      console.log(`Exported ${documents.length} documents from "${collectionName}" to ${outputPath}/firebase-${collectionName}.json`);
      return documents.length;
    } catch (error) {
      console.error(`Error exporting Firebase collection "${collectionName}":`, error);
      throw new Error(`Failed to export Firebase collection "${collectionName}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Export all collections from Firebase Firestore
   * @param collections Array of collection names to export
   * @param outputPath Path to save the exported collections
   * @returns Promise with the export results
   */
  static async exportAllCollections(
    collections: string[],
    outputPath: string
  ): Promise<{ [collection: string]: number }> {
    try {
      console.log('Starting export of all Firebase collections...');
      
      const results: { [collection: string]: number } = {};
      
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      
      // Export each collection
      for (const collectionName of collections) {
        const count = await this.exportCollection(collectionName, outputPath);
        results[collectionName] = count;
      }
      
      // Write summary file
      fs.writeFileSync(
        path.resolve(outputPath, 'export-summary.json'),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          collections: results,
          total: Object.values(results).reduce((sum, count) => sum + count, 0)
        }, null, 2)
      );
      
      console.log('Firebase collection export completed successfully');
      return results;
    } catch (error) {
      console.error('Error exporting Firebase collections:', error);
      throw new Error(`Failed to export Firebase collections: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default FirebaseDataExport;