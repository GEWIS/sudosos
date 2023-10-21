interface ErrorResponse {
  message: string;
}

export function isErrorResponse(data: any): data is ErrorResponse {
  return data && typeof data.message === 'string';
}
