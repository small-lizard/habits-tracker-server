# Habit Tracker
Full-stack web application for tracking habits.
This is the backend part of the project. The frontend can be found ([repo](https://github.com/small-lizard/habits-tracker)). The backend uses a layered architecture: controllers handle business logic and HTTP requests, repositories handle data storage and retrieval from the database, and MongoDB is accessed through an abstracted layer.

## Tech Stack

**Backend:** Node.js, Express, Resend, REST API, Session authentication

**Database:** MongoDB Atlas

**Frontend:** React, TypeScript ([repo](https://github.com/small-lizard/habits-tracker)) 

**Deployment:** Render

## Project Structure

```text
src
 ├── controllers    # business logic
 ├── middlewares    # session checks
 ├── models         # Mongoose models for users and habits
 ├── repositories   # database access and queries
 └── utils          # helper functions
```

## Run Locally
To run the backend locally, follow these steps.

1. Clone the repository

```bash
git clone https://github.com/small-lizard/habits-tracker-server.git
cd habits-tracker-server
```

2. Install dependencies

```bash
npm install
```

3. Create a .env file

```bash
SESSION_SECRET=your_session_secret
PORT=5000
MONGO_URL=mongodb://localhost:27017/test
NODE_ENV=development
RESEND_API_KEY=your_resend_api_key
```

4. Start MongoDB with Docker
The project uses Docker for running MongoDB locally.
```bash
docker compose up -d
```

5. Run the development server

```bash
npm run dev
```
This command runs:
- TypeScript compiler in watch mode
- alias resolver (tsc-alias)
- server reload with nodemon

### Requirements
- Node.js ≥ 18
- Docker / Docker Compose
- npm

## API Endpoints
Habit and account routes require authentication via session middleware.

Authentication

```text
POST           /auth                  register user
POST           /auth/otp              resend OTP code
POST           /verify-email          verify email with OTP
GET            /auth/check            check authentication status
```

Account

```text
POST           /login                 login user
POST           /logout                logout user
PUT            /change-password       change password (auth required)
DELETE         /delete-account        delete user account (auth required)
```

Habits

```text
POST           /habits/add            create habit (auth required)
POST           /habits/update         update habit (auth required)
DELETE         /habits/delete/:id     delete habit (auth required)
GET            /habits                get all user habits (auth required)
```

