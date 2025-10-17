import { computed } from 'vue';
import { useUserStore, useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDarkMode } from '@/composables/darkMode';

export function useProfileNav() {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { isDark, toggle } = useDarkMode();

  const firstName = computed((): string | undefined => {
    return userStore.getCurrentUser.user?.firstName;
  });

  const handleLogout = () => {
    authStore.logout();
    void router.push('/');
  };

  return computed(() => [
    {
      label: firstName.value,
      items: [
        {
          label: t('common.navigation.profile'),
          route: '/profile',
        },
        {
          label: t('common.navigation.signOut'),
          command: handleLogout,
        },
      ],
    },
    {
      label: '',
      icon: 'pi pi-globe',
      items: [
        {
          label: t('common.navigation.dutch'),
          disabled: () => locale.value === 'nl',
          command: () => {
            locale.value = 'nl';
            localStorage.setItem('locale', 'nl');
          },
        },
        {
          label: t('common.navigation.english'),
          disabled: () => locale.value === 'en',
          command: () => {
            locale.value = 'en';
            localStorage.setItem('locale', 'en');
          },
        },
        {
          label: t('common.navigation.polish'),
          disabled: () => locale.value === 'pl',
          command: () => {
            locale.value = 'pl';
            localStorage.setItem('locale', 'pl');
          },
        },
      ],
    },
    {
      label: '',
      aria: 'toggle dark mode',
      command: toggle,
      icon: isDark.value ? 'pi pi-sun' : 'pi pi-moon',
    },
  ]);
}
