// Email subscription functionality
(function() {
  'use strict';

  // Form notification system using existing Webflow elements
  const FormNotification = {
    successElement: null,
    errorElement: null,
    
    init() {
      this.successElement = document.querySelector('.footer__form--success');
      this.errorElement = document.querySelector('.footer__form--error');
    },

    showSuccess(message) {
      this.init();
      if (this.successElement) {
        // Update message if provided
        if (message) {
          const messageDiv = this.successElement.querySelector('div');
          if (messageDiv) {
            messageDiv.textContent = message;
          }
        }
        
        // Hide error and show success
        if (this.errorElement) {
          this.errorElement.style.display = 'none';
        }
        this.successElement.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
          this.successElement.style.display = 'none';
        }, 5000);
      }
    },

    showError(message) {
      this.init();
      if (this.errorElement) {
        // Update message if provided
        if (message) {
          const messageDiv = this.errorElement.querySelector('div');
          if (messageDiv) {
            messageDiv.textContent = message;
          }
        }
        
        // Hide success and show error
        if (this.successElement) {
          this.successElement.style.display = 'none';
        }
        this.errorElement.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
          this.errorElement.style.display = 'none';
        }, 5000);
      }
    },

    hide() {
      this.init();
      if (this.successElement) {
        this.successElement.style.display = 'none';
      }
      if (this.errorElement) {
        this.errorElement.style.display = 'none';
      }
    }
  };

  // Appwrite client setup
  const AppwriteClient = {
    client: null,
    databases: null,
    databaseId: '687a8ae6003b5969331a',
    collectionId: 'subscribers',

    init() {
      // Get environment variables from meta tags or window object
      const endpoint = document.querySelector('meta[name="appwrite-endpoint"]')?.content || 'https://fra.cloud.appwrite.io/v1';
      const projectId = document.querySelector('meta[name="appwrite-project"]')?.content || 'felearn';
      
      if (typeof Appwrite !== 'undefined') {
        this.client = new Appwrite.Client();
        this.client.setEndpoint(endpoint).setProject(projectId);
        this.databases = new Appwrite.Databases(this.client);
      }
    },

    async checkDuplicateEmail(email) {
      if (!this.databases) {
        throw new Error('Appwrite not initialized');
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      try {
        console.log('Checking for duplicate email:', normalizedEmail);
        
        const response = await this.databases.listDocuments(
          this.databaseId,
          this.collectionId,
          [Appwrite.Query.equal('email', normalizedEmail)]
        );

        return {
          exists: response.documents.length > 0,
          document: response.documents.length > 0 ? response.documents[0] : null,
          isActive: response.documents.length > 0 ? response.documents[0].status === 'active' : false
        };
      } catch (error) {
        console.warn('Error checking duplicate email:', error);
        // Return false to allow subscription attempt
        return { exists: false, document: null, isActive: false };
      }
    },

    async subscribe(email) {
      if (!this.databases) {
        throw new Error('Appwrite not initialized');
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check for duplicate email first
      const duplicateCheck = await this.checkDuplicateEmail(normalizedEmail);
      
      if (duplicateCheck.exists) {
        if (duplicateCheck.isActive) {
          throw new Error('This email is already subscribed to our newsletter');
        } else if (duplicateCheck.document && duplicateCheck.document.status === 'unsubscribed') {
          // Reactivate the subscription
          try {
            await this.databases.updateDocument(
              this.databaseId,
              this.collectionId,
              duplicateCheck.document.$id,
              {
                status: 'active',
                subscribedAt: new Date().toISOString(),
                source: 'website_footer'
              }
            );
            console.log('Reactivated subscription for:', normalizedEmail);
            return;
          } catch (error) {
            console.error('Failed to reactivate subscription:', error);
            throw new Error('Failed to reactivate subscription. Please try again.');
          }
        }
      }

      // Create new subscription
      const subscriptionData = {
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        source: 'website_footer'
      };

      try {
        console.log('Creating new subscription for:', normalizedEmail);
        
        await this.databases.createDocument(
          this.databaseId,
          this.collectionId,
          Appwrite.ID.unique(),
          subscriptionData
        );
        
        console.log('Successfully created subscription for:', normalizedEmail);
      } catch (error) {
        console.error('Failed to create subscription:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Collection not found')) {
          throw new Error('Subscription service is not available. Please try again later.');
        } else if (error.message.includes('Document already exists')) {
          throw new Error('This email is already subscribed');
        } else if (error.message.includes('Unauthorized')) {
          throw new Error('Unable to process subscription. Please try again later.');
        } else {
          throw new Error('Failed to subscribe. Please try again later.');
        }
      }
    }
  };

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Flag to prevent multiple submissions
  let isSubmitting = false;

  // Subscription handler
  async function handleSubscription(email) {
    // Prevent multiple simultaneous submissions
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring...');
      return false;
    }

    isSubmitting = true;

    try {
      // Validate email
      if (!email || email.length === 0) {
        throw new Error('Please enter your email address');
      }
      
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Subscribe via Appwrite
      await AppwriteClient.subscribe(email);
      
      // Show success message using existing form elements
      FormNotification.showSuccess('Successfully subscribed! Thank you for joining us.');
      
      // Clear the form
      const emailInput = document.getElementById('email-2');
      if (emailInput) {
        emailInput.value = '';
      }

      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      FormNotification.showError(error.message || 'Failed to subscribe. Please try again.');
      return false;
    } finally {
      // Reset the flag
      isSubmitting = false;
    }
  }

  // Initialize when DOM is ready
  function initializeSubscription() {
    // Initialize Appwrite
    AppwriteClient.init();

    // Find the subscription form
    const form = document.getElementById('email-form');
    const emailInput = document.getElementById('email-2');
    const submitButton = form?.querySelector('input[type="submit"]');

    if (!form || !emailInput) {
      console.warn('Subscription form elements not found, retrying...');
      // Retry after a short delay
      setTimeout(initializeSubscription, 500);
      return;
    }

    console.log('Found subscription form elements:', {
      form: !!form,
      emailInput: !!emailInput,
      submitButton: !!submitButton
    });

    // Disable HTML5 validation to prevent browser popup
    form.setAttribute('novalidate', 'true');
    
    // Handle form submission with debounce
    let submitTimeout = null;
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Clear any existing timeout
      if (submitTimeout) {
        clearTimeout(submitTimeout);
      }
      
      // Debounce the submission
      submitTimeout = setTimeout(async () => {
        const email = emailInput.value.trim();
        
        // Hide any existing notifications first
        FormNotification.hide();
        
        // Disable submit button during processing
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.style.opacity = '0.6';
        }

        try {
          await handleSubscription(email);
        } finally {
          // Re-enable submit button
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
          }
        }
      }, 100); // 100ms debounce
    });

    // Handle Enter key in email input
    emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Trigger form submission
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    });

    console.log('Email subscription initialized');
  }

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSubscription);
  } else {
    initializeSubscription();
  }

  // Also try to initialize after a short delay to ensure all scripts are loaded
  setTimeout(initializeSubscription, 1000);

})();