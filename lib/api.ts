export interface ApiError {
  kind: "ApiError";
  code: number;
  message: string;
}
