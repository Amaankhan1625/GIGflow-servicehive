# GigFlow

## Project Overview

GigFlow is a mini-freelance marketplace platform. The goal is to build a system where Clients can post jobs (Gigs) and Freelancers can apply for them (Bids). This assignment tests your ability to handle complex database relationships, secure authentication, and state management.


## Technical Stack

- **Frontend:** React.js (Vite preferred) + Tailwind CSS.
- **Backend:** Node.js + Express.js.
- **Database:** MongoDB (via Mongoose).
- **State Management:** Redux Toolkit.
- **Authentication:** JWT (JSON Web Tokens) with HttpOnly cookies.

## Core Features

### A. User Authentication
- Secure Sign-up and Login.
- Roles are fluid: Any user can post a job (Client) or bid on a job (Freelancer).

### B. Gig Management (CRUD)
- Browse Gigs: A public/private feed showing all "Open" jobs.
- Search/Filter: Users should be able to search for jobs by title.
- Job Posting: A form for logged-in users to post a job with Title, Description, and Budget.

### C. The "Hiring" Logic (Crucial)
1. Bidding: A freelancer submits a "Bid" (message + price) on a gig.
2. Review: The Client who posted the job sees a list of all Bids.
3. Hiring: The Client clicks a "Hire" button on one specific Bid.
   - Logic: The Gig status must change from open to assigned.
   - Logic: The chosen Bid status becomes hired.
   - Logic: All other Bids for that same Gig should automatically be marked as rejected.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance, e.g., MongoDB Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` (if provided) with the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for JWT tokens
   - `PORT`: Port for the server (default: 5000)
4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Usage
- Access the frontend at `http://localhost:5173` (default Vite port).
- The backend API will be running on `http://localhost:5000` (or as specified in .env).

## API Architecture

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Auth | POST | /api/auth/register | Register new user. |
| Auth | POST | /api/auth/login | Login & set HttpOnly Cookie. |
| Gigs | GET | /api/gigs | Fetch all open gigs (with search query). |
| Gigs | POST | /api/gigs | Create a new job post. |
| Bids | POST | /api/bids | Submit a bid for a gig. |
| Bids | GET | /api/bids/:gigId | Get all bids for a specific gig (Owner only). |
| Hiring | PATCH | /api/bids/:bidId/hire | The "Hire" logic (Atomic update). |

## Database Schema

- **User:** name, email, password.
- **Gig:** title, description, budget, ownerId, status (open or assigned).
- **Bid:** gigId, freelancerId, message, status (pending, hired, rejected).

## Bonus Features

### Bonus 1: Transactional Integrity (Race Conditions)
Implement the "Hire" logic using MongoDB Transactions or a highly secure logic flow. Ensure that if two people click "Hire" on different freelancers at the exact same time, the system only allows one to be hired and prevents the other.

### Bonus 2: Real-time Updates
Integrate Socket.io. When a Client hires a Freelancer, the Freelancer should receive an instant, real-time notification in their dashboard saying, "You have been hired for [Project Name]!" without having to refresh their page.



