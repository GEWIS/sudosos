import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { computed } from 'vue';

export function useOrganMember(organName: string) {
  const authStore = useAuthStore();

  return computed(() => {
    const organs = authStore.organs ?? [];
    return organs.some((organ) => organ?.firstName?.toUpperCase() === organName.toUpperCase());
  });
}
