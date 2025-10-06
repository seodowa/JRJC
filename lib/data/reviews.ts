import { Review } from "@/types";
import { CARS } from "./cars";


// mock data

export const REVIEWS: Review[] = [
    {
        id: 1,
        userName: "Aguynamedkent7",
        rating: 5,
        title: "lesgo",
        comment: "Ts bussin yo",
        createdAt: new Date(),
        updatedAt: new Date(),
        car: CARS[0],
        verified: true,
        helpful: 0
    },
    {
        id: 2,
        userName: "seodowa",
        rating: 5,
        title: "test",
        comment: "yo gurt",
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: true,
        helpful: 0
    },
    {
        id: 3,
        userName: "Hyuse",
        rating: 5,
        title: "Great",
        comment: "The owners are very accomodating",
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: true,
        helpful: 0
    }
]

