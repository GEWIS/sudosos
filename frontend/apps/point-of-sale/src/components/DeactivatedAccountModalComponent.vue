<template>
  <Dialog
    class="w-[35rem]"
    :closable="false"
    :close-on-escape="false"
    :dismissable-mask="false"
    :draggable="false"
    header="Account deactivated"
    modal
    :visible="show"
  >
    <Message :closable="false" :icon="undefined" severity="warn">
      Your account is <span class="font-bold">deactivated</span>.
      <br />
      You cannot make purchases at the POS until it is reactivated.
      <br /><br />
      Please contact the SudoSOS administrators to resolve this.
    </Message>

    <div class="flex justify-center items-center mt-4">
      <Button class="text-xl px-6 py-3 understand-button" @click="emit('dismiss')"> I Understand </Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['dismiss']);
</script>

<style scoped lang="scss">
.understand-button {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-primary-inverse-color);

  &:hover:not(:disabled) {
    background-color: var(--p-primary-hover-color);
    border-color: var(--p-primary-hover-color);
  }

  &:focus-visible {
    outline-color: var(--p-primary-color);
  }
}
</style>
