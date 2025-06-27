import { computed, type Ref } from 'vue';
import { USER_TYPES } from '@/utils/validation-schema';

export function useUserFieldVisibility(userType: Ref<USER_TYPES, string>, isCreate: Ref<boolean>, preTyped = false) {
  const show = computed(() => {
    if (isCreate.value && !preTyped)
      return {
        nickname: true,
        lastName: true,
        debt: true,
        ofAge: true,
        email: true,
      };

    const type = userType.value;
    return {
      nickname: [USER_TYPES.LOCAL_USER, USER_TYPES.MEMBER].includes(type),
      lastName: ![USER_TYPES.ORGAN, USER_TYPES.INTEGRATION].includes(type),
      debt: ![USER_TYPES.INVOICE, USER_TYPES.AUTOMATIC_INVOICE, USER_TYPES.ORGAN, USER_TYPES.INTEGRATION].includes(
        type,
      ),
      ofAge: [USER_TYPES.MEMBER, USER_TYPES.LOCAL_USER, USER_TYPES.LOCAL_ADMIN].includes(type),
      email: [
        USER_TYPES.LOCAL_USER,
        USER_TYPES.LOCAL_ADMIN,
        USER_TYPES.ORGAN,
        USER_TYPES.INVOICE,
        USER_TYPES.AUTOMATIC_INVOICE,
      ].includes(type),
    };
  });

  // Managed user calculation
  const managed = computed(() => {
    if (isCreate.value) return false;
    return ![USER_TYPES.LOCAL_USER, USER_TYPES.LOCAL_ADMIN].includes(userType.value);
  });

  return { show, managed };
}
