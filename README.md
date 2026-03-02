# Meridian Frontend

Meridian is a comprehensive logistics and delivery management platform. The `meridian-frontend` application serves as the primary user interface to interact with the Meridian microservices ecosystem, allowing administrators and operators to monitor deliveries, manage vehicles and drivers, track routes, and handle assignments in real-time.

This project is built with [Next.js](https://nextjs.org/) and interacts with the various backend microservices through the API Gateway.

## Features

- **Dashboard**: High-level overview of system metrics and active operations.
- **Delivery Management**: View, create, and manage deliveries.
- **Driver Management**: Manage driver profiles, availability, and assignments.
- **Vehicle Management**: Track vehicle status, maintenance, and allocation.
- **Route Tracking**: Real-time tracking of active routes and deliveries.
- **Assignment Service**: Efficiently assign drivers and vehicles to deliveries.

## Screenshots

### Dashboard Overview
![Dashboard Overview Placeholder](./docs/screenshots/dashboard_placeholder.png)
*A high-level view of active deliveries, available drivers, and vehicle statuses.*

### Real-Time Route Tracking
![Route Tracking Placeholder](./docs/screenshots/tracking_placeholder.png)
*Live tracking interface showing active delivery routes on the map.*

### Delivery Management
![Delivery Management Placeholder](./docs/screenshots/delivery_placeholder.png)
*Interface for creating and managing delivery details and statuses.*

*(Note: Add actual screenshots to the `docs/screenshots` directory as the UI is finalized.)*

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm, yarn, pnpm, or bun

Ensure the Meridian Backend microservices and the API Gateway are running locally or accessible via your environment configuration.

### Installation

Clone the repository and install the dependencies:

```bash
cd meridian-frontend
npm install
# or
yarn install
```

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `app/`: Next.js App Router containing pages and layouts.
- `components/`: Reusable UI components.
- `lib/` or `utils/`: Utility functions and API client configurations.
- `types/`: TypeScript definitions for the domain models (e.g., Deliveries, Drivers, Vehicles).

## Backend Integration

This frontend communicates directly with the Meridian backend through the **API Gateway**. Ensure your `.env.local` contains the correct API Gateway URL (typically `http://localhost:5050` for local development) to ensure seamless data fetching.
