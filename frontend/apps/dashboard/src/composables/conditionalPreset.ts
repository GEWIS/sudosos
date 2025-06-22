import { usePreset } from '@primeuix/themes';
import { SudososRed } from '@sudosos/themes';
import type { ComputedRef, Ref, WatchStopHandle } from 'vue';
import { watchEffect } from 'vue';

type Preset = typeof SudososRed;

type PresetEntry = {
  condition: Ref<boolean> | ComputedRef<boolean>;
  preset: Preset;
};

export function useConditionalPreset(conditions: PresetEntry[], fallback = SudososRed): WatchStopHandle {
  let currentPreset: Preset = fallback;

  return watchEffect(() => {
    let selectedPreset = fallback;

    for (const { condition, preset } of conditions) {
      if (condition.value) {
        selectedPreset = preset;
      }
    }

    // Only apply if the preset has actually changed
    if (currentPreset !== selectedPreset) {
      currentPreset = selectedPreset;
      usePreset(selectedPreset);
    }
  });
}
