# Paluwagan App - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Member Guide](#member-guide)
    - [Dashboard Overview](#dashboard-overview)
    - [Requesting a Deposit (Hulog)](#requesting-a-deposit-hulog)
    - [Requesting a Loan (Utang)](#requesting-a-loan-utang)
    - [Viewing Transaction Details](#viewing-transaction-details)
3. [Admin Guide](#admin-guide)
    - [Dashboard Overview](#admin-dashboard-overview)
    - [Approving/Rejecting Transactions](#approvingrejecting-transactions)
    - [Payment Processing](#payment-processing)
    - [Monthly Interest Checks](#monthly-interest-checks)
    - [Fiscal Year Management](#fiscal-year-management)

---

## 1. Getting Started
To access the application, navigate to the deployed URL.
*   **Log In:** Use your registered email and password.
*   **Sign Up:** If you don't have an account, contact an existing Admin to create one or use the Sign-Up page if enabled.

---

## 2. Member Guide

### Dashboard Overview
Upon logging in as a Member, you will see the **Member Dashboard**. This screen displays:
*   **Total Hulog:** Your total accumulated deposits for the current fiscal year.
*   **Total Utang:** Your current outstanding loan balance.
*   **Total Interest:** Interest accumulated on your loans.
*   **Transaction History:** A list of your recent activities.

### Requesting a Deposit (Hulog)
1.  On your dashboard, look for the **"Request Hulog"** or **"+"** button.
2.  Enter the **Amount** you wish to deposit.
3.  Click **Submit**.
4.  The request status will be `Pending` until an Admin approves it (verifies receipt of cash).

### Requesting a Loan (Utang)
1.  Click the **"Request Utang"** button.
2.  Fill in the form:
    *   **Amount:** The principal amount you want to borrow.
    *   **Beneficiary:** Indicate if the loan is for you (**Member**) or a friend/relative (**Non-Member**).
        *   *Note: Member loans have a 3% interest rate; Non-Member loans have 5%.*
3.  Click **Submit**.
4.  The system will immediately calculate the initial balance (Principal + 1st Month Interest).
5.  Wait for Admin approval.

### Viewing Transaction Details
Click on any item in your **Transaction History** list to open the **Transaction Details Modal**.
*   **Green:** Deposits (Hulog)
*   **Red:** Loans (Utang) - Shows interest rate and breakdown.
*   **Blue:** Payments - Shows which loan the payment was for.

---

## 3. Admin Guide

### Admin Dashboard Overview
The Admin Dashboard gives a complete view of the organization's finances:
*   **Treasury Summary:** Total Cash on Hand (Hulog - Released Loans + Payments).
*   **Pending Requests:** Fast access to items needing approval.
*   **All Transactions:** A searchable, filterable list of every transaction in the system.

### Approving/Rejecting Transactions
1.  Locate a transaction with a `Pending` status.
2.  Review the details (Member Name, Amount, Type).
3.  **Approve:** Click to officially record the transaction.
    *   For *Hulog*: Confirms you received the money.
    *   For *Utang*: Confirms you released the cash.
4.  **Reject:** Click if the transaction is invalid or cancelled.

### Payment Processing
When a member hands over cash to pay off a loan:
1.  Go to the specific **Utang** record or use the **Add Payment** feature.
2.  Select the Loan to pay against.
3.  Enter the **Payment Amount**.
4.  Submit. This deducts the amount from the loan's outstanding balance.

### Monthly Interest Checks
The system can automatically apply interest to active loans.
1.  On the Admin Dashboard, look for the **"Run Interest Check"** button.
2.  The system scans all approved loans.
3.  If a loan hasn't had interest applied in >30 days, the system adds the monthly interest (Principal × Rate) to the Balance.

### Fiscal Year Management
*   **Starting Balance:** At the start of the year, set the initial cash on hand.
*   **Archive Year:** At the end of the year, use the **Archive** function to lock all transactions for that year, ensuring historical data remains unchanged while you start fresh for the new year.
