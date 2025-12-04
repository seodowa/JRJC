JRJC Car Rental Booking System 🚗💨

A modern web application for browsing, managing, and booking car rentals. Built with React for a responsive frontend and Supabase for a robust, real-time backend.

📋 Project Overview

The JRJC Booking System streamlines the vehicle rental process. It allows users to browse available cars, view details, and book rentals for specific dates. It includes real-time availability checks and user authentication managed securely via Supabase.

🛠️ Tech Stack

Frontend: React (Vite), CSS/Tailwind (Assumed)

Backend: Supabase (PostgreSQL)

Authentication: Supabase Auth

Routing: React Router DOM

✨ Key Features

Vehicle Catalog: Browse a list of available cars with images, prices, and specifications.

Smart Booking Engine: Select pick-up and drop-off dates with automatic availability conflicts validation.

User Accounts: Secure sign-up/login to manage personal bookings.

Real-time Updates: Instant reflection of booking status (Preventing double bookings).

Responsive Design: optimized for both desktop and mobile users.

🚀 Getting Started

Prerequisites

Node.js (v16+)

npm or yarn

A Supabase project setup

Installation

Clone the repository:

git clone [https://github.com/your-username/jrjc-booking.git](https://github.com/your-username/jrjc-booking.git)
cd jrjc-booking


Install dependencies:

npm install


Environment Setup:
Create a .env file in the root directory and add your Supabase credentials:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


Run the development server:

npm run dev


🗄️ Database Schema (Supabase)

This project relies on the following tables in Supabase:

cars: Stores vehicle details (make, model, year, price_per_day, image_url).

bookings: Stores reservation data (car_id, user_id, start_date, end_date, total_price).

profiles: (Optional) Extended user information linked to auth.users.

🤝 Contributing

Fork the repository.

Create a feature branch (git checkout -b feature/NewFeature).

Commit your changes (git commit -m 'Add some NewFeature').

Push to the branch (git push origin feature/NewFeature).

Open a Pull Request.

📜 License

All Rights Reserved.
