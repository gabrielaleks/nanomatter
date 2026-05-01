export interface ServiceResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}