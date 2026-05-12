# 📋 Client Brief: Digital Paluwagan System

## 1. Project Overview
The **Digital Paluwagan System** is a premium, role-based financial ledger application designed to digitize the traditional Filipino communal savings (*Hulog*) and loan (*Utang*) model. This platform replaces manual, error-prone record-keeping with a secure, transparent, and automated digital environment.

**Current Version:** v1.11.0  
**Primary Goal:** To provide real-time fiscal transparency and automate administrative overhead for communal fund management.

---

## 2. The Problem Statement
Traditional Paluwagan systems face four critical challenges that this application solves:
*   **Lack of Transparency:** Members often lack visibility into the fund's health or their personal standing.
*   **Administrative Overhead:** Manual tracking of payments, loans, and penalties is time-intensive for administrators.
*   **Calculation Errors:** Computing monthly interest and compounding balances manually leads to disputes.
*   **Trust Gaps:** Without a centralized, immutable ledger, communal trust can be fragile.

---

## 3. Core Features & Value Proposition

### 🔐 Multi-Tier Governance (RBAC)
*   **Administrator:** Complete oversight of treasury, transaction approval, user management, and fiscal year archiving.
*   **Member:** Personalized dashboard to track personal contributions, outstanding loans, and sub-member accounts.

### 💸 Intelligent Loan Engine ("Utang")
*   **Automated Interest:** Immediate 3% (Member) or 5% (Non-Member) interest application upon loan initiation.
*   **Compounding Logic:** A dedicated admin tool to scan and re-apply monthly interest to active loans, ensuring consistent growth.
*   **Flexible Repayment:** Support for partial payments with automatic status updates to `paid` once the balance reaches zero.

### 🏛️ Treasury & Fiscal Management
*   **Real-Time Cash Flow:** Continuous calculation of "Fund Balance" (Total Hulog - Released Loans + Payments).
*   **Fiscal Year Integrity:** Archiving functionality allows for year-end closing, locking historical data while carrying over starting balances.
*   **Sub-member Ecosystem:** Main members can manage accounts for family or friends, expanding the fund's reach while maintaining centralized accountability.

### 📱 Modern User Experience
*   **PWA Ready:** Installable on mobile and desktop for "app-like" access.
*   **Responsive Design:** Optimized for mobile use, allowing members to check balances on the go.
*   **Interactive Ledger:** Searchable and filterable transaction history for deep-dive analysis.

---

## 4. Technical Architecture
Built on a modern, scalable stack to ensure reliability and speed:
*   **Frontend:** React (Vite) for a fast, reactive UI.
*   **Styling:** Tailwind CSS with a custom Slate & Emerald "Financial Premium" theme.
*   **Backend/Database:** Firebase Firestore for real-time document-based data.
*   **Security:** Firebase Auth with role-based Firestore rules to ensure data privacy.
*   **Insights:** Integrated Google Analytics (GA4) to track feature adoption.

---

## 5. Strategic Roadmap & Future Considerations
*   **Google Sign-In Migration:** Transitioning users to secure OAuth-based authentication.
*   **Enhanced Reporting:** Exportable PDF/Excel summaries for fiscal year-end meetings.
*   **Notification System:** Automated SMS/Email alerts for loan approvals and payment reminders.
*   **Treasury Projections:** Predictive analytics for future fund growth based on historical data.

---

**Prepared by:** Antigravity AI  
**Status:** Implementation Ready / Feature Rich
