<template>
  <div class="font-bold opacity-80 text-white">
    <b>{{ localBuild ? `Local build` : `${branch}#${commit}` }}</b>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const branch: string | undefined = import.meta.env.VITE_GIT_COMMIT_BRANCH;
const commit: string | undefined = import.meta.env.VITE_GIT_COMMIT_SHA;

const localBuild = computed(() => {
  if (typeof branch !== 'string' || branch.length === 0) return true;
  return typeof commit !== 'string' || commit.length === 0;
});
</script>
