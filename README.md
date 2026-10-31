# Placement Management System

A full-stack, enterprise-grade web application built to streamline campus placement operations. The platform connects graduating students with recruiting organizations while providing campus placement officers with centralized tools to publish recruitment drives, evaluate candidate applications, track recruitment statistics, and manage company partnerships.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Student Portal](#student-portal)
  - [Placement Officer Portal](#placement-officer-portal)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Database Seeding & Test Accounts](#database-seeding--test-accounts)
- [Running the Application](#running-the-application)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [API Documentation](#api-documentation)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

The **Placement Management System** bridges the gap between students, recruiters, and the college placement cell. It replaces disparate spreadsheets and manual emails with a unified database-backed platform:
- Students can maintain their academic profiles, update technical skill sets, receive algorithmic job recommendations matched against drive requirements, and track real-time application stages.
- Placement Officers can manage company profiles, schedule job drives, review incoming applicant records with verified database counts, and update recruitment statuses (Applied, Shortlisted, Interview Scheduled, Selected, Rejected).

---

## Key Features

### Student Portal
- **Authentication**: Secure registration and login using student registration numbers and bcrypt-hashed passwords.
- **Student Profile Management**: View and maintain personal details, college registration number, contact email, phone number, academic branch, and CGPA.
- **Skills Management**: Add, update, and manage verified technical and professional skills.
- **Skill-Based Recommendations**: Dynamic recommendation engine that scores active job drives against the student's skill portfolio.
- **Job Drive Discovery**: Browse active campus hiring drives, view detailed job descriptions, package offerings (LPA), minimum CGPA cutoffs, and application deadlines.
- **Application Tracking**: One-click application submission with external portal confirmation and tracking of interview statuses and officer remarks.

### Placement Officer Portal
- **Officer Authentication**: Dedicated login portal for authorized placement coordinators and training officers.
- **Dashboard & Analytics**: Real-time metrics showing total drives, active recruitment processes, total student applications, shortlists, and registered partner companies.
- **Company Directory**: Register and manage partner companies, industry domains, and contact records.
- **Job Drive Management**: Create, edit, publish, and delete recruitment drives with package ranges, eligibility rules, and intake quotas.
- **Dynamic Applicant Derivation**: Applicant counts are computed dynamically from actual database application records to ensure complete data integrity.
- **Application Workflow & Status Management**: Review student applications per drive and update candidate stages (Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected) with custom remarks.

---

## Technology Stack

### Frontend
- **React 19**: Modern component-based user interface.
- **TypeScript**: Static typing for interface safety and maintainability.
- **Vite 8**: Fast production bundling and Hot Module Replacement (HMR).
- **React Router 7**: Client-side declarative routing and role-based route guards.
- **Lucide React**: Modern, scalable icon set.
- **Custom Design System**: Responsive CSS with theme variables and dashboard components.

### Backend
- **Node.js**: Scalable JavaScript runtime environment.
- **Express.js 5**: High-performance RESTful API framework.
- **TypeScript**: Typed server controllers, models, and middleware.
- **tsx**: Direct TypeScript execution for development and operational scripts.
- **CORS**: Origin configuration supporting development and production clients.
- **dotenv**: Environment variable management across environments.

### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL document database.
- **Mongoose 9**: Object Data Modeling (ODM) library with schema validation and indexing.

### Authentication & Security
- **JSON Web Tokens (JWT)**: Stateless token-based authorization with role enforcement (`student` vs. `placement_officer`).
- **bcryptjs**: Salted password hashing prior to persistence.

---

## Project Structure

```text
fsd_prj/
├── .env.example              # Safe environment variable template for root
├── .gitignore                # Global git ignore rules (excludes .env, dist, node_modules)
├── package.json              # Root workspace scripts for unified server/client control
├── README.md                 # Complete project documentation
├── docs/                     # Additional project specifications and syllabus mapping
│   └── SYLLABUS_MAPPING.md
├── server/                   # Backend Express & TypeScript application
│   ├── .env.example          # Server environment variable template
│   ├── package.json          # Server dependencies and lifecycle scripts
│   ├── tsconfig.json         # Server TypeScript compiler configuration
│   └── src/
│       ├── app.ts            # Express application initialization and middleware
│       ├── server.ts         # Server entry point with DB connection and graceful shutdown
│       ├── config/
│       │   └── db.ts         # MongoDB Atlas connection lifecycle management
│       ├── controllers/      # Business logic handlers
│       │   ├── authController.ts
│       │   ├── jobController.ts
│       │   ├── placementController.ts
│       │   └── studentController.ts
│       ├── middleware/       # JWT authentication and centralized error handling
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       ├── models/           # Mongoose schemas and data models
│       │   ├── Application.ts
│       │   ├── Company.ts
│       │   ├── JobDrive.ts
│       │   ├── PlacementOfficer.ts
│       │   └── Student.ts
│       ├── routes/           # RESTful API route declarations
│       │   ├── authRoutes.ts
│       │   ├── jobRoutes.ts
│       │   ├── placementRoutes.ts
│       │   └── studentRoutes.ts
│       └── scripts/          # Database seeding and verification test suites
│           ├── seedOfficer.ts
│           ├── testConnection.ts
│           ├── verifyAccountsAndAuth.ts
│           └── verifyLiveWorkflows.ts
└── client/                   # Frontend React & Vite application
    ├── index.html            # Single page application HTML entry
    ├── package.json          # Client dependencies and build scripts
    ├── tsconfig.json         # Client TypeScript configuration
    ├── vite.config.ts        # Vite build tool configuration
    ├── eslint.config.js      # ESLint configuration
    └── src/
        ├── App.tsx           # App root with role-based routing
        ├── main.tsx          # React DOM render entry
        ├── index.css         # Design system, variables, and global styles
        ├── App.css           # Layout and module styles
        ├── components/
        │   └── common/       # Navbar, Footer, ProtectedRoute, StatusBadge
        ├── context/
        │   └── AuthContext.tsx # Centralized React authentication context
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── officer/      # Officer dashboard, drives, applications, and login
        │   └── student/      # Student dashboard, profile, skills, recommendations, drives
        ├── services/
        │   └── api.ts        # Centralized HTTP client consuming REST API
        └── types/
            └── index.ts      # Shared TypeScript data contracts
```

---

## Prerequisites

Ensure you have the following installed on your machine before setting up the project:

- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**: v2.30.0 or later
- **MongoDB Atlas**: An active MongoDB Atlas cluster (or a local MongoDB instance running on port 27017)

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/manoharathikamsetti-art/fsd.git
cd fsd
```

### 2. Install Dependencies

You can install dependencies for both server and client directly:

```bash
# Install root (orchestration scripts)
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

---

## Environment Configuration

Both root and backend require environment variable configuration. Copy the example templates to create your local `.env` files:

```bash
# In the project root:
cp .env.example .env

# In the server folder:
cp server/.env.example server/.env
```

### Required Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express backend server | `5000` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI (Atlas SRV or local connection string) | `mongodb+srv://<user>:<password>@cluster.mongodb.net/placement_management` |
| `JWT_SECRET` | Secret key used for signing and verifying JSON Web Tokens | `your_secure_jwt_secret_change_in_production` |
| `CLIENT_URL` | Allowed origin URL for CORS policy | `http://localhost:5173` |

> [!IMPORTANT]
> Never commit `.env` files or hardcode database passwords in source control. The root `.gitignore` is pre-configured to exclude all `.env` files.

---

## Database Seeding & Test Accounts

To populate the database with default companies, active job drives, placement officers, and demo student profiles:

```bash
# Test connection to MongoDB Atlas
npm run server:test-db

# Run the idempotent database seeder
npm run server:seed
```

### Demo Accounts (Development & Evaluation Only)

> [!WARNING]
> These credentials are provided solely for development and evaluation. Always rotate passwords before any staging or production deployment.

#### Placement Officers (TPO Portal)
| Email | Password | Role / Department | Employee ID |
| :--- | :--- | :--- | :--- |
| `officer1@college.edu` | `Password@123` | Placement Officer | `TPO-2026-002` |
| `officer2@college.edu` | `Password@123` | Corporate Relations Officer | `TPO-2026-003` |
| `placement@college.edu` | `Password@123` | Head of Placements | `TPO-2026-001` |

#### Students (Student Portal)
| Registration Number | Password | Student Name | Department & CGPA |
| :--- | :--- | :--- | :--- |
| `24B91A0521` | `Password@123` | Sai Teja Reddy | CSE (CGPA: 8.45) |
| `24B91A0526` | `Password@123` | Ananya Verma | CSE (CGPA: 9.10) |
| `24B91A0559` | `Password@123` | Karthik Varma | CSE (CGPA: 7.85) |
| `22CS101` | `Password@123` | Aarav Sharma | CSE (CGPA: 8.75) |

---

## Running the Application

### Development Mode

Run the server and client concurrently or in separate terminal windows:

```bash
# Terminal 1: Start Backend (tsx watcher on port 5000)
npm run server:dev

# Terminal 2: Start Frontend (Vite dev server on port 5173)
npm run client:dev
```

Once running:
- **Frontend Portal**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000).
- **Health Check**: Accessible at [http://localhost:5000/api/health](http://localhost:5000/api/health).

### Production Build

```bash
# Build both server and client artifacts
npm run build

# Start the compiled backend server
npm run server:start
```

---

## Testing & Quality Assurance

The codebase includes automated verification suites for TypeScript compilation, code quality, role-based access control, and authentication:

```bash
# 1. Typecheck & compile server
npm run server:build

# 2. Typecheck & build client bundle
npm run client:build

# 3. Lint client code
npm run client:lint

# 4. Verify accounts, bcrypt hashes, JWT tokens, and RBAC routes
npm run test:accounts
```

---

## API Documentation

All routes are prefixed with `/api`.

### System Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System uptime, environment, and MongoDB connection status |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/student/login` | Public | Authenticates student via registration number & password |
| `POST` | `/api/auth/student/register` | Public | Registers a new student account |
| `POST` | `/api/auth/officer/login` | Public | Authenticates placement officer via email & password |
| `GET` | `/api/auth/me` | Authenticated | Returns the authenticated user session and role |

### Student Portal (`/api/students`)
*Requires `Authorization: Bearer <token>` with `role: student`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students/profile` | Fetches student profile, academic stats, and branch |
| `PUT` | `/api/students/profile` | Updates student profile details |
| `GET` | `/api/students/skills` | Retrieves student's verified skills list |
| `PUT` | `/api/students/skills` | Updates student's skills list |
| `GET` | `/api/students/recommendations` | Computes skill-match score and returns recommended job drives |
| `GET` | `/api/students/applications` | Returns all applications submitted by the logged-in student |
| `POST` | `/api/students/apply/:jobDriveId` | Submits application to a drive with duplicate prevention |
| `PATCH` | `/api/students/applications/:applicationId/confirm-external` | Confirms external application submission on company career site |

### Placement Officer Portal (`/api/placement`)
*Requires `Authorization: Bearer <token>` with `role: placement_officer`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/placement/dashboard-stats` | Retrieves placement statistics (drives, applications, shortlists, companies) |
| `GET` | `/api/placement/drives` | Lists all drives with dynamically derived applicant counts |
| `POST` | `/api/placement/drives` | Creates a new recruitment job drive |
| `PUT` | `/api/placement/drives/:id` | Modifies an existing recruitment drive |
| `DELETE` | `/api/placement/drives/:id` | Deletes a recruitment drive and associated applications |
| `GET` | `/api/placement/applications` | Retrieves all student applications (supports `?jobDriveId=` filter) |
| `PATCH` | `/api/placement/applications/:id/status` | Updates application stage (`Applied`, `Shortlisted`, `Selected`, etc.) and remarks |
| `GET` | `/api/placement/companies` | Retrieves all participating partner companies |
| `POST` | `/api/placement/companies` | Registers a new partner company |

### Job Drives (`/api/jobs`)
*Requires `Authorization: Bearer <token>` (Student or Officer).*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Lists active recruitment drives open for applications |
| `GET` | `/api/jobs/:id` | Returns comprehensive details of a specific job drive |

---

## Security Considerations

- **Secret Protection**: All environment secrets (`MONGODB_URI`, `JWT_SECRET`) are strictly kept in ignored `.env` files and loaded at runtime.
- **Password Safety**: Sensitive passwords are never stored in plaintext; salted hashes are generated using `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Student routes reject placement officer tokens with `403 Forbidden`, and officer routes reject student tokens with `403 Forbidden`.
- **CORS Protection**: Restricted to configured origins (`CLIENT_URL`).

---

## License

This project is licensed under the [ISC License](package.json).
