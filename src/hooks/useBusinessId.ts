import { useBusiness } from './useBusiness';

/**
 * Simple hook to get the current business ID
 * Returns businessId and loading state
 */
export function useBusinessId() {
  const { data: business, isLoading, error } = useBusiness();
  
  return {
    businessId: business?.id || null,
    business,
    isLoading,
    error,
  };
}
