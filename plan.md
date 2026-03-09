# AcneAI Frontend Implementation Plan

## Project Overview
A production-grade React frontend for the AcneAI dermatology application. The app provides AI-powered acne severity analysis and personalized treatment plans through a professional medical SaaS dashboard interface.

## Frontend Architecture
- **Tech Stack**: React 19, Vite, TailwindCSS, React Router, Chart.js, react-hot-toast, animejs, tsparticles
- **Theme Color**: Teal (#00BBA7)
- **Pattern**: Modular, scalable component-based architecture

## Routing Strategy
Public routes:
- `/` - Hero/Landing page
- `/login` - User login
- `/register` - User registration
- `/verify-otp` - OTP verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

Protected routes:
- `/app/dashboard` - Main dashboard with stats & charts
- `/app/treatment` - Treatment plan and daily reviews
- `/app/acne-analysis` - Acne analysis results view
- `/app/profile` - User profile and settings

## Authentication Flow
1. User registers → OTP sent to email
2. User verifies OTP → Account activated
3. User logs in → JWT token received
4. Token stored in sessionStorage
5. Auto-redirect based on completion status:
   - No questionnaire → /questionnaire
   - No acne analysis → /face-analysis
   - Both done → /app/dashboard

## State Management
- React Context for Auth state
- Local state for form handling
- sessionStorage for persistence:
  - `token` - JWT authentication token
  - `user` - User data object
  - `lastRoute` - For tab restore functionality

## API Layer
- Axios instance with baseURL from env variables
- Request interceptor for JWT token
- Response interceptor for error handling

## UI Layout Strategy
- Sidebar navigation (left) - Desktop only
- Top navbar with user info
- Main content area
- Responsive design for mobile/tablet

## Dashboard Widgets
1. **Stat Cards**: Acne Severity, Treatment Day, Completed Days, Total Users
2. **Severity Chart**: Doughnut chart showing severity breakdown
3. **Progress Chart**: Line chart showing treatment progress
4. **AI Insight Panel**: Generated insights based on user data
5. **Calendar Clock**: Current date/time with treatment day

## Charts & Analytics
- SeverityChart (Doughnut): cleanskin, mild, moderate, severe, unknown
- ProgressChart (Line): Treatment improvement over days

## Session Persistence
- Tab restore: Store lastRoute in sessionStorage
- On app load: If authenticated, redirect to lastRoute

## Treatment Automation Logic
- Midnight auto-submit: If user hasn't submitted daily review
- Auto-generates negative feedback with note "Today's tasks were not completed"
- Ensures AI generates improved plan for next day

## Security Considerations
- JWT stored in sessionStorage (not localStorage for security)
- ProtectedRoute checks authentication
- Token expiry handling
- CORS configuration

## Performance Optimizations
- Lazy loading for routes
- React Suspense for code splitting
- Image previews use blob URLs
- Cleanup blob URLs on unmount

---

## Implementation Tasks

### Phase 1: Setup & Configuration
- [x] Read Api.md and understand all endpoints
- [x] Create .env file with API base URL
- [x] Update api.js with axios interceptors

### Phase 2: Core Infrastructure
- [x] Create layout components (Sidebar, Navbar, PageContainer)
- [x] Create UI components (Button, Input, Card, Loader, Modal)
- [x] Update AuthContext with enhanced features

### Phase 3: Authentication Pages
- [x] Style Login page with Teal theme
- [x] Style Register page with Teal theme
- [x] Style VerifyOtp page with Teal theme
- [x] Create ForgotPassword page
- [x] Create ResetPassword page

### Phase 4: Onboarding Pages
- [x] Style Questionnaire page with Teal theme
- [x] Style FaceAnalysis page with Teal theme

### Phase 5: Dashboard Pages
- [x] Create Dashboard page with widgets and charts
- [x] Style Treatment page
- [x] Create AcneAnalysis results page
- [x] Create Profile page

### Phase 6: Features & Polish
- [x] Implement auto-review midnight logic
- [x] Add tab restore functionality
- [x] Add toast notifications
- [x] Add animations with animejs
- [x] Update routing with all new pages

---

## API Endpoints Reference

### Auth
- POST /auth/register
- POST /auth/verify-otp
- POST /auth/resend-otp
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/users/count

### User Info
- POST /auth/userinfo (save questionnaire)
- GET /auth/userinfo (get user data + questionnaire + acne analysis)
- GET /auth/user-status (check completion status)

### Acne Analysis
- POST /auth/upload-acne (upload images)

### Treatment
- POST /treatment/start (generate Day 1)
- POST /treatment/review (submit daily review)
- GET /treatment/status (get treatment status)

---

## Color Palette (Teal Theme)
- Primary: #00BBA7 (Teal)
- Primary Dark: #0d9488
- Primary Light: #14b8a6
- Background: #f0fdfa (Light teal tint)
- Surface: #ffffff
- Text Primary: #134e4a
- Text Secondary: #5eead4
- Error: #ef4444
- Success: #22c55e

---

## Last Updated
- Task created based on Api.md analysis
- Implementation in progress

