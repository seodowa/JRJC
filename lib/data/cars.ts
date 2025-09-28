import type { Car } from "@/types";

// mock data

export const cars: Car[] = [
    {
        id: "1",
        model: "Wigo G",
        brand: "Toyota",
        year: 2020,
        price: [
            { location: "Manolo-CDO", price_12_hours: 1000, price_24_hours: 1300 },
            { location: "Bukidnon/Mis. Or.", price_12_hours: 1400, price_24_hours: 1700 },
            { location: "Outside Region 10", price_12_hours: 0, price_24_hours: 2000 },
        ],
        image: "https://scontent.fcgy1-3.fna.fbcdn.net/v/t39.30808-6/547065267_122233049528183073_581477742412709264_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeE_GAcbJ57jfu7jSnShvUcsDqYUQesSRc4OphRB6xJFznrPiVxI8RHaRElnSOmGgKHzoiiUFhgIj_-rLUn9u7_B&_nc_ohc=z9ubZfjzax0Q7kNvwHw0iKQ&_nc_oc=AdnoIYb7jGQg48SuoyL9DFGW7ZTbZdI1vHNSxVT0Qc5JUFqTb5z1V6KIolTxCqVP_iWf_JYRBnZ0v446lNpMPYh5&_nc_zt=23&_nc_ht=scontent.fcgy1-3.fna&_nc_gid=897O8-TGRa4m6Gw-ZcrtHQ&oh=00_AfYowU7y_ZT3UzclvRtOA5NIcQmCPrT4JlfjsjUKj6nDLw&oe=68DF0473",
        transmission: 'Manual', 
        seats: 5,
        fuelType: 'Gasoline',
        available: true
    }
]