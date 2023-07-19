<template>
  <Panel :header="header.toUpperCase()" class="card">
    <div class="wrapper">
      <slot/>
      <Button severity="secondary" id="bottom-left-button">{{ action.toUpperCase() }}</Button>
    </div>

  </Panel>
</template>

<script setup lang="ts">
// TODO: Clean up all the fucking important statements
defineProps({
  header: {
    type: String,
    required: true,
  },
  routerLink: {
    type: String,
    required: false,
  },
  action: {
    type: String,
    required: true,
  }
})
</script>

<style scoped>
.card {
  position: relative;
}
#bottom-left-button {
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  color: #d40000!important;
  background-color: #f2f2f2;
  border-top: none;
  padding: 1rem 1.25rem!important;
  font-family: Lato,Arial,sans-serif!important;
  font-weight: 400;
  border-color: #dee2e6;
}

:deep(.p-panel-header) {
  border-bottom: none!important;
  color: #d40000!important;
  font-family: Lato,Arial,sans-serif!important;
  font-weight: 400;
  padding-top: 1rem;
  padding-bottom: 2rem;
  background-color: #f8f8f8!important;
}

:deep(.p-panel-content) {
  background-color: #f8f8f8!important;
  padding-left: 2rem!important;
  padding-right: 2rem!important;
  padding-bottom: 0!important;
}

.card {
  color: #d40000!important;
}

.wrapper {
  margin-bottom: 4.75rem;
}

</style>
