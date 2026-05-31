export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  message?: string;
  statusCode?: number;
  error?: string;
}
