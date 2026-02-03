# HRMS Frontend

This project is a frontend-only Human Resources Management System (HRMS) admin dashboard built with Angular and styled using Tailwind CSS. It is designed to consume RESTful APIs for managing employees, attendance, leave requests, and overtime requests.

## Features

-   **Authentication**: Login functionality with JWT-based authentication.
-   **Role-based Access Control**: Routes are protected using authentication and role-based guards (e.g., admin access for employee management).
-   **Core Layout**: Responsive layout with a sidebar navigation and a top header for authenticated users.
-   **Dashboard**: Overview dashboard with summary statistics.
-   **Employee Management**: Functionality to list, add, edit, and delete employee records (Admin access required).
-   **Attendance Management**: Check-in/check-out system and attendance reports.
-   **Leave Management**: Submit leave requests, view personal leave history, and approve/reject pending requests (Admin/Manager access for approvals).
-   **Overtime Management**: Submit overtime requests, view personal overtime history, and approve/reject pending requests (Admin/Manager access for approvals).

## Assumptions

-   A backend API server is running and accessible at `http://localhost:8080/api/`.
-   The backend uses JWT (JSON Web Tokens) for authentication.
-   RESTful endpoints are available as specified in the `HRMS_Postman_Collection.json`.

## Setup Instructions

Follow these steps to set up and run the HRMS frontend application locally.

### 1. Prerequisites

Ensure you have the following installed:

-   Node.js (LTS version recommended)
-   npm (comes with Node.js) or Yarn
-   Angular CLI (`npm install -g @angular/cli`)

### 2. Install Dependencies

Navigate to the project directory and install the required Node.js packages:

```bash
cd hrms_frontend
npm install
# or
# yarn install
```

### 3. Backend API URL Configuration

The application expects the backend API to be available at `http://localhost:8080/api/`. This can be configured in the environment files:

-   `src/environments/environment.ts` (for development)
-   `src/environments/environment.prod.ts` (for production)

The `apiUrl` variable in these files should point to your backend's base URL.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api' // Adjust if your backend is on a different URL/port
};
```

### 4. Development Server

Run the application in development mode:

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### 5. Build for Production

To build the project for production, use:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

### Login

Use the login page (`http://localhost:4200/login`) to authenticate.

**Example Credentials (if using a default backend setup):**

-   **Admin**: `username: admin`, `password: password` (or as configured in your backend)
-   **Employee**: `username: johndoe`, `password: password` (or as configured in your backend)

After successful login, you will be redirected to the dashboard.

### Navigation

Use the sidebar to navigate through different sections of the HRMS dashboard:

-   **Dashboard**: Overview of key HR metrics.
-   **Employees**: Manage employee records (Admin only).
-   **Attendance**: Mark daily attendance and view reports.
-   **Leave Requests**: Submit and manage leave applications.
-   **Overtime Requests**: Submit and manage overtime requests.

### Logout

Click the "Logout" button in the header to end your session.