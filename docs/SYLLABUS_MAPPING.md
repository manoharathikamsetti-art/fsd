# Full Stack Development (FSD) Syllabus Mapping & Technical Demonstration Guide

This document maps core Full Stack Development (FSD) curriculum competencies directly to the concrete source files, architectural patterns, and live features implemented in the **Placement Management System**.

---

## 1. Node.js Architecture & Runtime

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **Modules & ES / CommonJS Imports/Exports** | `server/src/server.ts`<br>`server/src/app.ts`<br>`server/src/config/db.ts` | Modular separation of database connectivity, Express app assembly, router mounting, and server entry. | Inspect imports and modular export syntax in `app.ts` (`export default app`) and `db.ts` (`export const connectDB`). |
| **Environment Configuration** | `server/src/server.ts`<br>`server/.env`<br>`server/.env.example` | Loaded via `dotenv` for dynamic environment switching (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`). | Change `PORT=5000` or `JWT_SECRET` in `server/.env` and verify server picks up environment variables at initialization. |
| **Process Lifecycle & Signals** | `server/src/server.ts` | Clean process management: graceful shutdown listeners for `SIGINT` and `SIGTERM` closing DB and HTTP sockets. | Trigger `Ctrl+C` in backend terminal; inspect console output logging graceful server shutdown. |
| **Error Handling & Async Patterns** | `server/src/middleware/errorHandler.ts` | Uncaught promise handling, centralized error catching, typed custom `AppError` class. | Make invalid requests (e.g. malformed ObjectId) to see centralized JSON error responses with proper HTTP status codes. |

---

## 2. TypeScript (Type Safety & Contracts)

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **Interfaces & Contracts** | `server/src/models/Student.ts`<br>`client/src/types/index.ts` | `IStudent`, `IPlacementOfficer`, `IJobDrive`, `IApplication`, `StudentUser`, `JobDrive`. | Open `client/src/types/index.ts`; verify typed interfaces used across state and props. |
| **Type Aliases & Union Types** | `client/src/types/index.ts`<br>`server/src/models/Application.ts` | `UserRole = 'student' \| 'placement_officer'`<br>`ApplicationStatus = 'Applied' \| 'Under Review' \| ...` | Test compile checks: assigning an arbitrary string to status triggers TypeScript compiler errors. |
| **Typed Functions & Callbacks** | `server/src/controllers/studentController.ts`<br>`client/src/services/api.ts` | Express controllers typed with `Promise<void>`, typed request handlers with `AuthenticatedRequest`. | Inspect controller signatures: `(req: AuthenticatedRequest, res: Response): Promise<void>`. |
| **Optional Properties & Arrays** | `server/src/models/JobDrive.ts`<br>`client/src/types/index.ts` | Optional drive fields (`driveDate?: Date`, `deadline?: Date`), typed arrays (`requiredSkills: string[]`). | Inspect `JobDrive` interface and verify partial updates work with optional properties. |
| **Generics & State Typing** | `client/src/context/AuthContext.tsx` | `createContext<AuthContextType \| undefined>`, `useState<JobDrive[]>`. | Inspect React state hooks strictly bound to domain models. |

---

## 3. Express.js Framework & HTTP Routing

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **Modular Routing** | `server/src/routes/authRoutes.ts`<br>`server/src/routes/studentRoutes.ts`<br>`server/src/routes/placementRoutes.ts`<br>`server/src/routes/jobRoutes.ts` | Route separation by responsibility mounted onto Express application under `/api/*`. | Inspect `server/src/app.ts` mounting `authRoutes`, `studentRoutes`, `placementRoutes`, `jobRoutes`. |
| **HTTP Methods & Verbs** | All controllers & routers | `GET` (fetch drives/recommendations), `POST` (create drive/apply), `PUT` (edit skills/drive), `PATCH` (confirm external/update status), `DELETE` (delete drive). | Review route declarations covering all major REST HTTP methods. |
| **Route & Query Parameters** | `server/src/controllers/jobController.ts`<br>`server/src/controllers/placementController.ts` | Route params: `req.params.id`<br>Query params: `req.query.status`, `req.query.department`, `req.query.search`. | Perform filtered GET requests with query strings: `/api/placement/drives?status=Active&department=CSE`. |
| **Request Bodies & Parsing** | `server/src/app.ts` | Built-in `express.json()` and `express.urlencoded({ extended: true })`. | Submit JSON payloads in student skill updates and job creation. |
| **Middleware Pipeline** | `server/src/middleware/auth.ts`<br>`server/src/middleware/errorHandler.ts` | JSON parsing -> CORS -> Request Logger -> JWT Auth -> Role Authorization -> Controller -> Centralized Error Handler. | Attempt accessing `/api/placement/*` with student token; inspect 403 Forbidden rejection middleware response. |

---

## 4. REST APIs Architecture

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **CRUD Operations** | `server/src/controllers/placementController.ts` | **C**reate Job Drive (`POST /api/placement/drives`)<br>**R**ead Drives (`GET /api/placement/drives`)<br>**U**pdate Drive (`PUT /api/placement/drives/:id`)<br>**D**elete Drive (`DELETE /api/placement/drives/:id`). | Use Placement Portal UI to add, view, edit, and delete job drives. |
| **HTTP Status Codes** | All controllers | `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`. | Test duplicate application submission to receive `409 Conflict`. |
| **Server-Side Validation** | `server/src/controllers/studentController.ts`<br>`server/src/controllers/placementController.ts` | Strict validation of required fields, minimum CGPA checks, intake validation, duplicate key checks. | Try applying to a drive where student CGPA < required CGPA to see server-side validation error. |
| **Authentication & Authorization** | `server/src/middleware/auth.ts`<br>`server/src/controllers/authController.ts` | Dual-role JWT authentication (`student` vs `placement_officer`), bcrypt password hashing (salt rounds = 10). | Log in as Student, verify token issued in localStorage; inspect token payload containing user id and role. |

---

## 5. React Frontend Architecture

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **Components & TSX** | `client/src/components/*`<br>`client/src/pages/*` | Functional components with modular layout (Navbar, StatusBadge, Cards, Modals). | Inspect component hierarchy rendered in DOM via React Developer Tools. |
| **Props & Component Reusability** | `client/src/components/common/StatusBadge.tsx`<br>`client/src/components/common/ProtectedRoute.tsx` | `StatusBadge` takes `status` prop; `ProtectedRoute` takes `allowedRoles` and `children`. | Notice `StatusBadge` dynamically formatting labels and badge colors across dashboard, recommendations, and applications. |
| **State Hooks (`useState`)** | `client/src/pages/student/SkillsPage.tsx`<br>`client/src/pages/officer/ManageDrivesPage.tsx` | Multi-field forms, modal visibility, search inputs, active selection state. | Add, edit, or delete a skill on the Skills page to watch instant reactive UI updates. |
| **Lifecycle Hooks (`useEffect`)** | `client/src/pages/student/RecommendationsPage.tsx`<br>`client/src/context/AuthContext.tsx` | Asynchronous API fetching on mount, token restoration, dependency-based re-querying on filter change. | Changing the status filter dropdown automatically triggers `useEffect` to re-fetch matching job drives. |
| **Forms & Controlled Inputs** | `client/src/pages/officer/ManageDrivesPage.tsx`<br>`client/src/pages/student/StudentLoginPage.tsx` | Controlled text inputs, select dropdowns, textareas, checkboxes with submit handlers. | Fill the Add Drive form; inspect state synchronization with input values. |
| **Conditional Rendering** | `client/src/pages/student/JobDetailPage.tsx` | Conditional application view: displays "Apply" workflow if not applied, or "Applied Status & Confirmation" if already applied. | View a job you haven't applied for vs one you have applied for to observe rendered differences. |
| **Lists & Keys** | `client/src/pages/student/RecommendationsPage.tsx` | Iteration over array collections with unique MongoDB `_id` keys. | Inspect recommendation cards generated by `.map(job => <div key={job._id}>...)`. |
| **Client-Side Routing (`react-router-dom`)** | `client/src/App.tsx`<br>`client/src/components/common/Navbar.tsx` | `BrowserRouter`, `Routes`, `Route`, `Navigate`, `NavLink`, `useParams`, `useNavigate`. | Navigate between `/student/dashboard`, `/student/skills`, and `/student/recommendations` with zero page reloads. |

---

## 6. MongoDB & Mongoose Database

| Syllabus Concept | Relevant Source File(s) | Implementation in Placement Portal | How to Demonstrate / Verify |
| :--- | :--- | :--- | :--- |
| **Database Connection & Health** | `server/src/config/db.ts`<br>`server/src/app.ts` | Mongoose connection with event listeners (`connected`, `error`, `disconnected`), state reporting in `/api/health`. | Inspect `/api/health` JSON response showing `database.state` and `database.connected`. |
| **Schemas & Pre-save Hooks** | `server/src/models/Student.ts`<br>`server/src/models/PlacementOfficer.ts` | Schema definition with timestamps, type validation, password hashing in `pre('save')` middleware. | Check MongoDB documents: stored passwords are secure bcrypt hashes (e.g. `$2a$10$...`), never plaintext. |
| **Unique Indexes & Duplicate Prevention** | `server/src/models/Application.ts`<br>`server/src/models/Student.ts` | Unique index on `registrationNumber`; compound unique index on `{ student: 1, jobDrive: 1 }`. | Inspect Mongoose compound index preventing duplicate applications to the same drive. |
| **Document Population & References** | `server/src/controllers/studentController.ts`<br>`server/src/controllers/placementController.ts` | Mongoose `.populate('company')`, `.populate('student')`, `.populate('jobDrive')`. | View applications table: student name, CGPA, and company name are populated across collections in a single query. |
| **Aggregation Pipelines** | `server/src/controllers/placementController.ts` | `$group`, `$sum`, `$avg`, `$lookup`, `$unwind`, `$project`, `$cond` pipelines for stats & dynamic applicant counts. | Inspect `/api/placement/dashboard-stats` returning computed department averages and company hiring stats. |
| **Dynamic Calculation (No Manual Edits)** | `server/src/controllers/placementController.ts` | Applicant count strictly computed via `$match` and `$group` over `Application` collection; never stored as editable field. | Verify the Edit Job Drive modal displays enrolled applicant count as read-only. |

---

## 7. Syllabus Gap Analysis & Disclosure

| Topic Area | In Core Project Scope? | Pedagogical Notes & Standalone Demonstration |
| :--- | :--- | :--- |
| **Server-Side Template Engines (EJS / Pug / Handlebars)** | **No** (Modern SPA Architecture Chosen) | This project utilizes a decoupled **React 19 Single Page Application (SPA)** with RESTful APIs, which represents industry-standard production architecture. If your course evaluator specifically requests a traditional server-rendered template engine, an auxiliary EJS report generator route (e.g., generating a downloadable HTML/PDF placement report) can be attached to demonstrate template rendering. |
| **WebSockets / Real-Time Sockets (Socket.io)** | **No** (REST Polling / Event Refetching Implemented) | Dashboard synchronization is achieved through authoritative REST refetches upon mutation. For real-time push notifications of status updates, Socket.io can be integrated into the Express server. |

---

## 8. Summary Checklist for Practical Lab Examination

When presenting this project to an external examiner, demonstrate these 5 high-impact workflows:
1. **Student Skills Matching Algorithm**: Go to `My Skills`, add `Python`, and show how `Job Recommendations` immediately recalculates and re-ranks drives with matching percentage badges.
2. **Dual-Role Authorization**: Show that students cannot access `/officer/*` endpoints (returns `403 Forbidden` / redirects).
3. **External Application Verification**: Open a job drive, show the external portal link, and complete the confirmation workflow.
4. **Placement Officer Drive Management & Dynamic Applicant Count**: Update a job drive's package and intake; demonstrate that applicant count is derived from actual application records and cannot be tampered with.
5. **MongoDB Aggregation Reporting**: Open the Officer Dashboard and explain the department-wise student count and average CGPA calculated by MongoDB aggregation pipelines.
