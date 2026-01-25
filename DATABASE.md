# Database Documentation

This application uses **Google Cloud Firestore**, a NoSQL document database. Unlike traditional SQL databases with rigid tables, data is stored in **Collections** containing **Documents**.

## Entity Relationship Diagram (ERD)

Although Firestore is NoSQL, the following diagram represents the logical relationships between the data entities.

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "performs"
    USERS ||--o{ LINKED_MEMBERS : "has sub-members"
    TRANSACTIONS ||--o| TRANSACTIONS : "pays for (if Payment)"
    FINANCIAL_YEARS ||--o{ TRANSACTIONS : "groups by year"

    USERS {
        string uid PK
        string displayName
        string email
        string role "admin | member"
        timestamp createdAt
    }

    LINKED_MEMBERS {
        string id PK
        string parentId FK "refers to USERS.uid"
        string name
        string relationship
        string status "pending | approved | rejected"
        timestamp createdAt
    }

    TRANSACTIONS {
        string id PK
        string uid FK "refers to USERS.uid"
        string type "HULOG | UTANG | PAYMENT"
        number amount
        string status "pending | approved | paid | rejected"
        timestamp date
        number fiscalYear
        boolean isArchived
        string relatedTransactionIdFK "For PAYMENTS: refers to UTANG id"
    }

    FINANCIAL_YEARS {
        string year id PK
        number startingBalance
        number fiscalYear
        timestamp updatedAt
    }
```

---

## Schema Reference

### 1. Collection: `users`
Contains the main authentication profiles and role data.
*   **Path:** `users/{uid}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Unique Authentication ID (from Firebase Auth) |
| `displayName` | String | User's full name |
| `email` | String | User's email address |
| `role` | String | `admin` or `member` |
| `createdAt` | Timestamp | Account creation date |

### 2. Sub-Collection: `members`
Stores linked accounts (sub-members) under a main user.
*   **Path:** `users/{uid}/members/{memberId}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Sub-member's display name |
| `relationship` | String | Relationship to main user (e.g., "Spouse", "Sister") |
| `status` | String | `pending`, `approved`, or `rejected`. Admin controlled. |
| `createdAt` | Timestamp | Date added |

### 3. Collection: `transactions`
The core collection storing all financial records (Deposits, Loans, Payments).
*   **Path:** `transactions/{transactionId}`

#### Common Fields (All Types)
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | User ID of the transaction owner |
| `memberId` | String | (Optional) ID of sub-member if transaction is for them |
| `beneficiaryName` | String | Display name of the person involved |
| `type` | String | `HULOG`, `UTANG`, or `PAYMENT` |
| `amount` | Number | The transaction amount |
| `status` | String | `pending` (needs approval), `approved` (active), `paid` (settled), `rejected` |
| `date` | Timestamp | Transaction date |
| `fiscalYear` | Number | The year this record belongs to (e.g., 2024) |
| `isArchived` | Boolean | If `true`, record is locked (historical) |

#### Type-Specific: `UTANG` (Loan)
| Field | Type | Description |
| :--- | :--- | :--- |
| `beneficiaryType` | String | `member` (3% rate) or `non-member` (5% rate) |
| `interestRate` | Number | Decimal rate (e.g., `0.03` or `0.05`) |
| `principal` | Number | Original borrowed amount |
| `balance` | Number | Current outstanding balance (Principal + Interest - Payments) |
| `totalInterest` | Number | Total accumulated interest over time |
| `lastInterestApplied` | Timestamp | Marker for the last monthly interest calculation |

#### Type-Specific: `PAYMENT`
| Field | Type | Description |
| :--- | :--- | :--- |
| `relatedTransactionId` | String | distinct ID of the `UTANG` transaction being paid |

### 4. Collection: `financial_years`
Stores yearly configuration, specifically the starting treasury balance.
*   **Path:** `financial_years/{year}`

| Field | Type | Description |
| :--- | :--- | :--- |
| `fiscalYear` | Number | The year (e.g., 2026) |
| `startingBalance` | Number | Cash on Hand carried over from previous year |
| `updatedAt` | Timestamp | Last update timestamp |
