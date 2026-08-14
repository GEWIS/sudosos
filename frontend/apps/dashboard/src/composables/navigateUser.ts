import { useRouter } from 'vue-router';

export function useNavigateUser() {
  const router = useRouter();

  const navigateUser = (userId: number, blank = true) => {
    if (!blank) void router.push({ name: 'user', params: { userId } });
    else void window.open(`/user/${userId}`, '_blank');
  };

  return { navigateUser };
}
