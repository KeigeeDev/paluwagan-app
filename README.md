# Digital Paluwagan System 💰

A modern, role-based financial ledger application designed to manage communal savings (Hulog) and loans (Utang). Built with React, Tailwind CSS, and Firebase, this system automates interest calculations and provides real-time transparency for members and admins.

## 💡 The Problem We Solved
Traditional *Paluwagan* (ROSCA) systems often rely on manual record-keeping (notebooks, spreadsheets), which leads to:
*   **Lack of Transparency:** Members don't know the real-time status of the fund or their own standing.
*   **Calculation Errors:** Manual interest computation for loans is prone to mistakes.
*   **Administrative Burden:** Tracking who has paid, who owes what, and enforcing penalties is time-consuming.
*   **Trust Issues:** Without a centralized, immutable ledger, disputes can arise.

This application digitizes the entire process, automating interest calculations, enforcing rules, and providing a transparent dashboard for every member.

## 🚀 Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS (Slate & Emerald Theme)
* **Backend:** Firebase (Firestore Database)
* **Authentication:** Firebase Auth (Email/Password)
* **Hosting:** Firebase Hosting (Recommended)

---

## ✨ Core Features

### 1. Role-Based Access Control (RBAC)
* **Admin:** Full access to all records, approval capabilities (Approve/Reject), and financial tools (Interest Run, Archive).
* **Member:** View personal ledger only. Can request "Hulog" (Savings) or "Utang" (Loans).

### 2. Smart Loan Logic (The "Utang" Engine)
* **Dual Interest Rates:**
    * **3% Interest:** For personal loans by the member.
    * **5% Interest:** For loans taken on behalf of non-members.
* **Immediate Application:** Interest is calculated and added to the balance immediately upon request submission (Logic: `Principal + (Principal * Rate)`).
* **Monthly Compounding:** Admin tool to scan unpaid loans >30 days old and re-apply interest on the *original principal*.

### 3. Payment Processing
* **Partial Payments:** Supports flexible payment amounts.
* **Balance Tracking:** Payment deducts from the running balance.
* **Auto-Closure:** Status updates to `paid` automatically when balance hits 0.

### 4. Fiscal Management
* **Fiscal Year Tracking:** All transactions are tagged with `fiscalYear` (e.g., 2026) to allow for yearly archiving.
* **Starting Balance:** Admins can set carried-over balances from previous years.

---

## 📂 Project Structure

```text
paluwagan-app/
├── src/
│   ├── config/           # Firebase initialization
│   ├── features/         # Logic separated by domain
│   │   ├── auth/         # Login, AuthContext (Role management)
│   │   ├── dashboard/    # Member UI & Forms
│   │   ├── admin/        # Admin Console & Approval Logic
│   │   └── transactions/ # Core Logic (Interest Math, CRUD)
│   ├── layouts/          # Route wrappers
│   └── App.jsx           # Protected Route Definitions

└── tailwind.config.js    # Theme Customization
```

---

## 📝 Changelog

### v1.4.0 - Member Signup Feature
*   **Self-Service Signup:** New users can now create their own accounts with a display name, automatically assigned the "Member" role.
*   **Authentication Flow:** Enhanced Login/Signup UI with toggle functionality and password validation.

### v1.3.0 - PWA Support
*   **Progressive Web App (PWA):** Enable offline capabilities and app installation on mobile/desktop devices. Added Service Worker and Web App Manifest.

### v1.2.0 - Payment Approval & Interactive Tables
*   **Payment Approval Workflow:** "Pay" actions now create a `PAYMENT` request that requires Admin approval before deducting from the loan balance, improving security and validation.
*   **Interactive Transaction Table:** Added column-based filtering (Date, Type, Name, Status) to the Member Dashboard for easier data management.
*   **Admin Dashboard Update:** Integrated approval logic for pending Payment requests.

### v1.1.0 - Usability & Responsiveness Updates
*   **Mobile Responsiveness:** Optimized layouts for mobile devices, ensuring the dashboard and forms are accessible on smaller screens.
*   **Hulog & Utang Totals:** Added a summary display above the Member Dashboard showing total contributions (Hulog) and outstanding loans (Utang) at a glance.
*   **Hulog (Deposit) Feature:** Added interface and logic for members to request deposits (Hulog), mirroring the Utang workflow.

### v1.0.1 - Bug Fixes & Stability
*   **Payment Logic Fix:** Resolved a `ReferenceError` in the payment submission process to ensure reliable transaction recording.
*   **Firebase Permissions:** Updated security rules and `AuthContext` to correctly handle role-based access without permission errors.
*   **Tailwind Integration:** Fixed configuration issues preventing custom theme colors (`bg-primary`, `bg-secondary`) from rendering correctly.

### v1.0.0 - Initial Release
*   Core architecture setup (React + Firebase).
*   Role-Based Access Control (Admin/Member).
*   Loan application and approval system.
*   Automatic interest calculation engine.
