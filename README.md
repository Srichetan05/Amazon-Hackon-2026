# Amazon HackOn 2026: Sustainable Reverse Logistics

A robust, AI-driven solution designed to optimize Amazon's reverse logistics pipeline by minimizing unnecessary shipping costs and maximizing sustainability. This project consists of two primary modules that work together via a Node.js PostgreSQL backend.

## 1. Smart Routing Engine (`/src/components/SmartRouting`)
An intelligent logistics calculator used by Amazon Hub workers and delivery personnel. 
- Evaluates returned items using dynamic economic thresholds (distance × weight × shipping rate).
- Heavy or heavily damaged items that cost more to ship than their remaining value are intercepted immediately.
- Diverts intercepted items to **Local Resale** (sold locally at the hub for 3 days) or **Direct Recycle/Donation** to save on massive reverse-shipping carbon emissions.

## 2. Digital Product Passport (`/src/components/Lifecycle`)
A transparent, immutable lifecycle dashboard for every returned item.
- Tracks the custody chain from the initial customer return, through AI grading, all the way to final dispatch.
- Features Role-Based Access Control: Customers see a sanitized public timeline, while Amazon Inspectors and Admins see AI confidence scores, damage severity metadata, and backend routing logic.
- Generates a unique QR code for the physical box and calculates a live Sustainability Scorecard (Carbon Emissions, Miles, and Water saved).

## Tech Stack
- **Frontend**: React (Vite), vanilla CSS modules (Amazon.in Design DNA)
- **Backend**: Node.js, Express, PostgreSQL
- **Architecture**: REST API with real-time UI state synchronization

## Getting Started

1. Set up your PostgreSQL database and run the schema setup in `/backend`.
2. Start the backend server: `npm run dev` in the `/backend` directory.
3. Start the frontend Vite app: `npm run dev` in the root directory.