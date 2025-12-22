# Backend App - Delivery Application API

A RESTful API backend for a delivery application built with Node.js, Express, and MongoDB. This API supports multiple user roles (Admin, Client, Merchant, Delivery Driver) and provides comprehensive order management, product catalog, and delivery tracking features.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token-based session management

### User Management
- **4 User Roles:**
  - `ADMIN` - System administrators with full access
  - `CLIENT` - Customers who place orders
  - `COMMERCANT` - Merchants who sell products
  - `LIVREUR` - Delivery drivers who fulfill orders
- User registration and login
- Admin user management (approve, update, delete users)
- Delivery driver approval system

### Product Management
- Create and list products
- Merchant-specific product ownership
- Product availability tracking
- Product details (name, description, price, image)

### Order Management
- Complete order lifecycle management
- **Order Statuses:**
  - `PENDING` - Order placed, awaiting merchant acceptance
  - `ACCEPTED` - Merchant accepted, awaiting driver assignment
  - `ASSIGNED` - Driver assigned to delivery
  - `ON_THE_WAY` - Driver en route to delivery location
  - `DELIVERED` - Order successfully delivered
  - `CANCELLED` - Order cancelled
- Order tracking with real-time location updates
- Client location and delivery address management
- Payment method support (ONLINE, CASH)

### Delivery Management
- Available delivery requests for drivers
- Driver assignment to orders
- GPS-based location tracking (GeoJSON Point format)
- Delivery distance calculation
- Earnings tracking with period filters (today, week, month)
- Commission and tip management

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   cd backend_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/delivery_app
   JWT_SECRET=your_secret_key_here
   ```

4. **Ensure MongoDB is running:**
   
   **Windows:**
   ```powershell
   # Start MongoDB service
   Start-Service -Name MongoDB
   
   # Or via Services Manager (services.msc)
   ```

   **Linux/Mac:**
   ```bash
   sudo systemctl start mongod
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/register` | Register new user | No | - |
| POST | `/login` | Login user | No | - |
| GET | `/users` | Get all users (CLIENT/COMMERCANT) | Yes | ADMIN |
| PUT | `/users/:id` | Update user (approve/role) | Yes | ADMIN |
| DELETE | `/users/:id` | Delete user | Yes | ADMIN |

### Product Routes (`/api/produits`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all available products | No | - |
| POST | `/` | Create new product | Yes | COMMERCANT |

### Order Routes (`/api/commandes`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Create new order | Yes | CLIENT |
| GET | `/my` | Get client's orders | Yes | CLIENT |
| GET | `/available` | Get available deliveries | Yes | LIVREUR |
| GET | `/my-deliveries` | Get driver's assigned deliveries | Yes | LIVREUR |
| PUT | `/:id/status` | Update order status | Yes | Any authenticated |
| GET | `/:id/track` | Track order location | Yes | Any authenticated |
| PUT | `/:id/assign` | Assign order to driver | Yes | LIVREUR |

### Delivery Routes (`/api/livreurs`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/earnings` | Get earnings summary | Yes | LIVREUR |

**Query Parameters for `/earnings`:**
- `period`: Filter by time period (`today`, `week`, `month`)

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (ADMIN|CLIENT|LIVREUR|COMMERCANT),
  phone: String,
  address: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  merchant: ObjectId (ref: User),
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  client: ObjectId (ref: User),
  merchant: ObjectId (ref: User),
  livreur: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  paymentMethod: String (ONLINE|CASH),
  paymentStatus: String (PENDING|PAID|FAILED),
  deliveryFee: Number,
  tip: Number,
  commission: Number,
  deliveryDistance: Number,
  deliveryAddress: String,
  clientLocation: GeoJSON Point,
  livreurLocation: GeoJSON Point,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example Request
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5000/api/commandes/my
```

## 🧪 Testing

Currently, no automated tests are configured. To test the API:

1. **Manual Testing:** Use tools like Postman, Insomnia, or curl
2. **Test Data:** Create test users for each role
3. **Test Workflow:**
   - Register users (CLIENT, COMMERCANT, LIVREUR)
   - Login to get JWT tokens
   - Create products as COMMERCANT
   - Place orders as CLIENT
   - Accept and deliver orders as LIVREUR

### Sample Test Workflow

```bash
# 1. Register a client
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"CLIENT"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 3. Get products
curl http://localhost:5000/api/produits
```

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
backend_app/
├── config/
│   └── db.js              # Database connection configuration
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User model schema
│   ├── Product.js         # Product model schema
│   └── Order.js           # Order model schema
├── routes/
│   ├── authRoutes.js      # Authentication & user management routes
│   ├── productRoutes.js   # Product management routes
│   ├── orderRoutes.js     # Order management routes
│   └── livreurRoutes.js   # Delivery driver routes
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore file
├── index.js              # Application entry point
├── package.json          # Project dependencies
└── README.md             # This file
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Ensure MongoDB service is running
2. Check MongoDB connection string in `.env`
3. Verify MongoDB is listening on port 27017

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change the PORT in `.env` file
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   ```

## 🔐 Security Considerations

- Always use strong JWT secrets in production
- Enable HTTPS in production environments
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use environment variables for sensitive data
- Regularly update dependencies for security patches

