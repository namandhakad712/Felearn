// Appwrite Configuration
// Updated on: July 21, 2025

export interface AppwriteConfig {
  endpoint: string;
  project: string;
  devKey?: string; // Dev key for development environments
  database: {
    id: string;
    name: string;
  };
  collections: {
    users: {
      id: string;
      name: string;
    } | null;
    analytics: {
      id: string;
      name: string;
    } | null;
    errorLogs: {
      id: string;
      name: string;
    } | null;
    stories: {
      id: string;
      name: string;
    } | null;
    adminLogs: {
      id: string;
      name: string;
    } | null;
  };
  storage: {
    storyImages: string;
  };
}

export const appwriteConfig: AppwriteConfig = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  project: 'felearn',
  devKey: '5c920e77f56edc4512d3f86e67065a8240e5e43bcbfa1564d4397b46ffc314f1e21a8ea4451a348467955943d853780a2fea08c0269a32ff7769b6d48c032555cdea37df90673bed66a99e7d8dc11f68554e057a1cbee9b6ddd52d3f97a6dc5f4e73bd9d9ef9359d26a09cace415446a0f976a861a6942f4393517708a3fb546', // Your Dev key
  database: {
    id: '687a8ae6003b5969331a',
    name: 'users'
  },
  collections: {
    users: {
      id: 'users',
      name: 'Users' // Updated to proper name
    },
    analytics: {
      id: 'analytics',
      name: 'Analytics'
    },
    errorLogs: {
      id: 'error_logs',
      name: 'Error Logs'
    },
    stories: {
      id: 'stories',
      name: 'Stories'
    },
    adminLogs: {
      id: 'admin_logs',
      name: 'Admin Logs'
    }
  },
  storage: {
    storyImages: 'storytelling-images'
  }
};

// Helper function to get collection ID safely
export function getCollectionId(collectionKey: keyof AppwriteConfig['collections']): string {
  const collection = appwriteConfig.collections[collectionKey];
  if (!collection) {
    throw new Error(`Collection ${collectionKey} not configured`);
  }
  return collection.id;
}

// Example usage:
// import { appwriteConfig, getCollectionId } from './appwrite.config';
//
// const client = new Client()
//   .setEndpoint(appwriteConfig.endpoint)
//   .setProject(appwriteConfig.project);
//
// // Add Dev key for development environments
// if (process.env.NODE_ENV !== 'production' && appwriteConfig.devKey) {
//   client.setDevKey(appwriteConfig.devKey);
// }
//
// const databases = new Databases(client);
// 
// // Get documents from users collection
// const users = await databases.listDocuments(
//   appwriteConfig.database.id,
//   getCollectionId('users')
// );