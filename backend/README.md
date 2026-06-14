# Amazon HackOn 2026 - Node.js Backend API

This directory contains the Express.js and PostgreSQL backend for the Smart Routing and Digital Product Passport modules.

## Features
- **RESTful API**: Serves JSON data to the React frontend on port `5000`.
- **Database Integration**: Connects to a local PostgreSQL instance to securely store routing decisions, inventory metrics, and immutable ledger events.
- **Dynamic Seeding**: Automatically bootstraps mock database tables (`products`, `locations`, `product_instances`, `grading_results`, `routing_decisions`, `product_events`) for demonstration purposes.

## Requirements
- Node.js
- PostgreSQL running locally (default config expects user `postgres`, password `postgres`, database `amazon_hackon`)
- A Google Gemini API Key (added to `.env`)

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amazon_hackon
   PORT=5000
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

3. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Key Endpoints
- `GET /api/inventory` - Fetch all products and their routing decisions for the Smart Routing dashboard.
- `POST /api/inventory` - Submit a new AI-graded routing decision.
- `GET /api/lifecycle` - Fetch the list of passports for the Lifecycle dashboard.
- `GET /api/lifecycle/:id` - Fetch deep lifecycle metrics, environmental impact, and immutable timeline events for a specific Digital Product Passport.
- `POST /api/grade-product` - Proxies image payload to Google Gemini 2.5 Flash for computer vision structural defect detection.
- `POST /api/grading-results` - Saves the AI inspection report, creates an immutable timeline event, and generates a new routing decision.
