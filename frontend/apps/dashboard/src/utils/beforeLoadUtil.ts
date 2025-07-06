import {
  clearTokenInStorage,
  populateStoresFromToken,
  setupWebSocket,
  useAuthStore,
} from '@sudosos/sudosos-frontend-common';
import { GrolschGreen, BetaBlue, AthenaPinkBlue, IvvNavy, BoomMango, DefiLilac, GepwnageYellow } from '@sudosos/themes';
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings.store';
import apiService from '@/services/ApiService';
import { useConditionalPreset } from '@/composables/conditionalPreset';
import { useOrganMember } from '@/composables/organMember';
import { isBetaEnabled } from '@/utils/betaUtil';

const ORGANS = {
  BAC: 'BAC',
  ATHENA: 'ATHENA',
  IVV: 'I.V.V',
  BOOM: 'B.O.O.M',
  DEFI: 'Défi',
  GEPWNAGE: 'GEPWNAGE',
};

export default async function beforeLoad() {
  const settingsStore = useSettingsStore();

  try {
    setupWebSocket();
    await settingsStore.fetchKeys();
  } catch (e) {
    console.error(e);
    return;
  }

  await populateStoresFromToken(apiService).catch(() => {
    clearTokenInStorage();
    const authStore = useAuthStore();
    authStore.logout();
  });

  useConditionalPreset([
    { condition: useOrganMember(ORGANS.BAC), preset: GrolschGreen },
    { condition: useOrganMember(ORGANS.ATHENA), preset: AthenaPinkBlue },
    { condition: useOrganMember(ORGANS.IVV), preset: IvvNavy },
    { condition: useOrganMember(ORGANS.BOOM), preset: BoomMango },
    { condition: useOrganMember(ORGANS.DEFI), preset: DefiLilac },
    { condition: useOrganMember(ORGANS.GEPWNAGE), preset: GepwnageYellow },
    { condition: computed(() => isBetaEnabled()), preset: BetaBlue },
  ]);
}
