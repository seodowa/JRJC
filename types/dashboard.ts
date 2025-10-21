export interface DashboardCar {
    Model_ID: number;
    Model_Name: string;
    Year_Model: number;
    color_code: string;
    status: string;
    Transmission_Type: string;
    Manufacturer_Name: string;
    bookingDetails: {
        Customer_Full_Name: string;
        Duration: number;
        Location: string;
    } | null;
}