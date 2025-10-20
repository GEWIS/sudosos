import { usePreset } from '@primeuix/themes';
import {
  AthenaPinkBlue,
  BetaBlue,
  BoomMango,
  DefiLilac,
  GepwnageYellow,
  GrolschGreen,
  IvvNavy,
  SudososRed,
} from '@sudosos/themes';
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import { useOrganMember } from '@/composables/organMember';
import { isBetaEnabled } from '@/utils/betaUtil';

const CONDITIONAL_PRESET_KEY = 'conditional-preset';

type Preset = typeof SudososRed;

type PresetEntry = {
  label: string;
  condition: Ref<boolean> | ComputedRef<boolean>;
  preset: Preset;
};

const ORGANS = {
  BAC: 'BAC',
  ATHENA: 'ATHENA',
  IVV: 'I.V.V',
  BOOM: 'B.O.O.M',
  DEFI: 'Défi',
  GEPWNAGE: 'GEPWNAGE',
};

/**
 * Composable for managing preset
 * @returns {Object} Object containing the currentPreset, availablePresets, applyPreset and applyInitialPreset functions
 */
export function useConditionalPreset() {
  const conditionalPresets = [
    { label: 'SudoSOS', condition: computed(() => true), preset: SudososRed },
    { label: ORGANS.BAC, condition: useOrganMember(ORGANS.BAC), preset: GrolschGreen },
    { label: ORGANS.ATHENA, condition: useOrganMember(ORGANS.ATHENA), preset: AthenaPinkBlue },
    { label: ORGANS.IVV, condition: useOrganMember(ORGANS.IVV), preset: IvvNavy },
    { label: ORGANS.BOOM, condition: useOrganMember(ORGANS.BOOM), preset: BoomMango },
    { label: ORGANS.DEFI, condition: useOrganMember(ORGANS.DEFI), preset: DefiLilac },
    { label: ORGANS.GEPWNAGE, condition: useOrganMember(ORGANS.GEPWNAGE), preset: GepwnageYellow },
  ];

  const availablePresets = computed(() => {
    if (isBetaEnabled()) {
      // Enforce beta theme if beta is enabled.
      return [{ label: 'Beta', condition: computed(() => true), preset: BetaBlue }];
    } else {
      return conditionalPresets.filter((entry: PresetEntry) => entry.condition.value);
    }
  });

  const getInitialPreset = () => {
    const stored = localStorage.getItem(CONDITIONAL_PRESET_KEY);
    if (stored !== null) {
      for (const entry of availablePresets.value) {
        if (entry.label === stored) {
          return entry;
        }
      }
    }

    return availablePresets.value[availablePresets.value.length - 1];
  };

  const currentPreset = ref(getInitialPreset().label);

  const applyPreset = (entry: PresetEntry) => {
    currentPreset.value = entry.label;
    usePreset(entry.preset);
    localStorage.setItem(CONDITIONAL_PRESET_KEY, entry.label);
  };

  const applyInitialPreset = () => {
    applyPreset(getInitialPreset());
  };

  return { currentPreset, availablePresets, applyPreset, applyInitialPreset };
}
