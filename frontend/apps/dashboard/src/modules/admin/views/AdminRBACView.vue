<template>
  <PageContainer>
    <div class="flex flex-wrap gap-3">
      <div class="flex flex-col md:flex-row gap-3 flex-grow">
        <div class="flex flex-col gap-3 flex-grow">
          <SelectRolesCard class="h-35" :form="form" />
          <PermissionPerRoleCard :form="form" />
        </div>
        <div class="flex flex-col gap-3 flex-grow">
          <TabView>
            <TabPanel v-for="state in states" :key="state" :header="state" :value="state">
              <RBACTable :form="form" :state="state" />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import SelectRolesCard from '@/modules/admin/components/rbac/SelectRolesCard.vue';
import PermissionPerRoleCard from '@/modules/admin/components/rbac/PermissionPerRoleCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';
import RBACTable from '@/modules/admin/components/rbac/RBACTable.vue';
import PageContainer from '@/layout/PageContainer.vue';

const states: string[] = ['User', 'Permission'];

const form = schemaToForm(rbacSchema);
</script>
