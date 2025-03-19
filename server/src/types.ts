export interface Scale {
  id: number;
  name: string;
  intervals: number[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 