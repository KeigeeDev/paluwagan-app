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
* **Hosting:** Firebase Hosting
* **Analytics:** Google Analytics (GA4)

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

[Click here to view the full Changelog](./CHANGELOG.md)
