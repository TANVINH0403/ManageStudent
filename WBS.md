# Work Breakdown Structure (WBS) - ManageStudent Project

## Project Overview
**ManageStudent** is a comprehensive task and student management system built with:
- **Frontend**: React 19.2.4 + Vite + Redux Toolkit + React Router
- **Backend**: .NET 8.0 Web API with Entity Framework Core + SQL Server/PostgreSQL
- **Architecture**: Full-stack web application with real-time features and file management

---

## 1. Project Management & Planning
### 1.1 Project Initiation
- [ ] Define project scope and objectives
- [ ] Identify stakeholders and users
- [ ] Create project charter
- [ ] Establish success criteria

### 1.2 Requirements Gathering
- [ ] Collect functional requirements
- [ ] Document non-functional requirements
- [ ] Create use case diagrams
- [ ] Define user personas

### 1.3 Architecture & Design
- [ ] System architecture design
- [ ] Database schema design
- [ ] API contract documentation
- [ ] UI/UX wireframes and mockups

---

## 2. Backend Development (.NET API)

### 2.1 Authentication & Authorization
- [ ] **AuthController Implementation**
  - [ ] User registration endpoint
  - [ ] User login endpoint
  - [ ] JWT token generation & refresh
  - [ ] Logout functionality
  - [ ] Get current user profile (me)
  
- [ ] **Security Services**
  - [ ] JWT token generation service (AuthService)
  - [ ] Password hashing using BCrypt
  - [ ] Token validation middleware
  - [ ] Role-based access control (RBAC)
  - [ ] User session management

### 2.2 User Management
- [ ] **UserController Implementation**
  - [ ] Get user profile
  - [ ] Update user profile
  - [ ] Get user settings
  - [ ] Update user settings
  - [ ] Change password
  - [ ] Email change request & confirmation
  
- [ ] **User Services**
  - [ ] GetProfileService
  - [ ] UpdateProfileService
  - [ ] ChangePasswordService
  - [ ] EmailChangeService (OTP validation)
  - [ ] Email notification service

### 2.3 Task Management
- [ ] **TaskController Implementation**
  - [ ] Get all tasks (with filtering & pagination)
  - [ ] Get task by ID
  - [ ] Create new task
  - [ ] Update task details
  - [ ] Delete task
  - [ ] Update task status
  - [ ] Get tasks by category
  - [ ] Get subtasks
  
- [ ] **Task Services**
  - [ ] GetAllTaskHandle (query filtering)
  - [ ] CreateTaskHandler
  - [ ] UpdateTaskHandle
  - [ ] DeleteTaskHandle
  - [ ] GetTaskByIdHandle
  - [ ] UpdateStatusHandle
  - [ ] GetTasksByCategoryHandle
  - [ ] GetSubTasksHandle
  - [ ] Task validation (FluentValidation)

### 2.4 Category Management
- [ ] **CategoryController Implementation**
  - [ ] Create category
  - [ ] Get all categories
  - [ ] Get category by ID
  - [ ] Update category
  - [ ] Delete category
  - [ ] Mark category as completed
  - [ ] Update category visibility
  
- [ ] **Category Services**
  - [ ] CreateCategoryHandle
  - [ ] GetAllCategoryHandler
  - [ ] GetCategoryByIdHandle
  - [ ] UpdateCategoryHandle
  - [ ] DeleteCategoryHandle
  - [ ] CompletedCategoryHandle
  - [ ] UpdateVisibility

### 2.5 Tag Management
- [ ] **TagController Implementation**
  - [ ] Create tag
  - [ ] Get all tags
  - [ ] Get tag by ID
  - [ ] Update tag
  - [ ] Delete tag
  
- [ ] **Tag Services**
  - [ ] CreateTagHandler
  - [ ] GetAllTagHandler
  - [ ] GetTagByIdHandler
  - [ ] UpdateTagHandler
  - [ ] DeleteTagHandler
  - [ ] Tag-Task association

### 2.6 File Management
- [ ] **TaskFileController Implementation**
  - [ ] Upload files to task
  - [ ] Get files for task
  - [ ] Delete file
  - [ ] File access control
  
- [ ] **File Services**
  - [ ] UploadFileHandler (NPOI integration)
  - [ ] GetFileHandler
  - [ ] DeleteFileHandler
  - [ ] File storage & retrieval
  - [ ] Supabase integration for cloud storage

### 2.7 Notifications
- [ ] **NotificationController Implementation**
  - [ ] Get user notifications
  - [ ] Get unread count
  - [ ] Mark notification as read
  - [ ] Mark all notifications as read
  
- [ ] **Notification Services**
  - [ ] NotificationHandler
  - [ ] Real-time notification delivery (SignalR)
  - [ ] Notification persistence
  - [ ] Email/Push notification options

### 2.8 Dashboard & Analytics
- [ ] **DashboardController Implementation**
  - [ ] Get dashboard data
  - [ ] Task statistics
  - [ ] Category progress
  
- [ ] **Dashboard Services**
  - [ ] GetDashboardHandle
  - [ ] Data aggregation & analytics

### 2.9 Board/Kanban Management
- [ ] **BoardController Implementation**
  - [ ] Get user board
  - [ ] Real-time board updates
  
- [ ] **Board Services**
  - [ ] BoardHandle
  - [ ] Kanban board operations

### 2.10 Database & Data Access
- [ ] **Entity Framework Core**
  - [ ] Database migrations
  - [ ] Model configurations
  - [ ] Relationships setup
  - [ ] Database context configuration
  
- [ ] **Database Support**
  - [ ] SQL Server support
  - [ ] PostgreSQL support (Npgsql)
  - [ ] Connection string management

### 2.11 API Documentation & Testing
- [ ] **Swagger/OpenAPI**
  - [ ] Swagger UI setup
  - [ ] API endpoint documentation
  - [ ] Request/Response examples
  
- [ ] **Unit & Integration Tests**
  - [ ] Service layer tests
  - [ ] Controller tests
  - [ ] Database tests
  - [ ] API integration tests

---

## 3. Frontend Development (React + Vite)

### 3.1 Project Setup & Configuration
- [ ] Vite configuration
- [ ] ESLint setup
- [ ] Redux store configuration
- [ ] React Router setup
- [ ] Environment variables

### 3.2 Core Components & Layout
- [ ] **Navigation & Layout**
  - [ ] Header/Navigation bar
  - [ ] Sidebar menu
  - [ ] Layout wrapper
  - [ ] Footer
  
- [ ] **Common Components**
  - [ ] Button components
  - [ ] Input fields
  - [ ] Modal dialogs
  - [ ] Loading spinners
  - [ ] Toast notifications
  - [ ] Alert components
  - [ ] Card components
  - [ ] Badge components

### 3.3 Authentication Pages
- [ ] **Auth Pages**
  - [ ] Login page
  - [ ] Registration page
  - [ ] Password recovery page
  - [ ] Email verification page
  
- [ ] **Auth Features**
  - [ ] JWT token management
  - [ ] Persistent session
  - [ ] Protected routes
  - [ ] Redirect logic

### 3.4 Dashboard & Overview
- [ ] **Dashboard Page**
  - [ ] Statistics display
  - [ ] Task overview
  - [ ] Category summary
  - [ ] Progress charts (Chart.js/Recharts)
  
- [ ] **Widgets**
  - [ ] Task count widget
  - [ ] Completion rate widget
  - [ ] Recent activities widget
  - [ ] Analytics dashboard

### 3.5 Task Management Pages
- [ ] **Task List Page**
  - [ ] Task listing with filtering
  - [ ] Pagination
  - [ ] Search functionality
  - [ ] Sort options
  - [ ] Bulk actions
  
- [ ] **Task Creation/Editing**
  - [ ] Task creation form
  - [ ] Task editing form
  - [ ] Form validation
  - [ ] Rich text editor
  - [ ] Date picker integration
  
- [ ] **Task Details Page**
  - [ ] Task information display
  - [ ] Task status management
  - [ ] Subtask management
  - [ ] Comment section
  - [ ] Activity timeline
  
- [ ] **Task Filtering & Search**
  - [ ] Filter by status
  - [ ] Filter by priority
  - [ ] Filter by category
  - [ ] Filter by tags
  - [ ] Search by keywords

### 3.6 Category Management
- [ ] **Category List Page**
  - [ ] Display all categories
  - [ ] Create category
  - [ ] Edit category
  - [ ] Delete category
  - [ ] View category details
  
- [ ] **Category Features**
  - [ ] Category visibility toggle
  - [ ] Task count display
  - [ ] Progress indicators
  - [ ] Color coding

### 3.7 Tag Management
- [ ] **Tag Operations**
  - [ ] Create tag
  - [ ] Edit tag
  - [ ] Delete tag
  - [ ] Tag suggestions
  - [ ] Auto-complete

### 3.8 File Management
- [ ] **File Upload/Download**
  - [ ] File upload interface
  - [ ] Multiple file upload
  - [ ] File preview
  - [ ] File download
  - [ ] File deletion
  - [ ] File type validation
  
- [ ] **File Storage Integration**
  - [ ] Supabase integration
  - [ ] Upload progress tracking
  - [ ] Error handling

### 3.9 User Profile & Settings
- [ ] **User Profile Page**
  - [ ] Profile information display
  - [ ] Edit profile form
  - [ ] Profile picture upload
  - [ ] User preferences
  
- [ ] **Settings Page**
  - [ ] Account settings
  - [ ] Notification settings
  - [ ] Privacy settings
  - [ ] Theme settings (if applicable)
  - [ ] Password change
  - [ ] Email change

### 3.10 Notifications
- [ ] **Notification UI**
  - [ ] Notification bell icon
  - [ ] Notification dropdown
  - [ ] Notification list page
  - [ ] Mark as read functionality
  - [ ] Notification detail
  
- [ ] **Real-time Updates**
  - [ ] SignalR integration
  - [ ] WebSocket connection management
  - [ ] Real-time notification delivery

### 3.11 Kanban Board
- [ ] **Board View**
  - [ ] Kanban column setup
  - [ ] Drag & drop cards
  - [ ] Status update via drag-drop
  - [ ] Add card to column
  - [ ] Filter board view
  - [ ] Board customization

### 3.12 Charts & Visualizations
- [ ] **Chart Integration**
  - [ ] Chart.js setup
  - [ ] Recharts setup
  - [ ] Task completion charts
  - [ ] Category progress charts
  - [ ] Timeline charts
  - [ ] Statistics visualization

### 3.13 State Management (Redux)
- [ ] **Redux Store**
  - [ ] Auth slice
  - [ ] Task slice
  - [ ] Category slice
  - [ ] User slice
  - [ ] Notification slice
  - [ ] UI slice
  
- [ ] **Redux Middleware**
  - [ ] API call middleware
  - [ ] Error handling middleware
  - [ ] Loading state management

### 3.14 HTTP Client & API Integration
- [ ] **Axios Configuration**
  - [ ] API base URL
  - [ ] Request interceptors
  - [ ] Response interceptors
  - [ ] Error handling
  - [ ] Token attachment
  - [ ] Timeout configuration

### 3.15 Responsive Design & Bootstrap
- [ ] **Bootstrap Integration**
  - [ ] Grid system
  - [ ] Component styling
  - [ ] Responsive breakpoints
  - [ ] Custom theme (if needed)
  
- [ ] **Responsive Pages**
  - [ ] Mobile optimization
  - [ ] Tablet optimization
  - [ ] Desktop layout
  - [ ] Touch-friendly interfaces

### 3.16 Testing
- [ ] **Component Tests**
  - [ ] Unit tests
  - [ ] Component render tests
  - [ ] Integration tests
  
- [ ] **E2E Testing**
  - [ ] User flow testing
  - [ ] Navigation testing
  - [ ] Form submission testing

---

## 4. Real-time Features

### 4.1 SignalR Integration
- [ ] **Backend SignalR Setup**
  - [ ] SignalR hub configuration
  - [ ] Connection management
  - [ ] Message routing
  - [ ] User-specific messaging
  
- [ ] **Frontend SignalR Client**
  - [ ] SignalR client library
  - [ ] Connection management
  - [ ] Reconnection logic
  - [ ] Message handlers

### 4.2 Real-time Notifications
- [ ] Task updates notification
- [ ] New comment notification
- [ ] Task assignment notification
- [ ] Category activity notification

### 4.3 Real-time Board Updates
- [ ] Task status updates
- [ ] Drag-drop synchronization
- [ ] Concurrent user updates

---

## 5. Database & Data Management

### 5.1 Database Schema
- [ ] Users table
- [ ] Tasks table
- [ ] Categories table
- [ ] Tags table
- [ ] Task-Tag relationships
- [ ] Files table
- [ ] Notifications table
- [ ] Settings table
- [ ] Audit logs table

### 5.2 Data Migrations
- [ ] Initial schema creation
- [ ] Seed data creation
- [ ] Index optimization
- [ ] Constraint setup

### 5.3 Data Security
- [ ] Encrypted sensitive data
- [ ] Row-level security
- [ ] Data validation
- [ ] GDPR compliance

---

## 6. DevOps & Deployment

### 6.1 CI/CD Pipeline
- [ ] GitHub Actions setup
- [ ] Automated testing pipeline
- [ ] Build automation
- [ ] Deployment automation
- [ ] Code coverage monitoring

### 6.2 Backend Deployment
- [ ] Docker containerization
- [ ] Environment configuration
- [ ] Database migration automation
- [ ] Server deployment strategy

### 6.3 Frontend Deployment
- [ ] Build optimization
- [ ] Static asset deployment
- [ ] CDN configuration
- [ ] Cache strategy

### 6.4 Infrastructure
- [ ] Web server setup
- [ ] Database server setup
- [ ] Load balancing
- [ ] Backup & recovery strategy

---

## 7. Quality Assurance & Testing

### 7.1 Backend Testing
- [ ] Unit tests (services, handlers)
- [ ] Integration tests (controllers, database)
- [ ] API endpoint tests
- [ ] Authentication tests
- [ ] Authorization tests

### 7.2 Frontend Testing
- [ ] Component unit tests
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Visual regression tests
- [ ] Performance tests

### 7.3 Security Testing
- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF protection testing
- [ ] Authentication bypass testing
- [ ] Authorization bypass testing

### 7.4 Performance Testing
- [ ] Load testing
- [ ] Stress testing
- [ ] Response time optimization
- [ ] Database query optimization

---

## 8. Documentation

### 8.1 Technical Documentation
- [ ] API documentation (Swagger)
- [ ] Database schema documentation
- [ ] Architecture documentation
- [ ] Component documentation

### 8.2 User Documentation
- [ ] User guide
- [ ] FAQ document
- [ ] Video tutorials
- [ ] In-app help

### 8.3 Developer Documentation
- [ ] Setup guide
- [ ] Development workflow
- [ ] Code style guide
- [ ] Contributing guidelines

---

## 9. Project Support & Maintenance

### 9.1 Bug Fixes & Patches
- [ ] Bug tracking system
- [ ] Bug prioritization
- [ ] Hotfix process
- [ ] Release notes

### 9.2 Feature Enhancements
- [ ] Feature request process
- [ ] Backlog management
- [ ] Sprint planning
- [ ] Release planning

### 9.3 Performance Optimization
- [ ] Database optimization
- [ ] API optimization
- [ ] Frontend optimization
- [ ] Caching strategies

### 9.4 User Support
- [ ] Support ticketing system
- [ ] Documentation updates
- [ ] Community engagement
- [ ] Training & onboarding

---

## Key Dependencies

### Backend
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server / PostgreSQL
- **Authentication**: JWT Bearer
- **Validation**: FluentValidation
- **Real-time**: SignalR
- **Security**: BCrypt.Net
- **API Docs**: Swagger/Swashbuckle
- **File Storage**: Supabase, NPOI

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.1
- **State Management**: Redux Toolkit 2.11.2
- **Routing**: React Router 7.13.2
- **HTTP Client**: Axios 1.14.0
- **UI Framework**: Bootstrap 5.3.8
- **Charts**: Chart.js & Recharts
- **Real-time**: SignalR
- **Icons**: Lucide React 1.7.0

---

## Project Timeline & Phases

### Phase 1: Foundation (Weeks 1-3)
- Backend: Authentication, Database setup
- Frontend: Project setup, Auth pages, Layout

### Phase 2: Core Features (Weeks 4-8)
- Backend: Task, Category, Tag management
- Frontend: Task pages, Category pages, Dashboard

### Phase 3: Advanced Features (Weeks 9-12)
- Backend: Notifications, File management, Real-time
- Frontend: Notifications, Files, Kanban Board

### Phase 4: Polish & Testing (Weeks 13-15)
- Testing & bug fixes
- Performance optimization
- Documentation

### Phase 5: Deployment (Week 16)
- CI/CD setup
- Production deployment
- User training & support

---

## Success Metrics
- [ ] All CRUD operations working correctly
- [ ] Real-time features functioning smoothly
- [ ] API response time < 200ms (p95)
- [ ] Frontend load time < 3 seconds
- [ ] Test coverage > 80%
- [ ] Zero critical security vulnerabilities
- [ ] User satisfaction score > 4/5

---

## Notes
- Use of Supabase for external file storage
- Real-time updates via SignalR
- Support for multiple database backends (SQL Server & PostgreSQL)
- Bootstrap for responsive UI
- Comprehensive error handling and validation

**Document Created**: 2026-05-13  
**Project Owner**: TANVINH0403  
**Repository**: https://github.com/TANVINH0403/ManageStudent
