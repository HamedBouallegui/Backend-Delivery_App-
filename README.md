- Overview

- REST API for authentication, products, orders, delivery flows, and admin user management.
- JWT authentication with role-based authorization; MongoDB via Mongoose.
- Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Environment variables set (see below)
- Install

- cd C:\Users\Hamed\Desktop\delivery_app\backend_app
- npm install
- Environment Variables

- PORT — default 5000
- MONGODB_URI — e.g. mongodb://127.0.0.1:27017/delivery_app or Atlas URI
- JWT_SECRET — secret for signing tokens
- Create .env :
  - PORT=5000
  - MONGODB_URI=mongodb://127.0.0.1:27017/delivery_app
  - JWT_SECRET=your_secret
- Run (Dev)

- npm start
- Server: http://localhost:5000
- Health: GET / → “Hello Backend from NodeJS!”
- API Highlights

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/users (ADMIN)
  - PUT /api/auth/users/:id (ADMIN)
  - DELETE /api/auth/users/:id (ADMIN)
- Products
  - GET /api/produits
  - POST /api/produits (COMMERCANT)
- Orders
  - POST /api/commandes (CLIENT)
  - PUT /api/commandes/:id/status (role-based)
  - GET /api/commandes/:id/track
  - GET /api/commandes/my (CLIENT)
  - GET /api/commandes/available (LIVREUR)
  - GET /api/commandes/my-deliveries (LIVREUR)
  - PUT /api/commandes/:id/assign (LIVREUR)
- Livreur
  - GET /api/livreurs/earnings (LIVREUR)
- Order Status Flow

- PENDING → ACCEPTED → ASSIGNED → ON_THE_WAY → DELIVERED (+ CANCELLED )
- Role-based transitions enforced in routes.
- Docker (Backend)

- Dockerfile: backend_app/Dockerfile
- Compose sets env: MONGODB_URI=mongodb://mongo:27017/mydb , PORT=5000
- Local build: docker build -t delivery-app-api .
- Run: docker run -p 5000:5000 -e MONGODB_URI=... -e JWT_SECRET=... delivery-app-api
- Full System (Compose)

- From project root C:\Users\Hamed\Desktop\delivery_app :
  - docker compose up --build -d
  - Logs: docker compose logs -f
  - Stop: docker compose down
- Services:
  - Web http://localhost:8080
  - API http://localhost:5000
  - Mongo (internal only)
- Troubleshooting

- If 404s occur after changing routes, restart the server.
- Verify MONGODB_URI and network access to Mongo.
- Ensure JWT_SECRET is set for non-dev environments.
