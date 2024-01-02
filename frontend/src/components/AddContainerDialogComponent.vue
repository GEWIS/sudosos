<template>
  <Dialog v-model:visible="visible"
          :header="$t('c_POSCreate.add container')"
          :draggable="false"
          modal
          @update:visible="closeDialog"
          ref="addContainer"
          @show="addListenerOnDialogueOverlay(addContainer)"
          class="w-auto flex w-9"
  >
      <form @submit="handleCreateContainer">
        <div class="field grid">
          <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("c_containerEditModal.Name") }}</label>
          <div class="col-12 md:col-10">
            <InputText :class="{'p-invalid': errors.name}" v-bind="name"/>
            <small
                v-if="errors.name"
                class="p-error"
            >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.name }}
            </small>
            <br v-else>
          </div>
        </div>
        <div class="field grid">
          <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("c_containerEditModal.owner") }}</label>
          <div class="col-12 md:col-10">
            <Dropdown
                :options="organsList"
                optionLabel="firstName"
                v-bind="selectedOwner"
                :placeholder="$t('c_containerEditModal.select owner')"
                :class="{'p-invalid': errors.selectedOwner}"
            />
            <small
                v-if="errors.selectedOwner"
                class="p-error"
            >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.selectedOwner }}
            </small>
            <br v-else>
            </div>
        </div>
        <div class="field grid">
          <label class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("c_containerEditModal.Public") }}</label>
          <div class="col-12 md:col-10">
            <Checkbox class="flex-child" :binary="true" v-bind="isPublic" />
            <span class="error-text">{{ errors.isPublic }}</span>
          </div>
        </div>
        <div class="flex flex-row justify-content-end gap-2">
          <Button outlined @click="closeDialog">{{ $t("c_containerEditModal.cancel") }}</Button>
          <Button type="submit">{{ $t("c_containerEditModal.save") }}</Button>
        </div>
      </form>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { useContainerStore } from "@/stores/container.store";
import * as yup from 'yup';
import { useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import { useI18n } from "vue-i18n";

const emit = defineEmits(['update:visible']);
const toast = useToast();
const visible: Ref<boolean | undefined> = ref(false);
const organsList: Ref<Array<UserResponse>> = ref([]);
const addContainer: Ref<null | any> = ref(null);
const { t } = useI18n();
// Form setup and component binds
const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: {
    name: yup.string().required(),
    selectedOwner: yup.mixed<UserResponse>().required(),
    isPublic: yup.boolean().required().default(false),
  }
});
const name = defineComponentBinds('name');
const isPublic = defineComponentBinds('isPublic');
const containerStore = useContainerStore();
const selectedOwner = defineComponentBinds('selectedOwner');

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  organsList.value = authStore.organs;
});
const closeDialog = () => {
  emit('update:visible', false);
};

const handleCreateContainer = handleSubmit(async (values) => {
  await containerStore.createEmptyContainer(
      values.name,
      values.isPublic || false,
      values.selectedOwner.id
  ).then(() => {
    closeDialog();
    router.go(0);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.createContainer'),
      life: 3000,
    });
  }).catch((err) => handleError(err, toast));
});

</script>

<style scoped lang="scss">
</style>
