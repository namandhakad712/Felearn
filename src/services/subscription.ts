import { Client, Databases, ID } from 'appwrite';

// Initialize Appwrite client for subscription service
const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

export interface SubscriptionData {
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

class SubscriptionService {
  private databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  private collectionId = import.meta.env.VITE_APPWRITE_SUBSCRIBERS_COLLECTION_ID;

  /**
   * Subscribe an email to the newsletter
   */
  async subscribe(email: string): Promise<boolean> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const existingSubscriber = await this.checkExistingSubscriber(email);
      if (existingSubscriber) {
        throw new Error('This email is already subscribed');
      }

      // Create new subscription
      const subscriptionData: SubscriptionData = {
        email: email.toLowerCase().trim(),
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: 'website_footer'
      };

      await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        subscriptionData
      );

      console.log('Email subscribed successfully:', email);
      return true;
    } catch (error: any) {
      console.error('Subscription error:', error);
      throw new Error(error.message || 'Failed to subscribe. Please try again.');
    }
  }

  /**
   * Check if email already exists in subscribers
   */
  private async checkExistingSubscriber(email: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          `email=${email.toLowerCase().trim()}`
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      // If collection doesn't exist or other error, assume email doesn't exist
      console.warn('Error checking existing subscriber:', error);
      return false;
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Unsubscribe an email (for future use)
   */
  async unsubscribe(email: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          `email=${email.toLowerCase().trim()}`
        ]
      );

      if (response.documents.length > 0) {
        const document = response.documents[0];
        await databases.updateDocument(
          this.databaseId,
          this.collectionId,
          document.$id,
          { status: 'unsubscribed' }
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw new Error('Failed to unsubscribe. Please try again.');
    }
  }
}

export const subscriptionService = new SubscriptionService();