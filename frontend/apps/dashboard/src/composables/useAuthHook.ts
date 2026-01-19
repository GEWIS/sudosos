import { authEventEmitter } from '@sudosos/sudosos-frontend-common';
import { useConditionalPreset } from '@/composables/conditionalPreset';
import { useBetaSync } from '@/composables/useBetaSync';

/**
 * Function to initialize authentication hook and trigger dashboard-specific logic
 * This function sets up the authentication event listener and applies the initial preset after login
 */
export function initializeAuthHook() {
  const { applyInitialPreset } = useConditionalPreset();
  const { initializeBetaSync } = useBetaSync();

  const handleAuthentication = () => {
    // Apply the initial preset after user has logged in
    applyInitialPreset();
  };

  // Listen for authentication events
  authEventEmitter.onAuthenticated(handleAuthentication);

  // Initialize beta sync
  initializeBetaSync();

  return {
    handleAuthentication,
  };
}
