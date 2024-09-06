<template>
  <FormCard :header="t('userDetails.userInformation')"
            @update:modelValue="edit = $event"
            @save="formSubmit"
            :enableEdit="true"
  >
      <div class="flex flex-column justify-content-between gap-2">
        <UserEditForm :user="props.user" :form="form" :edit="edit" @update:edit="edit = $event"/>
      </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onMounted, type PropType, ref, watch } from "vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { schemaToForm } from "@/utils/formUtils";
import { updateUserDetailsObject, userTypes } from "@/utils/validation-schema";
import UserEditForm from "@/modules/admin/components/users/forms/UserEditForm.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true
  }
});

const edit = ref(false);

const form = schemaToForm(updateUserDetailsObject);

const formSubmit = () => {
  form.submit();
};

const updateFieldValues = (p: UserResponse) => {
  if (!p) return;
  const values = {
    ...p,
    userType: p.type,
    isActive: p.active,
  };
  form.context.resetForm({ values });
};

watch(() => props.user, (newValue: UserResponse) => {
  updateFieldValues(newValue);
});

onMounted(() => {
  if (props.user) {
    updateFieldValues(props.user);
  }
});
</script>

<style scoped lang="scss">

</style>
