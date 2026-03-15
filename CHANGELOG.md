# 📝 Changelog

All notable changes to this project will be documented in this file.

### v1.11.0 - Members Page Updates
*   **Admin Privacy:** Hid users with the 'ADMIN' role from appearing in the general members list on the Admin Dashboard to prevent clutter and accidental administrative modifications.

### v1.10.0 - Admin Actions Security Check
*   **Admin Actions Modal:** Moved destructive/global actions (Run Monthly Interest, Archive Fiscal Year, Edit Starting Balance) into a dedicated "Admin Actions" modal on the Admin Dashboard.
*   **Accidental Click Prevention:** Requires a deliberate click on the "Admin Actions" button to reveal these tools, reducing the risk of accidental global data modification.
*   **UI/UX Improvements:** Updated Admin Dashboard action buttons with consistent primary, secondary, and danger theme colors.

### v1.9.0 - Admin Email Management & User Migration
*   **Admin Email Editing:** Admins can now update a user's display email in Firestore directly from the Members Page.
*   **Email Edit Modal:** Added a new interactive modal for managing user email addresses with validation.
*   **User Migration Utility:** Created a `migrate-user.js` backend script to facilitate moving user data (profiles, transactions, sub-members) from old accounts to new Google Sign-in accounts.
*   **Security & Maintenance:** 
    *   Integrated `firebase-admin` for secure identity management.
    *   Updated `.gitignore` to exclude sensitive service account keys.

### v1.8.0 - Google Analytics Integration
*   **Analytics Tracking:** Integrated Google Analytics (GA4) for page view tracking.
*   **User Behavior Insights:** Track user navigation patterns and feature usage to improve user experience.

### v1.7.0 - Admin Balance Management
*   **Starting Balance Control:** Admins can now manually set the Starting Fund Balance for any fiscal year, enabling accurate tracking of carried-over cash.
*   **Running Fund Balance:**
    *   **Real-time Calculation:** The Admin Transaction list now calculates and displays the running "Fund Balance" after each transaction.
    *   **Visual Tracking:** Added an "Ending Balance" line item to transaction cards for immediate visibility of cash flow impact.
*   **Security Updates:** Updated `firestore.rules` to secure the new `financial_years` collection.

### v1.6.0 - Transactions & Members Pages
*   **Transactions Page:** Dedicated page for detailed transaction history.
    *   **Admin View:** See all transactions across the system with fiscal year filtering.
    *   **Member View:** See personal and sub-member transactions.
*   **Members Page (Admin):** New management view listing all Main Members and Sub-members.
    *   **Financial Aggregates:** Displays Total Hulog, Utang, and Interest for each member.
    *   **Sub-member Approval:** Admins can now Approve or Reject sub-members created by main users.
*   **Sub-member Security:**
    *   **Status Enforcement:** Rejected members are hidden from selection lists.
    *   **Transaction Blocking:** Prevented creation of Hulog/Utang requests for Pending or Rejected members.

### v1.5.0 - Transaction Details Modal
*   **Detailed View:** Added a modal popup for viewing transaction details without navigating away from the dashboard list.
*   **Information Breakdown:**
    *   **Utang:** Displays Principal, Interest Rate, Total Interest, and Current Balance.
    *   **Payment:** Shows Amount Paid and links to the specific Utang record with its current balance.
    *   **Hulog:** Shows verified deposit amount.
*   **UI/UX Improvement:** Integrated into both **Member** (row click) and **Admin** (card click) dashboards with a darkened background for better focus.

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
