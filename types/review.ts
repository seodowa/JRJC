export interface Review {
  id: string              // Required for React/database
  userName: string
  rating: number          // 1-5
  comment: string
  carId?: string          // Which car this is for
  createdAt: Date         // When posted
  verified: boolean       // Is this real?
}