export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  numberOfElements: number
  number: number
  size: number
}
