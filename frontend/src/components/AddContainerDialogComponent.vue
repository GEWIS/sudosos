<template>
  <Dialog v-model:visible="visible"
          :header="$t('c_POSCreate.add container')"
          :draggable="false"
          modal
          @update:visible="closeDialog"
          ref="addContainer"
          @show="addListenerOnDialogueOverlay(addContainer)"
  >
    <div class="dialog">
      <form @submit="handleCreateContainer">
        <div class="row">
          <h6>{{ $t("c_containerEditModal.Name") }}</h6>
          <div class="input-container">
            <InputText class="flex-child" :class="{'p-invalid': errors.name}" v-bind="name"/>
            <small
                v-if="errors.name"
                class="p-error"
            >
              <i class="pi pi-exclamation-circle" />{{ " " + errors.name }}
            </small>
            <br v-else>
          </div>
        </div>
        <div class="row">
          <h6>{{ $t("c_containerEditModal.owner") }}</h6>
          <div class="input-container">
            <Dropdown
                class="flex-child"
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
        <div class="row">
          <h6>{{ $t("c_containerEditModal.Public") }}</h6>
          <Checkbox class="flex-child" :binary="true" v-bind="isPublic"/>
          <span class="error-text">{{ errors.isPublic }}</span>
        </div>
        <div class="row" id="actions">
          <Button severity="danger" outlined @click="closeDialog">{{ $t("c_containerEditModal.cancel") }}</Button>
          <Button severity="danger" type="submit">{{ $t("c_containerEditModal.save") }}</Button>
        </div>
      </form>
    </div>
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
.dialog {
  width: 50vw;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;

  .row {
    display: flex;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;

    h6 {
      font-weight: 700!important;
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 0 0 33.33333%;
      max-width: 20%;
    }

    .flex-child {
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;

      margin-bottom: 0.25rem;
    }

    img {
      max-width: 10rem;
      max-height: 10rem;
      width: 100%;
      height: 100%;
    }
  }

  #actions {
    display: flex;
    justify-content: flex-end;
    flex-direction: row;

    .p-button {
      margin: 0 0.2rem;
    }
  }
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 50%;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height:18px;
}

.p-error > i {
  font-size:12px;
  margin-right: 3.6px;
  line-height:12px;
}
</style>
