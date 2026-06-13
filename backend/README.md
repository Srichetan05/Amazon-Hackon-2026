# Amazon HackOn 2026 - Node.js Backend API

This directory contains the Express.js and PostgreSQL backend for the Smart Routing and Digital Product Passport modules.

## Features
- **RESTful API**: Serves JSON data to the React frontend on port `5000`.
- **Database Integration**: Connects to a local PostgreSQL instance to securely store routing decisions, inventory metrics, and immutable ledger events.
- **Dynamic Seeding**: Automatically bootstraps mock database tables (`products`, `locations`, `product_instances`, `grading_results`, `routing_decisions`, `product_events`) for demonstration purposes.

## Requirements
- Node.js
- PostgreSQL running locally (default config expects user `postgres`, password `postgres`, database `amazon_hackon`)

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```

3. Start production server:
   ```bash
   npm start
   ```

## Key Endpoints
- `GET /api/inventory` - Fetch all products and their routing decisions for the Smart Routing dashboard.
- `POST /api/inventory` - Submit a new AI-graded routing decision.
- `GET /api/lifecycle` - Fetch the list of passports for the Lifecycle dashboard.
- `GET /api/lifecycle/:id` - Fetch deep lifecycle metrics, environmental impact, and immutable timeline events for a specific Digital Product Passport.
