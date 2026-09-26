<template>
  <CardComponent class="w-full" :header="t('modules.financial.vouchers.cardsTable.header')">
    <div class="mb-4 flex flex-col md:flex-row justify-between gap-3">
      <IconField icon-position="left">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" class="w-full md:w-80" :placeholder="t('common.search')" />
      </IconField>
    </div>

    <DataTable
      data-key="id"
      paginator
      responsive-layout="scroll"
      :rows="rows"
      :rows-per-page-options="[10, 25, 50, 100]"
      :value="filteredUsers"
    >
      <template #empty>
        <div class="text-center p-4 text-muted-color">
          {{ t('modules.financial.vouchers.cardsTable.empty') }}
        </div>
      </template>

      <Column field="id" :header="t('common.id')" sortable style="width: 5rem" />

      <Column field="firstName" :header="t('modules.financial.vouchers.cardsTable.cardName')" sortable>
        <template #body="{ data }">
          <span class="font-medium font-mono text-sm">{{ data.firstName }}</span>
        </template>
      </Column>

      <Column :header="t('common.status')" sortable style="width: 8rem">
        <template #body="{ data }">
          <Badge
            :severity="data.active ? 'success' : 'danger'"
            :value="data.active ? t('common.active') : t('common.inactive')"
          />
        </template>
      </Column>

      <Column :header="t('common.actions')" style="width: 6rem; text-align: center">
        <template #body="{ data }">
          <Button
            v-tooltip.top="t('modules.financial.vouchers.cardsTable.viewUser')"
            icon="pi pi-user"
            rounded
            size="small"
            text
            @click="navigateToUser(data.id)"
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { UserResponse } from '@gewis/sudosos-client';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{
  users: UserResponse[];
}>();

const searchQuery = ref('');
const rows = ref(25);

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return props.users;
  return props.users.filter((u) => u.firstName.toLowerCase().includes(query) || u.id.toString().includes(query));
});

const navigateToUser = (userId: number) => {
  void router.push({ name: 'user', params: { userId } });
};
</script>
