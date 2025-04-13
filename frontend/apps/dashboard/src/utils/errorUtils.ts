import type { AxiosError } from 'axios';
import type { ToastServiceMethods } from 'primevue/toastservice';

interface ErrorResponse {
  message: string;
}

export function isErrorResponse(data: unknown): data is ErrorResponse {
  return (data as ErrorResponse) && (data as ErrorResponse).message !== undefined;
}

function isErrorMessage(data: unknown): data is string {
  return (data as string).length !== undefined;
}

// Method to add a toast involving an AxiosError
export function handleError(response: AxiosError, toast: ToastServiceMethods) {
  if (response.response) {
    const { data, status } = response.response;
    const code = response.code;
    let message = 'An error has occurred';
    if (isErrorResponse(data)) {
      message = data.message;
    } else if (isErrorMessage(data)) {
      message = data;
    }
    toast.add({
      severity: 'error',
      summary: `${status} - ${code}`,
      detail: message,
      life: 3000,
    });
  }
}
