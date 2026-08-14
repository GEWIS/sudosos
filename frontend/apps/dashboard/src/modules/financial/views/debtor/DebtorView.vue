<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col gap-5">
      <DebtorTable />
      <DebtorHandouts />
    </div>
  </PageContainer>
</template>
<script setup lang="ts">
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';
import PageContainer from '@/layout/PageContainer.vue';
</script>

<style scoped lang="scss"></style>
