import { authEventEmitter } from '@sudosos/sudosos-frontend-common';
import { useConditionalPreset } from '@/composables/conditionalPreset';

/**
 * Function to initialize authentication hook and trigger dashboard-specific logic
 * This function sets up the authentication event listener and applies the initial preset after login
 */
export function initializeAuthHook() {
  const { applyInitialPreset } = useConditionalPreset();

  const handleAuthentication = () => {
    // Apply the initial preset after user has logged in
    applyInitialPreset();
  };

  // Listen for authentication events
  authEventEmitter.onAuthenticated(handleAuthentication);

  return {
    handleAuthentication,
  };
}
