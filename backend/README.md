# Food Delivery & Driver Allocation System — Core Backend (Role 4)

This service provides the core Express.js REST API, MongoDB data models, centralized Order State Machine, and lifecycle business workflows for our MERN-stack Food Delivery and Driver Allocation System.

---

## 1. Role 4 Scope & System Boundaries

As **Role 4: Backend Core & Order Workflow Engineer**, this module owns:
- Express REST API framework & HTTP pipeline
- Mongoose schemas (`Restaurant`, `MenuItem`, `Order` with embedded `OrderItem` snapshots)
- Centralized Order State Machine & transition enforcement
- Strict server-side financial calculations (in integer paise to prevent floating-point inaccuracies)
- Menu querying, full-text search, filtering, sorting & MongoDB pagination
- Role 5 driver-assignment integration interface (`assignDriver`)
- Standardized success (`200`/`201`) and error responses (`400`/`404`/`409`/`500`)
- Development database seeder and test suite (Jest + Supertest + MongoMemoryServer)

### Explicit Boundaries (Other Roles' Ownership)
- **Role 1 (Customer UI)**: React customer app, menu cart, and checkout UI.
- **Role 2 (Restaurant UI)**: Restaurant dashboard for accepting/preparing orders.
- **Role 3 (Driver UI & Live Tracking)**: Driver React UI and Socket.IO real-time location.
- **Role 5 (Driver Allocation Algorithm)**: Nearest driver heuristics, ranking, and workload algorithms (they invoke our `assignDriver(orderId, driverId)` endpoint/service).
- **Role 6 (Security & Auth)**: JWT authentication, password hashing, and role-based route guards.

---

## 2. Technology Stack & Prerequisites

- **Runtime**: Node.js (`v18+` or `v20+`, verified on Node `v24.15.0`)
- **Package Manager**: npm (`v9+` or `v10+`)
- **Web Framework**: Express.js (`4.x`)
- **Database**: MongoDB (`v6.0+` or `v7.0+`) with Mongoose (`8.x`)
- **Testing**: Jest (`29.x`), Supertest (`7.x`), MongoMemoryServer (`10.x`)
- **Security & Logging**: Helmet, CORS, Morgan, Express-Validator

---

## 3. Directory Layout

```
Food-Delivery-And-Driver-Allocation/
└── backend/
    ├── src/
    │   ├── config/
    │   │   └── db.js                 # Mongoose connection & graceful shutdown
    │   ├── controllers/
    │   │   ├── orderController.js    # Thin controller for order endpoints
    │   │   ├── menuController.js     # Thin controller for menu & restaurant items
    │   │   └── healthController.js   # Health probe endpoint
    │   ├── middleware/
    │   │   ├── errorHandler.js       # Centralized error middleware with standardized error JSON
    │   │   ├── notFoundHandler.js    # 404 Route Not Found middleware
    │   │   └── requestValidator.js   # express-validator formatter
    │   ├── models/
    │   │   ├── Restaurant.js         # Restaurant schema + indexes
    │   │   ├── MenuItem.js           # MenuItem schema + category/price/search indexes
    │   │   └── Order.js              # Order schema with embedded OrderItem snapshots
    │   ├── repositories/
    │   │   ├── orderRepository.js    # Decoupled Order data access & pagination
    │   │   └── menuRepository.js     # Decoupled Restaurant and Menu data access
    │   ├── routes/
    │   │   ├── orderRoutes.js        # /api/orders routing
    │   │   ├── restaurantRoutes.js   # /api/restaurants routing
    │   │   ├── menuRoutes.js         # /api/menu routing
    │   │   ├── healthRoutes.js       # /api/health routing
    │   │   └── index.js              # Aggregated root router (/api)
    │   ├── services/
    │   │   ├── orderService.js       # Business logic, state transitions, price calculations
    │   │   └── menuService.js        # Menu search, category filter, price sort, pagination
    │   ├── utils/
    │   │   ├── apiError.js           # Custom ApiError class with status and errorCode
    │   │   ├── apiResponse.js        # Standardized success and error envelope helpers
    │   │   ├── errorCodes.js         # Standard application error codes constant
    │   │   ├── money.js              # Integer paise arithmetic helper functions
    │   │   ├── orderStateMachine.js  # Centralized order transition matrix & validator
    │   │   └── orderStatus.js        # OrderStatus enum constants
    │   └── app.js                    # Express application configuration
    ├── scripts/
    │   └── seed.js                   # Development seed script (3 restaurants, 21 menu items)
    ├── tests/
    │   ├── setup.js                  # In-memory MongoMemoryServer lifecycle for tests
    │   ├── unit/
    │   │   ├── orderStateMachine.test.js # State transition matrix tests
    │   │   └── orderService.test.js      # Pricing, validation, and driver assign unit tests
    │   └── integration/
    │       ├── orders.test.js        # Order lifecycle, transitions, pagination, & errors
    │       ├── menu.test.js          # Menu filtering, search, sorting, & pagination
    │       └── health.test.js        # Health check test
    ├── server.js                     # HTTP server bootstrapper with port conflict resolution
    ├── package.json
    ├── .env.example
    └── README.md
```

---

## 4. Setup & Running Locally

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/food_delivery
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DEFAULT_DELIVERY_FEE_PAISE=4000
```
*(Note: Port 5001 is used by default because macOS ControlCenter / AirPlay Receiver frequently occupies port 5000).*

### Step 3: Start MongoDB
Ensure MongoDB is running locally on port 27017 or provide a cloud MongoDB Atlas connection URI in `.env`.

### Step 4: Seed Development Data
Populates 3 restaurants (Spice Symphony, Bella Italia Pizzeria, Dragon Wok Kitchen) and 21 categorized dishes:
```bash
npm run seed
```

### Step 5: Start the Server
- Development mode (with nodemon):
  ```bash
  npm run dev
  ```
- Standard start:
  ```bash
  npm start
  ```

### Step 6: Run Tests
Automated tests run against an isolated, hermetic in-memory MongoDB (`mongodb-memory-server`):
```bash
npm test
```

---

## 5. Monetary Calculation Standard

> [!IMPORTANT]
> **Zero Floating-Point Imprecision Policy**:
> All prices and monetary amounts are strictly calculated and stored as **integer paise** (₹1 = 100 paise).
> - ₹250.00 is stored as `25000`
> - ₹40.00 delivery fee is stored as `4000`
> - Never trust prices from the frontend. The backend queries MongoDB for the item price snapshot and computes `subtotal = sum(unitPrice * quantity)` and `totalAmount = subtotal + deliveryFee`.

---

## 6. Centralized Order State Machine

The order lifecycle is governed by a centralized transition matrix in [orderStateMachine.js](file:///Users/anushabr/Documents/Food-Delivery-And-Driver-Allocation/backend/src/utils/orderStateMachine.js).

```
   [ PLACED ]
     ├───► RESTAURANT_ACCEPTED ───► PREPARING ───► READY ───► DRIVER_ASSIGNED ───► PICKED_UP ───► DELIVERED (Terminal)
     └───► REJECTED (Terminal)
```

### Allowed Transitions:
1. `PLACED` &rarr; `RESTAURANT_ACCEPTED`
2. `PLACED` &rarr; `REJECTED`
3. `RESTAURANT_ACCEPTED` &rarr; `PREPARING`
4. `PREPARING` &rarr; `READY`
5. `READY` &rarr; `DRIVER_ASSIGNED` (via `assignDriver` or status update)
6. `DRIVER_ASSIGNED` &rarr; `PICKED_UP`
7. `PICKED_UP` &rarr; `DELIVERED`

### Invalid Transitions:
Any transition not explicitly allowed above (e.g. `PLACED` &rarr; `DELIVERED`, `PREPARING` &rarr; `DELIVERED`, `DELIVERED` &rarr; `PREPARING`, `REJECTED` &rarr; `PREPARING`) will be rejected with HTTP **`409 Conflict`** and errorCode `ORDER_INVALID_TRANSITION`.

---

## 7. Standardized API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "errorCode": null,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Order cannot transition from PLACED to DELIVERED",
  "errorCode": "ORDER_INVALID_TRANSITION",
  "data": null
}
```

### Standard Error Codes:
- `ORDER_NOT_FOUND`: Order ID does not match any record.
- `ORDER_INVALID_TRANSITION`: Requested state transition violates the state machine.
- `RESTAURANT_NOT_FOUND`: Specified restaurant ID not found.
- `RESTAURANT_INACTIVE`: Restaurant is marked inactive (`active: false`).
- `MENU_ITEM_NOT_FOUND`: Menu item ID does not exist.
- `MENU_ITEM_UNAVAILABLE`: Item is currently out of stock (`available: false`).
- `MENU_ITEM_WRONG_RESTAURANT`: Item does not belong to the order's restaurant.
- `INVALID_QUANTITY`: Quantity is &le; 0 or not an integer.
- `INVALID_STATUS`: Status string is not a recognized enum value.
- `INVALID_ID`: MongoDB ObjectId is malformed.
- `VALIDATION_ERROR`: Field validation failed (e.g. missing required field).
- `DRIVER_ASSIGNMENT_INVALID`: Attempted to assign driver when status is not `READY`.
- `INTERNAL_SERVER_ERROR`: Unhandled server exception.

---

## 8. API Contract & Endpoint Documentation

### 1. Health Probe
- **Endpoint**: `GET /api/health`
- **Description**: Probes service liveness.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Food Delivery Backend is running",
    "errorCode": null,
    "data": null
  }
  ```

---

### 2. Create Order
- **Endpoint**: `POST /api/orders`
- **Description**: Creates a new order. Server validates item ownership, availability, recalculates total using integer paise, and assigns `PLACED` status.
- **Request Body**:
  ```json
  {
    "customerId": "customer-101",
    "restaurantId": "6aaf9b7af06f74790d5a0dde",
    "deliveryAddress": "Flat 301, Palm Meadows, Bangalore",
    "items": [
      { "menuItemId": "6aaf9b7bf06f74790d5a0de9", "quantity": 2 },
      { "menuItemId": "6aaf9b7bf06f74790d5a0deb", "quantity": 1 }
    ]
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "errorCode": null,
    "data": {
      "_id": "6aaf9c26cc9f185a78036c99",
      "customerId": "customer-101",
      "restaurantId": "6aaf9b7af06f74790d5a0dde",
      "driverId": null,
      "items": [
        {
          "menuItemId": "6aaf9b7bf06f74790d5a0de9",
          "itemNameSnapshot": "Dum Pukht Chicken Biryani",
          "unitPrice": 34900,
          "quantity": 2,
          "subtotal": 69800
        },
        {
          "menuItemId": "6aaf9b7bf06f74790d5a0deb",
          "itemNameSnapshot": "Butter Garlic Naan",
          "unitPrice": 6500,
          "quantity": 1,
          "subtotal": 6500
        }
      ],
      "subtotal": 76300,
      "deliveryFee": 4000,
      "totalAmount": 80300,
      "deliveryAddress": "Flat 301, Palm Meadows, Bangalore",
      "status": "PLACED",
      "createdAt": "2026-09-20T08:41:10.748Z",
      "updatedAt": "2026-09-20T08:41:10.748Z"
    }
  }
  ```

---

### 3. List Orders (Paginated & Filtered)
- **Endpoint**: `GET /api/orders`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `status` (string, e.g. `PLACED`, `PREPARING`, `READY`, `DELIVERED`)
  - `customerId` (string)
  - `restaurantId` (MongoDB ObjectId)
  - `driverId` (string)
  - `sortBy` (whitelisted: `createdAt`, `totalAmount`, `subtotal`, `status`, default: `createdAt`)
  - `sortOrder` (`asc` or `desc`, default: `desc`)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Orders retrieved successfully",
    "errorCode": null,
    "data": {
      "items": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 24,
        "totalPages": 3
      }
    }
  }
  ```

---

### 4. Get Order Details
- **Endpoint**: `GET /api/orders/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Order retrieved successfully",
    "errorCode": null,
    "data": {
      "_id": "6aaf9c26cc9f185a78036c99",
      "customerId": "customer-101",
      "restaurantId": {
        "_id": "6aaf9b7af06f74790d5a0dde",
        "name": "Spice Symphony",
        "address": "102 MG Road, Bangalore"
      },
      "driverId": "driver-arjun-42",
      "items": [ ... ],
      "subtotal": 76300,
      "deliveryFee": 4000,
      "totalAmount": 80300,
      "deliveryAddress": "Flat 301, Palm Meadows, Bangalore",
      "status": "READY",
      "createdAt": "2026-09-20T08:41:10.748Z",
      "updatedAt": "2026-09-20T08:41:33.694Z"
    }
  }
  ```

---

### 5. Transition Order Status
- **Endpoint**: `PATCH /api/orders/:id/status`
- **Description**: Advances the order lifecycle. Strictly verified by the centralized state machine.
- **Request Body**:
  ```json
  {
    "status": "RESTAURANT_ACCEPTED"
  }
  ```
- **Response** (`200 OK`): Returns updated order object.
- **Error Response** (`409 Conflict`):
  ```json
  {
    "success": false,
    "message": "Order cannot transition from PLACED to DELIVERED",
    "errorCode": "ORDER_INVALID_TRANSITION",
    "data": null
  }
  ```

---

### 6. Assign Driver (Role 5 Integration Point)
- **Endpoint**: `PATCH /api/orders/:id/assign-driver`
- **Description**: Assigns a driver to an order. Requires the order to be in `READY` status. Transitions status directly to `DRIVER_ASSIGNED`.
- **Request Body**:
  ```json
  {
    "driverId": "driver-arjun-42"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Driver assigned successfully",
    "errorCode": null,
    "data": {
      "_id": "6aaf9c26cc9f185a78036c99",
      "driverId": "driver-arjun-42",
      "status": "DRIVER_ASSIGNED"
    }
  }
  ```
- **Error Response** (`409 Conflict`):
  ```json
  {
    "success": false,
    "message": "Cannot assign driver: Order status must be READY, but is currently PREPARING",
    "errorCode": "DRIVER_ASSIGNMENT_INVALID",
    "data": null
  }
  ```

---

### 7. Get Restaurant Menu
- **Endpoint**: `GET /api/restaurants/:restaurantId/menu`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string text search in item name & description)
  - `category` (string, e.g. `Pizza`, `Biryani`, `Appetizers`)
  - `available` (boolean string `true` / `false`)
  - `sortBy` (whitelisted: `price`, `name`, `createdAt`, `category`, default: `createdAt`)
  - `sortOrder` (`asc` / `desc`, default: `desc`)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Menu items retrieved successfully",
    "errorCode": null,
    "data": {
      "restaurant": {
        "id": "6aaf9b7af06f74790d5a0dde",
        "name": "Spice Symphony",
        "address": "102 MG Road, Indiranagar, Bangalore",
        "active": true
      },
      "items": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 7,
        "totalPages": 1
      }
    }
  }
  ```

---

### 8. Get Single Menu Item
- **Endpoint**: `GET /api/menu/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Menu item retrieved successfully",
    "errorCode": null,
    "data": {
      "_id": "6aaf9b7bf06f74790d5a0de9",
      "restaurantId": {
        "_id": "6aaf9b7af06f74790d5a0dde",
        "name": "Spice Symphony",
        "active": true
      },
      "name": "Dum Pukht Chicken Biryani",
      "category": "Biryani",
      "price": 34900,
      "available": true
    }
  }
  ```

---

### 9. Get Restaurant Orders (Role 2 Integration Point)
- **Endpoint**: `GET /api/restaurants/:restaurantId/orders`
- **Query Parameters**: `status`, `page`, `limit`, `sortBy`, `sortOrder`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Restaurant orders retrieved successfully",
    "errorCode": null,
    "data": {
      "items": [ ... ],
      "pagination": { "page": 1, "limit": 10, "totalItems": 15, "totalPages": 2 }
    }
  }
  ```

---

## 9. Team Integration Guide

### For Role 1: Customer Frontend Lead
- **Browse Menu**: Call `GET /api/restaurants/:restaurantId/menu?category=Pizza&available=true` to display dishes.
- **Create Order**: On cart checkout, send `POST /api/orders` with `customerId`, `restaurantId`, `deliveryAddress`, and `items` (array of `menuItemId` and `quantity`). Note: Do not calculate or send prices from the frontend.
- **Track Order**: Call `GET /api/orders/:id` to check the current `status` as the order progresses.

### For Role 2: Restaurant & Admin Dashboard Developer
- **Incoming Orders**: Call `GET /api/restaurants/:restaurantId/orders?status=PLACED` to view orders needing review.
- **Accept Order**: Call `PATCH /api/orders/:id/status` with `{"status": "RESTAURANT_ACCEPTED"}`.
- **Reject Order**: Call `PATCH /api/orders/:id/status` with `{"status": "REJECTED"}`.
- **Start Cooking**: Call `PATCH /api/orders/:id/status` with `{"status": "PREPARING"}`.
- **Mark Order Food Ready**: Call `PATCH /api/orders/:id/status` with `{"status": "READY"}`. This triggers the order to become eligible for driver assignment.

### For Role 3: Driver Interface Lead
- **Pickup Order**: Once assigned, driver clicks "Picked Up" &rarr; call `PATCH /api/orders/:id/status` with `{"status": "PICKED_UP"}`.
- **Complete Delivery**: Driver clicks "Delivered" &rarr; call `PATCH /api/orders/:id/status` with `{"status": "DELIVERED"}`.
- **Real-Time WebSockets**: Role 3 can listen to state changes or emit socket events when these endpoints return 200.

### For Role 5: Driver Allocation Algorithm Engineer
- **Integration Function**: You can import `orderService.assignDriver(orderId, driverId)` or send an HTTP request:
  ```http
  PATCH /api/orders/:orderId/assign-driver
  Content-Type: application/json

  {
    "driverId": "<allocated-driver-id>"
  }
  ```
- **Prerequisite**: Ensure the order's status has reached `READY`. If called prematurely, it returns `409 Conflict` with `DRIVER_ASSIGNMENT_INVALID`.

### What Role 6 (Auth & DevOps) Needs to Integrate
- **Authentication**: Add JWT verification middleware (e.g. `authMiddleware`) on `/api/orders` routes. The middleware can read `req.user.id` and populate `customerId` automatically instead of relying on client-supplied body fields.
- **Authorization**: Restrict `PATCH /api/orders/:id/assign-driver` to internal service calls or admin/dispatch roles.
- **Health & Monitoring**: Extend `GET /api/health` with database ping response times, memory statistics, and uptime probes.
