<template>
  <div class="absolute tag font-bold opacity-30"> {{branch}}#{{commit}} </div>
</template>

<script setup lang="ts">
const branch = __GIT_BRANCH__;
const commit = __GIT_COMMIT__;
</script>

<style scoped lang="scss">
.tag {
  bottom: 10px;
  right: 10px;
}
</style>
