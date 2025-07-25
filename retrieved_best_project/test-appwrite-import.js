// Test what's actually exported from appwrite
import * as appwrite from 'appwrite';

console.log('Appwrite exports:', Object.keys(appwrite));
console.log('OAuthProvider exists:', 'OAuthProvider' in appwrite);

if ('OAuthProvider' in appwrite) {
  console.log('OAuthProvider keys:', Object.keys(appwrite.OAuthProvider));
} else {
  console.log('OAuthProvider not found, checking alternatives...');
  // Check for alternative names
  const possibleNames = ['OAuth', 'Provider', 'Providers', 'OAuthProviders'];
  possibleNames.forEach(name => {
    if (name in appwrite) {
      console.log(`Found ${name}:`, appwrite[name]);
    }
  });
}