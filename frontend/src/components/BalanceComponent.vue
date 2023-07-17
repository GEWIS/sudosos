<template>
  <Panel header="Balance">
    <h1>€420.69</h1>
    <Button outlined severity="danger">Increase Online</Button>
  </Panel>
</template>
<script setup/>

<style scoped lang="scss">
h1 {
  font-size: 50px;
  text-align: center;
}

:deep(.p-panel-title) {
  color: #d40000;
  font-size: 1rem;
}

:deep(p-button) {
  position: relative;
  left: 0;
  bottom: 0;
}
</style>
