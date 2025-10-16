import { Review } from "@/types";
import { CARS } from "./cars";


// mock data

export const REVIEWS: Review[] = [
    {
        id: 1,
        userName: "Aguynamedkent7",
        rating: 5,
        title: "lesgo",
        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tempor vehicula erat a hendrerit. Sed id ligula sit amet sapien molestie cursus. Maecenas sed ex tellus. Nullam tempor ligula magna, in lobortis diam lacinia vel. Curabitur efficitur neque vel tellus interdum, vel imperdiet nisl mattis. Curabitur sollicitudin at est eu cursus. Nulla nibh augue, pharetra nec sem quis, feugiat facilisis mauris. Aenean dapibus lacus eros, id sagittis enim sodales vel. Etiam pretium lorem arcu, eu scelerisque nibh lacinia ac. In hac habitasse platea dictumst. Ut malesuada lorem purus, sodales molestie enim mollis eget.",
        createdAt: new Date(),
        updatedAt: new Date(),
        car: CARS[0],
        verified: true,
        helpful: 0
    },
    {
        id: 2,
        userName: "seodowa",
        rating: 4,
        title: "test",
        comment: "yo gurt",
        createdAt: new Date(),
        updatedAt: new Date(),
        car: CARS[1],
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
        car: CARS[1],
        verified: true,
        helpful: 0
    }
]

