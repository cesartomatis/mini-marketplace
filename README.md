# Mini Marketplace Application

A mini-marketplace application built for a technical challenge, demonstrating proficiency with Angular, Firebase, and Angular Material. This project allows service providers to manage their service pricing through a secure dashboard.

## Setup Instructions

Follow these steps to set up and run the project locally:

1. **Clone the Repository**:

```bash
git clone https://github.com/cesartomatis/mini-marketplace.git
cd mini-marketplace
```

2. **Install Dependencies**:
   Ensure you have Node.js (version 20.x or later) and npm installed, then run:

```bash
npm install
```

3. **Configure Firebase**:
  - Create a Firebase project at Firebase Console.
  - Enable Authentication (Email/Password) and Firestore Database.
  - Copy your Firebase configuration object and create a file in src/environments/environment.ts:
```bash
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

4. **Run the Application**:
```bash
ng serve
```

## Environment Requirements

- Node.js: v20.x or later
- npm: v10.x or later
- Angular CLI: v19.x (install globally with npm install -g @angular/cli)
- Firebase Account: Required for Authentication, Firestore, and Hosting
- Browser: Modern browser (Chrome, Firefox, Edge) with JavaScript enabled

## Feature List

- Authentication:
  - User login and registration with Firebase Authentication (Email/Password).
  - Protected routes using Angular Guards to restrict access to authenticated users only.
- Service Management:
  - Service listing page built with Angular Material components (cards, tables).
  - CRUD operations for services stored in Firestore:
    - Create: Add new services via a dialog with form validation.
    - Read: Real-time service list updates with Firestore subscriptions.
    - Update: Modify service prices through a dialog with validation.
    - Delete: Remove services with confirmation feedback.
- UI/UX:
  - Responsive design using Angular Material for a clean, professional interface.
  - Loading states with spinners and error handling with snackbars.
  - Fade-in animations for smooth component transitions.

## Technical Decisions Explanation

- **Angular 19**: Chosen for its modern features, standalone components, and strong TypeScript support, ensuring a scalable and maintainable codebase.
- **Firebase**: Selected for its seamless integration with Angular (via @angular/fire), providing Authentication, Firestore for real-time data, and Hosting for deployment.
- **Angular Material**: Used for pre-built, responsive UI components to accelerate development and ensure a consistent, professional look.
- **RxJS**: Leveraged for reactive programming, particularly in handling real-time Firestore updates and authentication state changes.
- **TypeScript**: Employed for type safety and better code documentation with JSDoc comments, enhancing maintainability.
- **Standalone Components**: Adopted to simplify imports and improve modularity, aligning with Angular's latest best practices.
