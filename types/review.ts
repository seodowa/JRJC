import { Car } from "./car"

export interface Review {
  id: number              // Required for React/database
  userName: string
  rating: number          // 1-5
  title: string
  comment: string
  car?: Car          // Which car this is for
  helpfulCount: number
  createdAt: Date         // When posted
}

export interface ReviewForDisplay extends Review {
  isHelpful: boolean
}