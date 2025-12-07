# Employee Shift Board

A full-stack shift management application for scheduling and managing employee work shifts. Built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication** - JWT-based login and signup
- **Role-Based Access Control** - Admin and Employee roles
- **Shift Management** - Create, view, and delete shifts
- **Overlap Prevention** - Automatically blocks conflicting shifts
- **Duration Validation** - Enforces 4-12 hour shift limits
- **Date Filtering** - Filter shifts by specific dates

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT  
**Deployment:** Vercel (Frontend), Render (Backend)

## Live Demo

- **Frontend:** [https://employee-shift-board0.vercel.app](https://employee-shift-board0.vercel.app)
- **Backend API:** [https://employee-shift-board-api.onrender.com](https://employee-shift-board-api.onrender.com)

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/employee-shift-board.git
cd employee-shift-board
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-shift-board
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:

```bash
node server.js
```

Seed the database with test users (optional):

```bash
node seed.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Getting Started

Use the **Sign Up** page to create a new account, or run `node seed.js` locally to populate test data.

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

#### POST /auth/signup
Register a new employee account.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Account created",
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### GET /auth/employees
Get list of employees (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "employees": [
    { "_id": "...", "name": "John Doe" },
    { "_id": "...", "name": "Jane Smith" }
  ]
}
```

### Shifts

#### POST /shifts
Create a new shift (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "userId": "employee-id",
  "date": "2025-12-07",
  "startTime": "2025-12-07T09:00:00",
  "endTime": "2025-12-07T17:00:00"
}
```

**Response:**
```json
{
  "message": "Shift created",
  "shift": { ... }
}
```

**Validation:**
- Shift must be 4-12 hours
- Cannot overlap with existing shifts for the same employee

#### GET /shifts
Get all shifts (Admin) or own shifts (Employee).

**Headers:** `Authorization: Bearer <token>`

**Query Params:** `?date=2025-12-07` (optional filter)

**Response:**
```json
{
  "shifts": [
    {
      "_id": "...",
      "userId": { "name": "John Doe", "email": "..." },
      "date": "2025-12-07",
      "startTime": "2025-12-07T09:00:00.000Z",
      "endTime": "2025-12-07T17:00:00.000Z"
    }
  ]
}
```

#### DELETE /shifts/:id
Delete a shift.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Shift deleted"
}
```

### Health Check

#### GET /health
Check API status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-07T17:00:00.000Z",
  "uptime": 3600
}
```

---

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = Your Render backend URL + `/api`

### Backend (Render)

1. Create a new Web Service
2. Connect GitHub repository
3. Set root directory: `backend`
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure secret key
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `NODE_ENV` - `production`

---

## Project Structure

```
employee-shift-board/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── shiftController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Shift.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── shiftRoutes.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## Known Issues

1. **Session Persistence** - Token stored in localStorage; consider httpOnly cookies for production
2. **No Password Reset** - Password recovery not implemented
3. **No Shift Editing** - Currently only create/delete; update functionality pending

---

## License

MIT License

---

## Author

Built for the Employee Shift Board Assessment
