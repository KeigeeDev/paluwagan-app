# System Configuration Guide

This guide is for System Administrators and Developers setting up the Paluwagan Application.

## Prerequisites
*   **Node.js**: Version 16 or higher.
*   **NPM/Yarn**: Package manager.
*   **Firebase Account**: With Firestore and Authentication enabled.

## Environment Variables
The application uses **Vite** for build tooling, so all environment variables must start with `VITE_`.
Create a `.env` file in the project root:

```ini
# Firebase Configuration
# Get these values from your Firebase Console -> Project Settings
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Security Rules (Firestore)
Ensure your Firestore Security Rules protect data privacy:
*   **Transactions:** `read` allowed for owners (check `request.auth.uid == resource.data.uid`) and Admins. `write` allowed for authenticated users (create) or Admins (update).
*   **Users:** Users can read their own profile; Admins can read all.

## Build & Deployment
The app is a Single Page Application (SPA).

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Run locally with hot-reload:
```bash
npm run dev
```

### 3. Production Build
Generates static files in the `dist/` folder:
```bash
npm run build
```

### 4. Deploy
If using **Firebase Hosting**:
```bash
firebase deploy
```
*Ensure `firebase.json` is configured to rewrite all routes to `index.html`.*

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
