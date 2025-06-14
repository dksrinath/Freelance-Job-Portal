# Freelancer Job Board

A modern MERN stack platform connecting clients with talented freelancers.

## Features

- **Client Features**: Post jobs, review proposals, manage projects
- **Freelancer Features**: Browse jobs, submit proposals, manage profile
- **Authentication**: Secure JWT-based login system
- **Modern UI**: Responsive design with unified theme

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens, bcryptjs

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment**:
   Create `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/freelancer-job-board
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
├── backend/
│   ├── models/index.js     # Database schemas
│   ├── routes/index.js     # API endpoints
│   ├── server.js           # Express server
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Authentication context
│   │   └── index.css      # Unified styling
│   └── public/
└── package.json           # Root scripts
```

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run client` - Start frontend only
- `npm run server` - Start backend only
- `npm run build` - Build for production
- `npm run install-all` - Install all dependencies

## Author

**Srinath D K**

Built as part of internship assignment demonstrating full-stack development skills.
