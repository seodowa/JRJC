import type { Car } from "@/types";

// mock data

export const cars: Car[] = [
    {
        id: 1,
        model: "Wigo G",
        brand: "Toyota",
        year: 2020,
        price: [
            { Location: "Manolo-CDO", Price_12_Hours: 1000, Price_24_Hours: 1300 },
            { Location: "Bukidnon/Mis. Or.", Price_12_Hours: 1400, Price_24_Hours: 1700 },
            { Location: "Outside Region 10", Price_12_Hours: 0, Price_24_Hours: 2000 },
        ],
        image: "https://scontent.fcgy1-1.fna.fbcdn.net/v/t39.30808-6/547065267_122233049528183073_581477742412709264_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeE_GAcbJ57jfu7jSnShvUcsDqYUQesSRc4OphRB6xJFznrPiVxI8RHaRElnSOmGgKHzoiiUFhgIj_-rLUn9u7_B&_nc_ohc=e8pXZbbPOL0Q7kNvwGh8I6L&_nc_oc=AdluzNJqgYDVN_yTg99j4vtgCi_TJ-rxDJIf631gjMVXNYYVtW2NCMl23ZhiX8gFxTLeJ9WEF-eQ0TmRJvgo040b&_nc_zt=23&_nc_ht=scontent.fcgy1-1.fna&_nc_gid=ErcsMj9Lb1UeCBx3veLO_A&oh=00_Afe_zBwdrOfLGWhNSuiKOGqO85N23yB1N_O1w8tZYGztAQ&oe=68E59BF3",
        transmission: 'Manual', 
        seats: 5,
        fuelType: 'Gasoline',
        available: true
    },
    {
        id: 2,
        model: "Test",
        brand: "Toyota",
        year: 2020,
        price: [
            { Location: "Manolo-CDO", Price_12_Hours: 1000, Price_24_Hours: 1300 },
            { Location: "Bukidnon/Mis. Or.", Price_12_Hours: 1400, Price_24_Hours: 1700 },
            { Location: "Outside Region 10", Price_12_Hours: 0, Price_24_Hours: 2000 },
        ],
        image: "null",
        transmission: 'Manual', 
        seats: 5,
        fuelType: 'Gasoline',
        available: true
    },
    {
        id: 3,
        model: "Test",
        brand: "Lorem",
        year: 2020,
        price: [
            { Location: "Manolo-CDO", Price_12_Hours: 1000, Price_24_Hours: 1300 },
            { Location: "Bukidnon/Mis. Or.", Price_12_Hours: 1400, Price_24_Hours: 1700 },
            { Location: "Outside Region 10", Price_12_Hours: 0, Price_24_Hours: 2000 },
        ],
        image: "null",
        transmission: 'Manual', 
        seats: 5,
        fuelType: 'Gasoline',
        available: true
    },
    {
        id: 4,
        model: "Test",
        brand: "Lorem",
        year: 2020,
        price: [
            { Location: "Manolo-CDO", Price_12_Hours: 1000, Price_24_Hours: 1300 },
            { Location: "Bukidnon/Mis. Or.", Price_12_Hours: 1400, Price_24_Hours: 1700 },
            { Location: "Outside Region 10", Price_12_Hours: 0, Price_24_Hours: 2000 },
        ],
        image: "null",
        transmission: 'Manual', 
        seats: 5,
        fuelType: 'Gasoline',
        available: true
    }
]