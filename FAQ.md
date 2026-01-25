# FAQ & Troubleshooting

## Frequently Asked Questions

### 1. How is interest calculated?
Interest is calculated based on simple monthly interest on the **Principal Amount**.
*   **Member Rate:** 3% per month.
*   **Non-Member Rate:** 5% per month.

*Example:* A ₱1,000 loan for a Member has a ₱30 monthly interest. This is added to your balance every 30 days.

### 2. Why is my loan balance higher than what I borrowed?
The system automatically adds the **first month's interest** immediately upon creation of the loan. This ensures that the interest obligation is recorded even for short-term loans.
*   *Loan Amount:* ₱1,000
*   *Initial Balance:* ₱1,030 (Principal + 1st Month Interest)

### 3. Can I pay a partial amount?
**Yes.** You can pay any amount at any time. The payment will be deducted from your current balance. However, keep in mind that interest is calculated on the *original principal*, so paying partially does not reduce the monthly interest fee until the loan is fully settled.

### 4. What happens when the Fiscal Year ends?
The Admin will "Archive" the fiscal year.
*   Old transactions are locked and saved for history.
*   The system resets for the new year.
*   Your balances (if any) may be carried over as a "Starting Balance" for the next year (managed by Admin).

---

## Troubleshooting

### "Transaction Not Showing"
*   **Check Filters:** Ensure you haven't filtered lists by a specific year or type that excludes your recent transaction.
*   **Check Status:** If you just submitted a request, it will be in the `Pending` tab (for Admins) or show a `Pending` badge (for Members). It won't affect totals until Approved.

### "Login Failed"
*   **Incorrect Password:** Double-check your caps lock.
*   **Account Locked:** If you suspect your account is disabled, contact an Admin.
*   **Network Issue:** Ensure you have an active internet connection, as the app requires Firebase connectivity.

### "Interest Not Updating"
*   Interest is applied strictly every **30 days**. If it has been 29 days since the last update, the system will not add new interest yet.
*   Only **Admins** can trigger the "Run Interest Check" button to force the system to scan and update loans.
