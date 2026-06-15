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

## 3. AI Visual Product Grading (`/src/components/Grading`)
An advanced computer vision dashboard for warehouse inspectors.
- Uses Google Gemini 2.5 Flash to visually inspect images of returned products and identify structural defects like torn soles or scratched casing.
- Generates precise, dynamic CSS bounding boxes to highlight detected damage on the original image.
- Calculates automated Repairability and Value Recovery scores to assist in determining the optimal downstream routing decision.

## Tech Stack
- **Frontend**: React (Vite), vanilla CSS modules (Amazon.in Design DNA)
- **Backend**: Node.js, Express, PostgreSQL
- **AI/ML**: Google Gemini Pro Vision API
- **Architecture**: REST API with real-time UI state synchronization

## Getting Started

1. Set up your PostgreSQL database and run the schema setup in `/backend`.
2. Ensure you have added your `GEMINI_API_KEY` to the `.env` file in the backend.
3. Start the backend server: `npm run dev` in the `/backend` directory.
4. Start the frontend Vite app: `npm run dev` in the `frontend` directory.

## Live URL
[http://amazonhackon2026.s3-website.ap-south-1.amazonaws.com/](http://amazonhackon2026.s3-website.ap-south-1.amazonaws.com/)

## Contributors
- [G.Srichetan Reddy](https://github.com/Srichetan05)
- [Devendra Chand](https://github.com/DEV-endra)
