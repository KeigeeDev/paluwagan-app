# API / Service Layer Documentation

This document outlines the core Service Layer functions used in the Paluwagan Application. These services handle all interactions with Firebase Firestore, including business logic for transactions, interest calculations, and member management.

## Transaction Service
**Path:** `src/features/transactions/transactionService.js`

### `requestHulog(uid, amount, displayName, memberId)`
Creates a deposit (HULOG) request.
*   **Parameters:**
    *   `uid` (string): User ID of the requester.
    *   `amount` (number): Amount to deposit.
    *   `displayName` (string): Name of the beneficiary.
    *   `memberId` (string|null): Optional ID for sub-member linkage.
*   **Returns:** `{ success: boolean, error?: any }`

### `requestUtang(uid, amount, beneficiaryType, beneficiaryName, memberId)`
Creates a loan (UTANG) request. Automatically calculates interest based on beneficiary type (3% for members, 5% for non-members) and applies the first month's interest immediately to the balance.
*   **Parameters:**
    *   `uid` (string): User ID of the requester.
    *   `amount` (number): Principal loan amount.
    *   `beneficiaryType` (string): 'member' or 'non-member'.
    *   `beneficiaryName` (string): Name of the beneficiary.
    *   `memberId` (string|null): Optional ID for sub-member linkage.
*   **Returns:** `{ success: boolean, error?: any }`

### `fetchTransactions(userRole, uid, fiscalYear)`
Retrieves transactions from Firestore.
*   **Parameters:**
    *   `userRole` (string): 'admin' or 'member'. Admins see all, others see own.
    *   `uid` (string): User ID (required for non-admins).
    *   `fiscalYear` (number|null): Optional year filter.
*   **Returns:** `Array<TransactionObject>`

### `requestPayment(uid, relatedTransactionId, amount, beneficiaryName, memberId)`
Requests a payment for an existing loan.
*   **Parameters:**
    *   `uid` (string): User ID.
    *   `relatedTransactionId` (string): ID of the Utang being paid.
    *   `amount` (number): Payment amount.
    *   `beneficiaryName` (string): Name of payer.
    *   `memberId` (string|null): Optional ID for sub-member.
*   **Returns:** `{ success: boolean, error?: any }`

### `approvePayment(paymentId)`
**Admin Only.** Approves a pending payment. Deducts the amount from the related Utang balance and marks the payment as approved.
*   **Parameters:**
    *   `paymentId` (string): ID of the payment transaction.
*   **Returns:** `{ success: boolean, error?: any }`

### `runMonthlyInterestCheck()`
**Admin Only.** Scans all active loans (`approved` status) and applies monthly interest if 30 days have passed since the last application.
*   **Returns:** `{ success: boolean, count: number, error?: any }`

### `archiveFiscalYear(year)`
Sets all transactions in a given fiscal year to `isArchived: true`.
*   **Parameters:**
    *   `year` (number): The year to archive.
*   **Returns:** `{ success: boolean, count: number, error?: any }`

### `getStartingBalance(year)` / `setStartingBalance(year, amount)`
Manages the starting treasury balance for a specific fiscal year.

---

## Member Service
**Path:** `src/features/members/memberService.js`

### `addLinkedMember(userId, memberData)`
Adds a sub-member (linked account) to a main user.
*   **Parameters:**
    *   `userId` (string): The main authenticated User ID.
    *   `memberData` (object): partial object containing `{ name, relationship }`.
*   **Returns:** `{ success: boolean, id?: string, error?: any }`

### `getLinkedMembers(userId)`
Fetches all sub-members for a specific user.
*   **Parameters:**
    *   `userId` (string): The main User ID.
*   **Returns:** `Array<MemberObject>`

### `fetchAllMembersWithSubMembers()`
**Admin Only.** Fetches ALL users and their linked sub-members in a flat list (with `type: 'MAIN'` or `type: 'SUB'`).
*   **Returns:** `Array<UserOrMemberObject>`

### `approveSubMember(parentId, subMemberId)` / `rejectSubMember(parentId, subMemberId)`
**Admin Only.** Approves or rejects a sub-member request.
*   **Parameters:**
    *   `parentId` (string): ID of the main user.
    *   `subMemberId` (string): ID of the sub-member.
*   **Returns:** `{ success: boolean, error?: any }`
