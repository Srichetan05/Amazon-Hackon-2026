# Amazon Digital Product Passport (Lifecycle Dashboard)

The Digital Product Passport module provides a comprehensive, immutable ledger of a returned product's journey. It tracks the item from the moment a return is initiated, through AI inspection, routing, and ultimate dispatch (Warehouse, Resale, or Recycle).

## Core Features

1. **Role-Based Views**
   - **👤 Customer View**: A sanitized, user-friendly interface that only shows major public milestones (Return Initiated, Refund Processed, etc.). It hides backend logistics routing and internal AI inspection notes.
   - **🔍 Inspector View**: A detailed view for Amazon Hub workers displaying the precise AI Confidence score, damage severity, and specific AI inspection bullets (e.g., "Scratches on bottom bezel").
   - **⚙️ Operations & Admin View**: The highest clearance level showing every single database transaction, backend event, and deep analytics.

2. **Immutable Timeline**
   - Every action taken in the `SmartRouting` engine automatically logs an event to the product's Lifecycle timeline via the PostgreSQL database.
   - Events are categorized by `type` and `visibility` (e.g., `PUBLIC`, `INTERNAL`, `BACKEND`).

3. **Sustainability Scorecard**
   - Calculates and displays the environmental impact of the routing decision.
   - For example, routing an item to Local Resale avoids the carbon emissions of flying it back to a central warehouse.

4. **QR Code Integration**
   - A unique QR code is generated for each product passport.
   - In a real-world scenario, this QR code would be printed and affixed to the physical box, allowing any downstream handler to scan and view the passport.

## Integration with Smart Routing

The Lifecycle Dashboard does not make routing decisions itself; it acts as the visualization layer for the PostgreSQL backend. When a worker in the **Smart Routing Engine** marks an item for "Local Resale", the Node.js backend (`/api/inventory`) fires a ledger update to the `lifecycle_events` table, which immediately populates on this dashboard.
