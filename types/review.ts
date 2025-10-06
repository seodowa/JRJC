import { Car } from "./car"

export interface Review {
  id: number              // Required for React/database
  userName: string
  rating: number          // 1-5
  title: string
  comment: string
  car?: Car          // Which car this is for
  helpful: number
  createdAt: Date         // When posted
  updatedAt: Date
  verified: boolean       // Is this real?
}