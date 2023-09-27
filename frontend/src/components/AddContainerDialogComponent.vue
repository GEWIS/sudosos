<template>
  <Dialog v-model:visible="visible" :header="$t('c_POSCreate.add container')">
    <div class="dialog">
      <div class="row">
        <h6>{{ $t("c_containerEditModal.Name") }}</h6>
        <InputText class="flex-child" v-model="name" />
      </div>
      <div class="row">
        <h6>{{ $t("c_containerEditModal.owner") }}</h6>
        <Dropdown
            class="flex-child"
            :options="organsList"
            optionLabel="firstName"
            v-model="selectedOwner"
            :placeholder="$t('c_containerEditModal.select owner')"
        />
      </div>
      <div class="row">
        <h6>{{ $t("c_containerEditModal.Public") }}</h6>
        <Checkbox class="flex-child" :binary="true" v-model="isPublic"/>
      </div>
      <div class="row" id="actions">
        <Button severity="danger" outlined @click="visible = false">{{ $t("c_containerEditModal.cancel") }}</Button>
        <Button severity="danger" @click="saveContainer">{{ $t("c_containerEditModal.save") }}</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { useContainerStore } from "@/stores/container.store";

const visible = ref(false);
const selectedOwner: Ref<UserResponse | undefined > = ref();
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const name: Ref<string> = ref("");
const isPublic: Ref<boolean> = ref(false);
const containerStore = useContainerStore();

onMounted(async () => {
  organsList.value = authStore.organs;
});

const saveContainer = () => {
  if (selectedOwner.value){
    containerStore.createEmptyContainer(name.value, isPublic.value, selectedOwner.value.id);
    visible.value = false;
  } else {
    // TODO: Correct error-handling
  }

};
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
      max-width: 33.33333%;
    }

    .flex-child {
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 1; /* Make the child fill the available space within the .row */
      max-width: 66.66666%;
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

</style>
