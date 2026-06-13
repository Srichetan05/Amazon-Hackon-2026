# Smart Routing Engine

This module implements an intelligent, dynamic reverse logistics and routing engine for returned Amazon products. It is designed to be used internally by Amazon Hub workers and Delivery Executives to process returned inventory efficiently and protect bottom-line margins.

## Core Features

1. **Dynamic Economic Thresholds**
   - The engine calculates the logistics cost based on **distance × physical weight × logistics rate**.
   - Products are evaluated against their **Original MSRP**. The allowable threshold to ship an item back to a main Amazon warehouse is dynamic:
     - **New / Open Box**: 20% of original price
     - **Minor Damage**: 12% of original price
     - **Major Damage**: 8% of original price
   - *Result*: A heavy, majorly damaged product will incur high shipping costs but has a strict low threshold. It will quickly fail the threshold check and be routed to **Local Resale**, saving Amazon money on reverse logistics.

2. **Categorical Damage Depreciation**
   - If an item fails the shipping threshold, it is listed locally at the current hub for a discounted price.
   - The discount is dynamically calculated based on the product category (e.g., Electronics depreciate less, Appliances depreciate more) and the severity of the damage.

3. **Direct Recycle Dispatch**
   - Products marked as **Irrepairable** bypass the economic engine entirely. They are routed directly to the nearest certified recycling facility.

4. **Local Hub Marketplace & Dispatch Management**
   - Products assigned for local resale are held at the worker's current Amazon Hub for up to `LOCAL_RESALE_WINDOW_DAYS` (3 days).
   - If unsold after the window expires, functional items are automatically dispatched to donation centres, while damaged items are dispatched to recycling facilities.
   - Both the Local Resale and Recycle/Donate boards feature robust search capabilities filtering against product names, categories, and hub locations.

## Architecture Overview

- **`utils/routingEngine.js`**: Contains the core logic for computing distances, calculating dynamic shipping costs, applying categorical discounts, and deriving final routing decisions (`WAREHOUSE`, `LOCAL_RESALE`, `DIRECT_RECYCLE`).
- **`data/mockData.js`**: Contains the sample mock inventory, damage multipliers, and delivery point registries.
- **Pages**:
  - `RoutePage.jsx`: The primary dashboard for evaluating and routing a single returned product.
  - `ResalePage.jsx`: The marketplace board tracking local resale inventory held at the current hub.
  - `RecyclePage.jsx`: The dispatch board for items that have timed out of their local resale window or are irrepairable.
